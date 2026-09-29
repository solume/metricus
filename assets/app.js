/* Metricus: the question tool on "/". The panel (on the left, or above the answer on a phone: every business the answer names, with its website; a website
   to add), the chat column on the right: the question box, the research as a quiet line, then the answer as one field that
   holds every version behind a small paginator. The field is the editor: change the answer into what you want AI to say, get
   ideas for your website, see how often AI mentions and recommends you. The page runs each step against the Metricus API
   and draws each result as it lands; every action is logged to the site's event log like every other page. */
"use strict";
try { history.scrollRestoration = "manual"; } catch (e) { /* old browsers restore; the load below scrolls to the top anyway */ }
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const host = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch (e) { return u; } };

// ------------------------------------------------------------------ the API and the site's event log
const API = ((document.currentScript && document.currentScript.dataset.api) || "https://metricus-api.slate-harbor-75f9.workers.dev").replace(/\/+$/, "");
const LOGS_URL = "https://metricus-studio-logs.red-hill-a87d.workers.dev/";
const randId = (p) => p + "-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
const store = (area, key, make) => { try { let v = area.getItem(key); if (!v) { v = make(); area.setItem(key, v); } return v; } catch (e) { return make(); } };
const UID = store(localStorage, "metricus_uid", () => (crypto.randomUUID && crypto.randomUUID()) || randId("uid"));
const SID = store(sessionStorage, "metricus_sid", () => (crypto.randomUUID && crypto.randomUUID()) || randId("sid"));
function logEvent(event, details, contact) {                     // the same endpoint, uid, sid and body as every page of the site
  try {
    fetch(LOGS_URL, {method: "POST", headers: {"content-type": "application/json"}, keepalive: true,
      body: JSON.stringify({uid: UID, sid: SID, event: event, value: {contact: contact || "anonymous", details: details || {}}})}).catch(() => {});
  } catch (e) { /* the log never blocks the page */ }
}
const logError = (where, e) => logEvent("METRICUS_ERROR", {where: where, message: String((e && e.message) || e).slice(0, 120)});
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
async function api(path, body, opts) {
  const o = opts || {};
  const init = body === undefined ? {method: "GET"}
    : {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify(Object.assign({uid: UID, bsid: SID}, body))};
  if (o.signal) init.signal = o.signal;
  let r;
  try { r = await fetch(API + path, init); }
  catch (e) { if (e.name === "AbortError") throw e; const err = new Error("The connection dropped. Try again."); err.retry = true; throw err; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const err = new Error(j.error || "That did not work this time. Try again."); err.status = r.status; err.retry = r.status >= 500; throw err; }
  return j;
}
// a dropped call or a server error is sent again (the API answers a repeated step with what it gave the first time)
async function apiRetry(path, body, opts) {
  for (let t = 0; ; t++) {
    try { return await api(path, body, opts); }
    catch (e) { if (!e.retry || t >= 2 || (opts && opts.signal && opts.signal.aborted)) throw e; await sleep(1500 * (t + 1)); }
  }
}


// ------------------------------------------------------------------ state
const S = {
  view: "ask",                 // "ask" (no session) | "asking" (the research develops) | "session" (one open)
  session: null,               // session id
  sess: null,                  // the session as the API shows it, once the answer is in
  job: null,                   // what runs: "ask" | "add" | "rewrite" | "score"
  kind: null,                  // "ask" | "add_url" | "rewrite" | "score" while it runs
  cur: null,                   // the running action: {action_id, kind, host, entity, rid, via, find, target, before, el}
  rid: null, via: null, find: null, entity: "",   // the picked website: a row AI read, an added website (via = its action), or a name whose website is found when you write
  versions: [], vi: 0,         // the answer's versions and the one shown
  drafts: {}, diffOn: {},      // per version: the text as you edited it; whether a rewritten version shows what differs from what you wanted
  pending: false, stopping: false,
  resolving: false, pendingNames: [],
  suggesting: false, undo: null,
  run: 0, ctl: null, t0: 0,    // the running ask: its number (a newer question ends an older loop) and its abort handle
  askFrom: null                // where the question was typed: "box", "second box" or "link" (the box at the end of another page)
};
const WRITER_HINTS = {"550b": "", "120b": "", "inverse": "", "base": ""};
const ASK_HINT = "";
const ADD_HINT = "";
const SIDE_NOTE = "Choose a URL to target, or add one.";
const EDIT_NONE = () => `Pick the target website ${WHERE()}, then edit this answer into what you want AI to say about it.`;
const editLine = (about) => `Edit this answer into what you want AI to say about ${about}.`;
const CITE = /[\[【]\s*(r\d+)[^\]】]*[\]】]/g;                                       // [r11], 【r11】 and the model's 【r11†L1-L20】
const sessionLink = (r) => "#src-" + r;                                              // the session's own catalog
const addedLink = (aid, rid) => (r) => (r === rid ? "#src-" + aid + "-" + r : "#src-" + r);   // an add_url replay: one row is the action's
const linkCites = (html, link) => html.replace(CITE, (m, r) => `<a href="${link(r)}">[${r}]</a>`);   // on escaped text or diff HTML
const cite = (text, link) => linkCites(esc(text), link);
// an answer as prose: the markdown emphasis and heading markers dropped (the design shows plain text)
const plain = (t) => String(t == null ? "" : t).replace(/\*\*/g, "").replace(/^#{1,6}\s+/gm, "");
// titles and snippets come from the trace already HTML-escaped ('wipes &amp; more'); decoded once, then esc() again on the page
const dec = (s) => { const t = document.createElement("textarea"); t.innerHTML = String(s == null ? "" : s); return t.value; };
// contenteditable as plain text where the browser has it (Chrome, Safari, recent Firefox), else the plain editable
const EDIT_MODE = (() => { try { const d = document.createElement("div"); d.contentEditable = "plaintext-only"; return d.contentEditable === "plaintext-only" ? "plaintext-only" : "true"; } catch (e) { return "true"; } })();
const SPARK = '<span class="spark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path class="s1" d="M12 2.5 L13.9 10.1 L21.5 12 L13.9 13.9 L12 21.5 L10.1 13.9 L2.5 12 L10.1 10.1 Z"/><path class="s2" d="M19 2.5 L19.9 5.6 L23 6.5 L19.9 7.4 L19 10.5 L18.1 7.4 L15 6.5 L18.1 5.6 Z"/></svg></span>';                                                   // AI at work: two sparks that breathe and turn
const ICON_PLAIN = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 5h14M3 10h9M3 15h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_DIFF = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 3.5v7M6.5 7h7M6.5 15h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_COPY = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="7" y="7" width="9.5" height="9.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M13 6.5V5.2A1.7 1.7 0 0 0 11.3 3.5H5.2A1.7 1.7 0 0 0 3.5 5.2v6.1A1.7 1.7 0 0 0 5.2 13h1.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

// words removed and added against the original (an LCS on words): only in a -> .del, only in b -> .add, equal words plain.
// Line breaks survive: each word carries the newlines that preceded it, so the right column reads like the left (pre-line).
function diffWords(a, b) {
  const words = (t) => { const w = [], sep = []; String(t || "").replace(/(\s*)(\S+)/g, (m, s, x) => { sep.push(s.replace(/[^\n]/g, "") || " "); w.push(x); }); return [w, sep]; };
  const [A, sepA] = words(a), [B, sepB] = words(b);
  const n = A.length, m = B.length;
  if (n * m > 4000000) return esc(b);                                 // a 1,500-word page against another still gets its diff (a 2M-cell table)
  const L = Array.from({length: n + 1}, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0, del = [], add = [];
  const first = (parts) => (parts.length ? parts[0][0] : " ");
  const join = (parts) => parts.map((p, k) => (k ? p[0] : "") + esc(p[1])).join("");
  const flush = () => {
    if (del.length) { out.push(first(del) + `<span class="del">${join(del)}</span>`); del = []; }
    if (add.length) { out.push(first(add) + `<span class="add">${join(add)}</span>`); add = []; }
  };
  while (i < n && j < m) {
    if (A[i] === B[j]) { flush(); out.push(sepB[j] + esc(B[j])); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { del.push([sepA[i], A[i]]); i++; }
    else { add.push([sepB[j], B[j]]); j++; }
  }
  while (i < n) { del.push([sepA[i], A[i]]); i++; }
  while (j < m) { add.push([sepB[j], B[j]]); j++; }
  flush();
  return out.join("").replace(/^\s+/, "");
}
function paragraphs(text, link) { return plain(text).split(/\n{2,}/).map((p) => `<p>${cite(p, link)}</p>`).join(""); }

// ------------------------------------------------------------------ the answer's markdown: a small renderer and its inverse (the field is edited as rendered text, sent back as markdown)
// inline: **bold**, *italic* / _italic_, `code`, [text](url); then the [rN] citations as links
function mdInline(t, link) {
  let h = esc(t);
  h = h.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, a, u) => `<a href="${u}" target="_blank" rel="noopener">${a}</a>`);
  h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*([^*\n](?:[^*\n]|\*(?!\*))*?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
  h = h.replace(/(^|[\s(])_([^_\s][^_\n]*?)_(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
  return linkCites(h, link);
}
// blocks: headings (as bold lines), - / * / • lists, 1. lists, paragraphs (lines kept, pre-line), blank lines between blocks
// a table row's cells: the outer pipes dropped, split on the pipes that are not escaped (\|)
const TABLE_DELIM = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
function splitRow(line) {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  const cells = []; let cur = "";
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "\\" && t[i + 1] === "|") { cur += "|"; i++; continue; }
    if (t[i] === "|") { cells.push(cur.trim()); cur = ""; continue; }
    cur += t[i];
  }
  cells.push(cur.trim());
  return cells;
}
const isTableStart = (lines, i) => lines[i].includes("|") && i + 1 < lines.length && lines[i + 1].includes("|") && lines[i + 1].includes("-") && TABLE_DELIM.test(lines[i + 1]);
function mdHtml(text, link) {
  const lines = String(text == null ? "" : text).replace(/\r/g, "").split("\n");
  const out = []; let para = [], list = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${para.map((l) => mdInline(l, link)).join("\n")}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((x) => `<li>${mdInline(x, link)}</li>`).join("")}</${list.tag}>`); list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], line = raw.replace(/\s+$/, "");
    let m;
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if (isTableStart(lines, i)) {                                    // a table: as wide as it needs, scrolled sideways inside the field when wider
      flushPara(); flushList();
      const head = splitRow(line), rows = [];
      for (i += 2; i < lines.length && lines[i].trim() && lines[i].includes("|"); i++) rows.push(splitRow(lines[i]));
      i--;
      const cells = (r, tag) => head.map((_, k) => `<${tag}>${mdInline(r[k] || "", link)}</${tag}>`).join("");
      out.push(`<div class="mdtable"><table><thead><tr>${cells(head, "th")}</tr></thead><tbody>${rows.map((r) => `<tr>${cells(r, "td")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if ((m = line.match(/^\s{0,3}#{1,6}\s+(.*)$/))) { flushPara(); flushList(); out.push(`<p><strong>${mdInline(m[1].replace(/\s*#+$/, ""), link)}</strong></p>`); continue; }
    if ((m = line.match(/^\s{0,3}[-*•]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== "ul") { flushList(); list = {tag: "ul", items: []}; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\s{0,3}\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== "ol") { flushList(); list = {tag: "ol", items: []}; } list.items.push(m[1]); continue; }
    if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += " " + line.trim(); continue; }   // a wrapped list item
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  return out.join("") || `<p></p>`;
}
// the field's DOM back to markdown: what the writer and the score get as the target
function nodeMd(n) {
  if (n.nodeType === 3) return n.nodeValue;
  if (n.nodeType !== 1) return "";
  const tag = n.tagName.toLowerCase(), inner = () => Array.from(n.childNodes).map(nodeMd).join("");
  if (tag === "br") return "\n";
  if (tag === "strong" || tag === "b" || tag === "em" || tag === "i") {
    const t = inner(), m = tag === "strong" || tag === "b" ? "**" : "*";
    return t.trim() ? t.match(/^\s*/)[0] + m + t.trim() + m + t.match(/\s*$/)[0] : t;
  }
  if (tag === "code") return "`" + inner() + "`";
  if (tag === "a") { const href = n.getAttribute("href") || ""; return href.startsWith("#") ? inner() : `[${inner()}](${href})`; }
  if (tag === "ul") return Array.from(n.children).map((li) => "- " + nodeMd(li).trim()).join("\n") + "\n\n";
  if (tag === "ol") return Array.from(n.children).map((li, i) => `${i + 1}. ` + nodeMd(li).trim()).join("\n") + "\n\n";
  if (tag === "li") return inner();
  if (tag === "table") {                                             // the rows as they stand after your edits: the first is the header
    const rows = Array.from(n.querySelectorAll("tr")).map((tr) => Array.from(tr.children).map((c) =>
      Array.from(c.childNodes).map(nodeMd).join("").replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").trim()));
    if (!rows.length) return "";
    const w = Math.max(...rows.map((r) => r.length));
    const row = (r) => "| " + Array.from({length: w}, (_, k) => r[k] || "").join(" | ") + " |";
    return [row(rows[0]), "|" + Array(w).fill("---").join("|") + "|", ...rows.slice(1).map(row)].join("\n") + "\n\n";
  }
  if (tag === "p" || tag === "div") return inner().replace(/^\n+|\n+$/g, "") + "\n\n";
  return inner();
}
function htmlToMd(el) { return norm(Array.from(el.childNodes).map(nodeMd).join("").replace(/\u00a0/g, " ")); }
const _canon = document.createElement("div"), _canonCache = new Map();
function canonMd(text) {                                             // the text as the field would give it back unedited
  const k = String(text == null ? "" : text);
  if (!_canonCache.has(k)) { _canon.innerHTML = mdHtml(k, sessionLink); _canonCache.set(k, htmlToMd(_canon)); if (_canonCache.size > 200) _canonCache.delete(_canonCache.keys().next().value); }
  return _canonCache.get(k);
}
const diffPlain = (t) => plain(t).split("\n").filter((l) => !(l.includes("|") && l.includes("-") && TABLE_DELIM.test(l)))
  .map((l) => (/^\s*\|.*\|\s*$/.test(l) ? splitRow(l).join(" · ") : l)).join("\n");
const answerDiff = (before, after) => diffWords(diffPlain(before), diffPlain(after));
// the text of the answer field and of a version, in one shape, so an unedited field reads equal to its version
const norm = (t) => String(t == null ? "" : t).replace(/ /g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

// where the live trace of the running job is drawn (the session's own section)
function T() { return {queries: $("queries"), rows: $("rows"), status: $("status"), readcount: $("readcount"), prefix: "src-"}; }
const setText = (el, text) => { if (el) el.textContent = text; };

// ------------------------------------------------------------------ row and block templates (all escaped)
function traceRowHtml(r, prefix, tags) {
  return `<div class="edit" id="${esc(prefix + r.id)}"><div><p class="where">${esc(dec(r.title) || r.url)}</p>` +
    `<p class="small"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.host || host(r.url))}</a> <span class="muted">${esc(tags)}</span></p>` +
    `<p class="t">${esc(dec(r.snippet))}</p></div></div>`;
}
function queryHtml(query, why) { return `<li>${esc(query)} <span class="small muted">${esc(why || "first search")}</span></li>`; }
function appendHtml(parent, html) { if (!parent) return null; parent.insertAdjacentHTML("beforeend", html); return parent.lastElementChild; }
// the muted span of a trace row gets ", opened" / ", cited" once
function addTag(el, tag) {
  if (!el) return;
  const span = el.querySelector("p.small .muted") || el.querySelector(".small.muted");
  if (!span) return;
  const parts = span.textContent.split(",").map((s) => s.trim());
  if (parts.indexOf(tag) < 0) span.textContent = span.textContent + ", " + tag;
}

// ------------------------------------------------------------------ the rewritten page: one block per written page, its changes marked
function makeCompare(aid, index) {                                  // no caption: the icons (the new page only; copy), the page, then the score box
  const div = document.createElement("div");
  div.className = "result"; div.id = `res-${aid}-${index}`; div.dataset.aid = aid; div.dataset.index = index;
  div.innerHTML = `<p class="acts">` +
    `<button type="button" class="tog" data-mode="plain" aria-label="Show what changed" title="Show what changed">${ICON_DIFF}</button>` +
    `<button type="button" class="cp" aria-label="Copy the new website" title="Copy the new website">${ICON_COPY}</button></p>` +
    `<div class="frame pagediff"><div class="pad"><span class="muted">Writing.</span></div></div>` +
    `<div class="score"><p class="sh">Happy with this website rewrite?</p><div class="btns"><button type="button" class="btn primary sc">Get AI Visibility Score</button></div><div class="working sw" hidden>${SPARK}</div><p class="hint sch"></p><div class="scr"></div></div>`;
  $("results").appendChild(div);
  $("s-compare").hidden = S.view !== "session";
  return div;
}
// the score box of a page block: the two number tables, the one line, the questions, the copy, the 7-day check
const pct = (k, n) => (n ? Math.round(100 * k / n) : 0) + "%";
const inN = (k, n) => `${k} in ${n} answer${n === 1 ? "" : "s"}`;
const flags = (c) => !c ? "not asked" : (c.invalid ? "no usable answer" : (c.recommended ? "recommended" : (c.mentioned ? "mentioned" : "not mentioned")));
const longDate = (iso) => { try { return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"}); } catch (e) { return iso; } };
function numsTable(label, b, a, n) {
  return `<div class="scol"><h3>${esc(label)}</h3><table class="nums"><tr><td class="l">Today</td><td class="n now">${pct(b, n)}</td></tr>` +
    `<tr><td class="l">With your rewritten website</td><td class="n after">${pct(a, n)}</td></tr></table></div>`;
}
function renderScore(block, res, scoreAid) {
  const box = block.querySelector(".score"); if (!box) return;
  const n = res.n || 0, mb = res.mention.before, ma = res.mention.after, rb = res.recommend.before, ra = res.recommend.after;
  const line = (ma > mb || ra > rb)
    ? `You boosted from ${pct(mb, n)} to ${pct(ma, n)} of customer questions that mention you, and from ${pct(rb, n)} to ${pct(ra, n)} that recommend you.`
    : `No boost: ${pct(mb, n)} to ${pct(ma, n)} of customer questions mention you, ${pct(rb, n)} to ${pct(ra, n)} recommend you.`;
  const rem = (S.sess && S.sess.reminders || []).find((r) => r.action_id === scoreAid);
  const uid = "em-" + scoreAid;
  box.innerHTML = `<div class="scores2">${numsTable("How often AI mentions you", mb, ma, n)}${numsTable("How often AI recommends you", rb, ra, n)}</div>` +
    `<p class="boost">${esc(line)}</p>` +
    `<h3>What next?</h3><p>Update your live website with the new text.</p>` +
    (rem ? `<p class="hint remh">We check ${esc(rem.host || res.host || "your website")} again on ${esc(longDate(rem.due))}. Then we email the scores to ${esc(rem.email)}.</p>`
         : `<p>In 7 days, we check it again. Then we email you the scores.</p>` +
           `<div class="field-row"><label class="f" for="${uid}">Your email</label><input class="input em" id="${uid}" type="email" autocomplete="email"></div>` +
           `<div class="btns" style="margin-top:12px"><button type="button" class="btn primary rem" data-score="${esc(scoreAid)}">Email me the scores</button></div><p class="hint remh"></p>`);
}

async function startScore(block) {
  const aid = block.dataset.aid, index = parseInt(block.dataset.index || "0", 10), sid = S.session;
  const hint = block.querySelector(".sch"), sw = block.querySelector(".sw");
  S.kind = "score"; S.job = "score"; S.cur = {kind: "score", el: block};
  hint.textContent = ""; if (sw) sw.hidden = false;
  render();
  const t0 = Date.now();
  try {
    const sc = await api(`/v1/s/${sid}/score`, {action_id: aid, index: index});
    const cells = [];
    for (let q = 0; q < sc.n; q++) for (const which of ["before", "after"]) cells.push([q, which]);
    let result = null;
    const one = async ([q, which]) => { const r = await apiRetry(`/v1/s/${sid}/cell`, {score_id: sc.score_id, q: q, which: which}); if (r.result) result = r.result; };
    const failed = [];
    await Promise.all(cells.map((c) => one(c).catch(() => failed.push(c))));          // every answer at once
    for (const c of failed) { if (S.session !== sid) return; await one(c).catch(() => null); }   // what dropped, once more
    if (S.session !== sid) return;
    if (!result) throw new Error("The score did not finish this time. Try again.");
    S.lastScore = result;
    if (S.sess) S.sess.actions = (S.sess.actions || []).concat([{action_id: sc.score_id, kind: "score", status: "done", request: {action_id: aid, index: index}, result: result}]);
    renderScore(block, result, sc.score_id);
    logEvent("METRICUS_SCORE", {host: result.host || "", mentioned: pct(result.mention.before, result.n) + " to " + pct(result.mention.after, result.n),
                                recommended: pct(result.recommend.before, result.n) + " to " + pct(result.recommend.after, result.n), seconds: Math.round((Date.now() - t0) / 1000)});
  } catch (e) { if (S.session === sid) { hint.textContent = e.message; logError("score", e); } }
  finally { if (sw) sw.hidden = true; if (S.kind === "score") { S.kind = null; S.cur = null; S.job = null; } render(); }
}
document.addEventListener("click", (e) => {
  const sc = e.target.closest(".result .sc");
  if (sc) { const block = sc.closest(".result"); if (block && S.session) guarded(() => startScore(block)); return; }
  const rem = e.target.closest(".result .rem");
  if (rem) {
    const block = rem.closest(".result"), em = block.querySelector(".em"), h = block.querySelector(".remh");
    const email = em ? em.value.trim() : "";
    api(`/v1/s/${S.session}/remind`, {email: email, action_id: rem.dataset.score || null})
      .then((rec) => {
        if (S.sess) S.sess.reminders = (S.sess.reminders || []).concat([rec]);
        const sa = ((S.sess && S.sess.actions) || []).find((x) => x.action_id === rec.action_id);
        renderScore(block, (sa && sa.result) || S.lastScore, rec.action_id);
        logEvent("METRICUS_REMIND", {host: rec.host || ""}, email);
      })
      .catch((err) => { h.textContent = err.message; });
  }
});
function pageDiffHtml(before, after) { return before ? diffWords(plain(before), plain(after)) : esc(plain(after)); }
function setPage(block, before, after) {
  block.dataset.before = before || ""; block.dataset.after = after || "";
  const tog = block.querySelector(".tog"), mode = tog ? tog.dataset.mode : "diff";
  block.querySelector(".pagediff .pad").innerHTML = mode === "plain" ? esc(plain(after)) : pageDiffHtml(before, after);
}
document.addEventListener("click", (e) => {                         // the toggle on a page block: the page with its changes marked, or the new page as it reads
  const t = e.target.closest(".result .tog"); if (!t) return;
  const block = t.closest(".result");
  t.dataset.mode = t.dataset.mode === "diff" ? "plain" : "diff";
  const diffNow = t.dataset.mode === "diff";
  t.setAttribute("aria-label", diffNow ? "Show the new website only" : "Show what changed"); t.title = t.getAttribute("aria-label"); t.classList.toggle("on", diffNow);
  setPage(block, block.dataset.before, block.dataset.after);
});
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    try { const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; }
    catch (e2) { return false; }
  }
}
document.addEventListener("click", async (e) => {                   // the copy icon on a page block: the new page as text
  const c = e.target.closest(".result .cp"); if (!c) return;
  const block = c.closest(".result");
  const ok = await copyText(plain(block.dataset.after || ""));
  c.classList.toggle("ok", ok); c.title = ok ? "Copied" : "Could not copy"; c.setAttribute("aria-label", c.title);
  setTimeout(() => { c.classList.remove("ok"); c.title = "Copy the new website"; c.setAttribute("aria-label", c.title); }, 1600);
});
function foldOlder() {                                                // state, not history: only the newest page stays open
  const blocks = Array.from($("results").querySelectorAll(":scope > .result"));
  if (blocks.length <= 1) return;
  let d = $("results").querySelector(":scope > details.older");
  if (!d) { d = document.createElement("details"); d.className = "older"; d.innerHTML = "<summary></summary>"; $("results").insertBefore(d, $("results").firstChild); }
  blocks.slice(0, -1).forEach((b) => d.appendChild(b));
  d.querySelector("summary").textContent = `Earlier website rewrites (${d.querySelectorAll(".result").length})`;
}

// ------------------------------------------------------------------ the answer field: every version behind a paginator, the field is the editor
// a version: {kind: natural | page | rewrite, label, text, link, entity, host, aid, rid, index, target, cited_page, invalid}
function rewriteHost(res, view) {
  if (res.found && res.found.host) return res.found.host;
  if (res.via) { const a = (view.actions || []).find((x) => x.action_id === res.via); const row = a && a.result && a.result.row; if (row) return row.host || host(row.url || ""); }
  const row = (view.catalog || []).find((c) => c.id === res.rid);
  return row ? (row.host || host(row.url || "")) : "";
}
function versionsOf(view) {
  const vs = [{kind: "natural", label: "What AI says today", text: view.answer || "", link: sessionLink, entity: null, host: null, aid: null}];
  (view.actions || []).forEach((a) => {
    const res = a.result; if (!res) return;
    if (a.kind === "rewrite") {
      const h = rewriteHost(res, view), target = res.target != null ? res.target : (a.request || {}).target || "";
      (res.rows || []).forEach((row) => {
        if (row.answer == null) return;
        vs.push({kind: "rewrite", label: `With your rewritten ${h || "website"}`, text: row.answer, target: target, link: sessionLink, entity: res.entity || null, host: h, aid: a.action_id, index: row.index, cited_page: row.cited_page, invalid: row.invalid});
      });
    }
  });
  return vs;
}
function fieldText() { return $("answertext").classList.contains("diff") ? canonMd(S.drafts[S.vi] != null ? S.drafts[S.vi] : (S.versions[S.vi] || {}).text) : htmlToMd($("answertext")); }
function versionLabel(v, edited) {
  let s = v.label;
  if (v.kind === "rewrite") s += v.invalid ? ". No usable answer." : (v.cited_page ? ". Cites the website." : ". Does not cite the website.");
  return edited ? s + " · edited" : s;
}
// the page keeps still while the field changes: whatever sits under the field stays where it is on screen (the browser's own scroll
// anchoring is missing in Safari), corrected every frame while the field's height eases to its new size
function anchorDuring(el, ms) {
  let last = el.getBoundingClientRect().top; const t0 = performance.now();
  const step = () => {
    const now = el.getBoundingClientRect().top;
    if (Math.abs(now - last) > 0.5) window.scrollBy({top: now - last, left: 0, behavior: "instant"});   // instant: a smooth scroll would compound
    last = el.getBoundingClientRect().top;
    if (performance.now() - t0 < ms) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// the field's content swapped with continuity: its height eases from the old to the new, the new text fades in
function swapField(el, html) {
  const h0 = el.offsetHeight;
  const below = $("answer").getBoundingClientRect().top < 0;         // the reader is under the field: keep what they look at in place
  el.innerHTML = html;
  const h1 = el.offsetHeight;
  if (Math.abs(h1 - h0) < 2) { el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade"); return; }
  el.style.height = h0 + "px"; el.style.overflow = "hidden";
  void el.offsetWidth;
  el.style.transition = "height .32s ease";
  el.style.height = h1 + "px";
  el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade");
  if (below) anchorDuring($("s-target"), 380);
  setTimeout(() => { el.style.transition = ""; el.style.height = ""; el.style.overflow = ""; }, 340);
}
function showVersion(i, animate) {
  const vs = S.versions;
  if (!vs.length) { $("answertext").innerHTML = `<p class="muted">Not answered yet.</p>`; $("pager").hidden = true; $("vdiff").hidden = true; $("vnum").title = ""; return; }
  S.vi = Math.max(0, Math.min(i, vs.length - 1));
  const v = vs[S.vi], draft = S.drafts[S.vi], edited = draft != null && norm(draft) !== canonMd(v.text);
  const text = draft != null ? draft : v.text;
  const canDiff = v.kind === "rewrite" && !!v.target && !edited;
  const diff = canDiff && (S.diffOn[S.vi] != null ? S.diffOn[S.vi] : false);   // the differences only when asked for
  const el = $("answertext");
  el.contentEditable = diff ? "false" : EDIT_MODE;
  el.classList.toggle("diff", diff);
  const html = text ? (diff ? `<p>${linkCites(answerDiff(v.target, text), v.link)}</p>` : mdHtml(text, v.link)) : `<p class="muted">Not answered yet.</p>`;
  if (animate) swapField(el, html); else el.innerHTML = html;
  $("pager").hidden = vs.length <= 1;
  $("vnum").textContent = `${S.vi + 1}/${vs.length}`;
  $("vprev").disabled = S.vi === 0; $("vnext").disabled = S.vi >= vs.length - 1;
  $("vdiff").hidden = !canDiff;
  $("vdiff").classList.toggle("on", diff); $("vdiff").dataset.mode = diff ? "diff" : "plain";
  $("vdiff").title = diff ? "Show the answer only" : "Show what differs from what you wanted"; $("vdiff").setAttribute("aria-label", $("vdiff").title);
  $("unsuggest").hidden = !(S.undo && S.undo.vi === S.vi && S.view === "session");
  updateWriteState();
  $("vnum").title = versionLabel(v, edited); $("pager").setAttribute("aria-label", versionLabel(v, edited));   // the version's name on hover only
}
function pushVersion(v, show) { S.versions.push(v); if (show) showVersion(S.versions.length - 1, true); else showVersion(S.vi); }
$("vprev").addEventListener("click", () => showVersion(S.vi - 1, true));
$("vnext").addEventListener("click", () => showVersion(S.vi + 1, true));
$("vdiff").addEventListener("click", () => { const v = S.versions[S.vi]; if (!v) return; const on = S.diffOn[S.vi] != null ? S.diffOn[S.vi] : false; S.diffOn[S.vi] = !on; showVersion(S.vi); });
$("answertext").addEventListener("mousedown", () => {                // a click into the marked answer: the marks go, the caret lands, you edit
  if ($("answertext").classList.contains("diff")) { S.diffOn[S.vi] = false; showVersion(S.vi); }
});
$("answertext").addEventListener("input", () => {
  const v = S.versions[S.vi]; if (!v) return;
  if (S.undo) { S.undo = null; $("unsuggest").hidden = true; }
  const t = fieldText();
  if (norm(t) === canonMd(v.text)) delete S.drafts[S.vi]; else S.drafts[S.vi] = t;
  updateWriteState();
  $("vnum").title = versionLabel(v, S.drafts[S.vi] != null);
  $("vdiff").hidden = !(v.kind === "rewrite" && v.target && S.drafts[S.vi] == null);
});
function resetAnswer() { S.versions = []; S.vi = 0; S.drafts = {}; S.diffOn = {}; showVersion(0); }

// ------------------------------------------------------------------ the trace card (collapsible steps, like a chat assistant's research view)
const TR = {steps: [], rows: {}, running: false, t0: null, total: null, timer: null, expanded: false};
function traceReset() {
  TR.steps = []; TR.rows = {}; TR.running = false; TR.t0 = null; TR.total = null; TR.expanded = false;
  if (TR.timer) { clearInterval(TR.timer); TR.timer = null; }
  $("tracesteps").innerHTML = ""; $("tracelabel").textContent = "Planning the first search."; $("tracetime").textContent = "";
  $("trace").classList.remove("done", "expanded");
}
function traceStart() {
  traceReset(); TR.running = true; TR.t0 = Date.now();
  $("answerwrap").hidden = true;                                   // nothing under the trace until the answer arrives
  TR.timer = setInterval(() => { if (TR.running) $("tracetime").textContent = `${Math.round((Date.now() - TR.t0) / 1000)} s`; }, 1000);
  traceRender();
}
function traceAdd(step) { TR.steps.push(step); traceRender(); }
function traceLast(kind) { for (let i = TR.steps.length - 1; i >= 0; i--) if (!kind || TR.steps[i].kind === kind) return TR.steps[i]; return null; }
function traceDone(total) {
  TR.running = false; TR.total = total; if (TR.timer) { clearInterval(TR.timer); TR.timer = null; }
  $("trace").classList.add("done"); $("trace").classList.remove("expanded"); TR.expanded = false;
  $("tracelabel").textContent = traceSummary(); $("tracetime").textContent = total != null ? `${Math.round(total)} s` : "";
  $("tracechev").textContent = "›";
}
function traceSummary() {
  const n = TR.steps.filter((x) => x.kind === "search").length, o = TR.steps.filter((x) => x.kind === "open" && x.ok !== false).length;
  const pages = Object.keys(TR.rows).length;
  return `${n} search${n === 1 ? "" : "es"}; read the first 300 words of ${pages} website${pages === 1 ? "" : "s"}${o ? `, and ${o} of them in full` : ""}.`;
}
function stepLabel(x) {
  if (x.kind === "search") return `Searching: ${x.query || ""}`;
  if (x.kind === "open") return `Opening ${x.host || x.id || "a website"}.`;
  if (x.kind === "answer") return "Writing the answer.";
  return x.text || "";
}
function favicon(h) { return `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(h)}&amp;sz=32" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`; }
function resultRowHtml(r) {
  const h = r.host || host(r.url);
  return `<div class="rrow"${r.id ? ` id="${esc("src-" + r.id)}"` : ""}>${favicon(h)}<span class="t"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(dec(r.title) || r.url)}</a></span><span class="h">${esc(h)}</span></div>`;
}
function stepHtml(x, i, openIt) {
  if (x.kind === "search") {
    const rows = (x.ids || []).map((id) => TR.rows[id]).filter(Boolean);
    const has = rows.length > 0;
    return `<div class="step${has ? " has" : ""}${openIt && has ? " open" : ""}" data-i="${i}"><div class="line"><span class="k">${x.stage === "plan" || x.origin === "user" ? "Searched" : "Searched again"}</span>` +
      `<span class="q">${esc(x.query || "")}${x.why ? ` <span class="why">${esc(x.why)}</span>` : ""}</span><span class="chev">${has ? (openIt ? "⌄" : "›") : ""}</span></div>` +
      `<div class="body">${rows.map(resultRowHtml).join("") || '<p class="small muted">No new websites.</p>'}</div></div>`;
  }
  if (x.kind === "open") {
    const r = TR.rows[x.id] || {};
    const has = !!(r.snippet || x.url);
    return `<div class="step${has ? " has" : ""}${openIt && has ? " open" : ""}" data-i="${i}"><div class="line"><span class="k">Opened</span>` +
      `<span class="q">${esc(dec(r.title) || x.host || x.id || "")}${x.ok === false ? ' <span class="why">(could not be opened)</span>' : ""}${x.why ? ` <span class="why">${esc(x.why)}</span>` : ""}</span><span class="chev">${has ? (openIt ? "⌄" : "›") : ""}</span></div>` +
      `<div class="body">${r.url || x.url ? resultRowHtml({url: r.url || x.url, title: r.title || x.host, host: x.host || r.host}) : ""}${r.snippet ? `<p class="small muted">${esc(dec(r.snippet))}</p>` : ""}</div></div>`;
  }
  if (x.kind === "answer") return `<div class="step" data-i="${i}"><div class="line"><span class="k">Answered</span><span class="q thought">${x.words ? `${x.words} words` : ""}${x.s != null ? ` in ${Math.round(x.s)} s` : ""}</span></div></div>`;
  return `<div class="step" data-i="${i}"><div class="line"><span class="q thought">${esc(x.text || "")}</span></div></div>`;
}
function traceRender() {
  const openIdx = TR.running ? TR.steps.length - 1 : -1;            // while it runs the newest step is open, the rest folded
  $("tracesteps").innerHTML = TR.steps.map((x, i) => stepHtml(x, i, i === openIdx)).join("");
  if (TR.running) { const last = traceLast(); $("tracelabel").textContent = last ? stepLabel(last) : "Planning the first search."; $("tracechev").textContent = "⌄"; }
}
document.addEventListener("click", (e) => {                       // a [rN] citation: unfold the trace step that holds that page, then scroll to it
  const a = e.target.closest('a[href^="#src-"]'); if (!a) return;
  const el = document.getElementById(a.getAttribute("href").slice(1)); if (!el) return;
  const step = el.closest(".step");
  if (step) {
    if ($("trace").classList.contains("done") && !TR.expanded) { TR.expanded = true; $("trace").classList.add("expanded"); $("tracechev").textContent = "⌄"; }
    if (!step.classList.contains("open")) { step.classList.add("open"); const c = step.querySelector(".chev"); if (c) c.textContent = "⌄"; }
  }
  e.preventDefault(); el.scrollIntoView({behavior: "smooth", block: "center"});
  el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1200);
});
$("traceh").addEventListener("click", () => {
  if (!$("trace").classList.contains("done")) return;
  TR.expanded = !TR.expanded; $("trace").classList.toggle("expanded", TR.expanded); $("tracechev").textContent = TR.expanded ? "⌄" : "›";
});
$("tracesteps").addEventListener("click", (e) => {
  const line = e.target.closest(".line"); if (!line) return;
  const step = line.closest(".step"); if (!step || !step.classList.contains("has")) return;
  step.classList.toggle("open"); line.querySelector(".chev").textContent = step.classList.contains("open") ? "⌄" : "›";
});
function traceFromView(view) {
  traceReset();
  (view.catalog || []).forEach((r) => { TR.rows[r.id] = r; });
  TR.steps = (view.steps || []).map((x) => ({...x, host: x.host || (x.url ? host(x.url) : "")}));
  traceRender();                                                   // the folded list must exist before the card is marked done
  traceDone(view.total_s);
}

// ------------------------------------------------------------------ views
function render() {
  const v = S.view;
  $("s-ask").hidden = false;
  $("landing").hidden = v !== "ask";                            // the landing only under the box before a session starts
  if (v !== "ask" && $("tutorial") && !$("tutorial").paused) { $("tutorial").dataset.auto = String(performance.now()); $("tutorial").pause(); }   // never plays on behind the tool
  $("main").classList.toggle("home", v === "ask");
  $("s-trace").hidden = !(v === "asking" || v === "session");
  ["s-sources", "s-target"].forEach((id) => { $(id).hidden = v !== "session"; });
  $("s-compare").hidden = v !== "session" || !$("results").children.length;
  $("writework").hidden = !(S.job && S.kind === "rewrite");      // AI at work on the page: the spark, no words
  $("ask").className = "send" + (S.job === "ask" ? " busy" : "");           // while a job runs the arrow is the stop icon
  $("ask").title = S.job === "ask" ? "Stop" : "Ask AI"; $("ask").setAttribute("aria-label", $("ask").title);
  const busy = !!S.job || S.pending;
  document.querySelectorAll("button").forEach((b) => {           // the paginator, the toggles, the copy and the panel's fold stay live while a job runs
    if (b.id === "ask") { b.disabled = S.job === "ask" ? S.stopping : S.pending; return; }
    if (b.id === "unsuggest" || b.classList.contains("pg") || b.classList.contains("tog") || b.classList.contains("cp") || b.classList.contains("sidetog")) return;
    b.disabled = busy;
  });
  $("suggest").hidden = !(v === "session" && (S.rid || S.find) && S.versions.length);
  $("suggest").disabled = busy || S.suggesting;
  $("unsuggest").hidden = !(S.undo && S.undo.vi === S.vi && v === "session");
  updateWriteState();
  document.querySelectorAll("input[type=radio]").forEach((r) => { r.disabled = busy; });
}


function route() {
  const h = location.hash || "";
  if (/^#(src|res|page)-/.test(h)) return;                         // an in-page anchor (a citation, a result block): the view stays
  if (h.startsWith("#s=")) {
    const id = h.slice(3);
    if (S.session === id && (S.sess || S.job)) return;               // this session is on the page already
    openFromLink(id);
    return;
  }
  if (h === "#q") {                                                 // the bar's button on any other page: "/" with the box ready to type
    history.replaceState(null, "", location.pathname);
    if (S.job !== "ask") { S.view = "ask"; render(); }
    focusQ();
    return;
  }
  if (S.job === "ask") return;
  S.view = "ask"; render();
}
// a link to a session: opened as it stands; a run this browser started and left goes on where it stopped
async function openFromLink(id) {
  let view;
  try { view = await api(`/v1/s/${encodeURIComponent(id)}?uid=${encodeURIComponent(UID)}`); }
  catch (e) { $("askhint").textContent = e.message || "This session is not available."; history.replaceState(null, "", location.pathname); S.view = S.sess ? "session" : "ask"; render(); return; }
  if (view.phase === "failed" && !view.answer) { $("askhint").textContent = "That question did not get an answer. Ask it again."; $("q").value = view.query || ""; growQ(); history.replaceState(null, "", location.pathname); S.view = "ask"; render(); return; }
  if (view.owner && !["done", "failed", "hints"].includes(view.phase)) { continueAsk(view); return; }
  openSession(view); window.scrollTo({top: 0});
  if (!view.owner) return;
  if (view.phase === "hints") { S.job = "ask"; S.kind = "ask"; render(); runSteps(view.id, view.seq); }
  else resolvePending(view);
}
function continueAsk(view) {
  beginAsk(view.query || "");
  S.session = view.id; S.job = "ask"; S.kind = "ask"; S.t0 = Date.now();
  (view.catalog || []).forEach((r) => { TR.rows[r.id] = r; });
  TR.steps = (view.steps || []).map((x) => ({...x, host: x.host || (x.url ? host(x.url) : "")}));
  traceRender();
  history.replaceState(null, "", "#s=" + view.id);
  render();
  runSteps(view.id, view.seq);
}


// the fields ask() clears before a session's trace develops
function clearTrace(query) {
  ["queries", "rows", "results", "entities", "added"].forEach((id) => { $(id).innerHTML = ""; });
  ["readcount", "status", "counts"].forEach((id) => { $(id).textContent = ""; });
  resetAnswer();
  $("youq").textContent = query;
  $("host").textContent = "";
}
// the new session's view at once: the question, the trace line with the spark; nothing of the last session stays
function beginAsk(query) {
  S.undo = null; $("sughint").textContent = "";
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();   // the box lets go of the focus once the question is sent
  window.scrollTo({top: 0});
  S.sess = null; S.session = null; S.rid = null; S.via = null; S.find = null; S.entity = ""; S.kind = "ask"; S.cur = null; S.resolving = false; traceStart();
  history.replaceState(null, "", location.pathname);
  clearTrace(query);
  $("askhint").textContent = ASK_HINT;
  S.view = "asking"; setWriteLabel(); render();
}

// ------------------------------------------------------------------ the ask: one call per step, each step's results drawn as they land
async function runSteps(sid, seq) {
  const run = ++S.run;
  const ctl = new AbortController(); S.ctl = ctl;
  for (;;) {
    if (run !== S.run) return;                                        // a newer question took over
    let r;
    try { r = await apiRetry(`/v1/s/${sid}/next`, {seq: seq}, {signal: ctl.signal}); }
    catch (e) {
      if (run !== S.run) return;
      if (e.name === "AbortError") { endAsk("Stopped.", true); return; }
      logError("ask", e); endAsk(e.message, true); return;
    }
    if (run !== S.run) return;
    seq++;
    for (const ev of r.events || []) {
      if (ev.type === "error") { logError("ask", ev.error); endAsk(ev.error, true); return; }
      if (ev.type === "view") { onView(ev.view); continue; }
      if (ev.type === "resolving") { S.resolving = true; S.pendingNames = ev.names || []; if (S.sess) $("counts").textContent = "Looking up the sites."; continue; }
      onEvent(ev);
    }
    if (r.done) break;
    if (S.stopping) { ctl.abort(); endAsk("Stopped.", true); return; }
  }
  endAsk(null, false);
  if (S.pendingNames.length) resolveNames(sid, S.pendingNames);
}
function onView(view) {                                               // the answer is in: the panel opens while the sites are looked up
  if (S.kind === "ask") traceDone(view.total_s);
  if (S.sess && S.sess.id === view.id) syncSession(view); else openSession(view);
  logEvent("METRICUS_ANSWER", {seconds: Math.round((Date.now() - S.t0) / 1000), names: (view.entities || []).length});
}
function endAsk(error, failed) {
  S.stopping = false; S.ctl = null;
  if (failed) {
    $("askhint").textContent = error || "Failed.";
    if (TR.running) { traceDone(null); $("tracelabel").textContent = error === "Stopped." ? "Stopped." : "Failed."; }
    S.resolving = false;
    if (!S.sess) { S.view = "ask"; S.session = null; history.replaceState(null, "", location.pathname); }
    else S.view = "session";
  }
  S.job = null; S.kind = null; S.cur = null;
  render();
}
async function resolveNames(sid, names) {                             // each name's website, four at a time
  S.resolving = true;
  if (S.sess) $("counts").textContent = "Looking up the sites.";
  const queue = names.slice(), missing = [];
  const worker = async () => {
    while (queue.length) {
      const name = queue.shift();
      if (S.session !== sid) return;
      try {
        const r = await api(`/v1/s/${sid}/resolve`, {name: name});
        if (S.session !== sid) return;
        if (r.missing) missing.push(name); else onEvent({type: "resolved", entity: r.entity, url: r.url, host: r.host});
      } catch (e) { missing.push(name); }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  if (S.session !== sid) return;
  onEvent({type: "resolved_all", missing: missing});
}
function resolvePending(view) {
  const names = (view.pending || []).filter((n) => !((view.found || {})[n] || {}).url);
  if (names.length) resolveNames(view.id, names);
}

// ------------------------------------------------------------------ opening a session (when the answer is in, or from a link)
function openSession(view) {
  S.undo = null; $("sughint").textContent = "";
  S.sess = view; S.session = view.id; S.view = "session"; S.rid = null; S.via = null; S.find = null;
  traceFromView(view);
  $("answerwrap").hidden = false;
  $("youq").textContent = view.query || "";
  $("queries").innerHTML = (view.searches || []).map((s) => queryHtml(s.query, s.why)).join("");
  $("rows").innerHTML = "";
  $("readcount").textContent = ""; $("status").textContent = "";
  $("entities").innerHTML = (view.entities || []).map(entityHtml).join("") || '<p class="small muted">AI did not shortlist any option; add your target website below.</p>';
  $("counts").textContent = SIDE_NOTE;
  $("added").innerHTML = "";
  (view.actions || []).forEach((a) => {
    if (a.kind === "add_url" && a.result && a.result.row && (a.status === "done" || a.status === "stopped")) addAddedRow(a.action_id, a.result.row);
  });
  $("entity").value = ""; S.entity = "";
  S.versions = versionsOf(view); S.vi = 0; S.drafts = {}; S.diffOn = {};
  showVersion(S.versions.length - 1);
  $("results").innerHTML = "";
  (view.actions || []).forEach(drawResult);
  foldOlder();
  $("editline").textContent = EDIT_NONE(); setWriteLabel();
  $("addurl").value = ""; $("addentity").value = "";
  $("askhint").textContent = ASK_HINT; $("addhint").textContent = ADD_HINT; $("writehint").textContent = "";
  render();
  if (location.hash !== "#s=" + view.id) location.hash = "#s=" + view.id;
}
// the session's view again after the sites were looked up: the rows keep their pick, the answer field keeps your edits
function syncSession(view) {
  if (!S.sess) return;
  S.sess.found = view.found || {}; S.sess.entities = view.entities || []; S.sess.actions = view.actions || S.sess.actions;
  (view.entities || []).forEach((e) => { if (e.found && e.found.url) addEntityLink(e.name, e.found.url, e.found.host); });
  $("counts").textContent = SIDE_NOTE;
}
const siteOf = (u) => { try { const x = new URL(u); return x.origin + "/"; } catch (e) { return u; } };   // the link opens the site's front page
function urlRow(id, value, attrs, name, url) {                    // one compact row: a radio, the name, and a small gray link to the site
  const h = url ? host(url) : "";
  return `<label class="cand" id="${esc(id)}"><input type="radio" name="rid" value="${esc(value)}"${attrs}>` +
    `<span class="t"><span class="nm" title="${esc(name)}">${esc(name)}</span>${url ? `<a class="u" href="${esc(siteOf(url))}" target="_blank" rel="noopener">${esc(h)}</a>` : ""}</span></label>`;
}
function entityHtml(e) {
  const cat = S.sess ? (S.sess.catalog || []) : [];
  if (e.main) {
    const main = cat.find((c) => c.id === e.main) || {};
    return urlRow("ent-" + e.key, e.main, ` data-via="" data-entity="${esc(e.name)}" data-host="${esc(main.host || "")}"`, e.name, main.url || "");
  }
  const url = e.found ? e.found.url : "";
  return urlRow("ent-" + e.key, "", ` data-via="" data-entity="${esc(e.name)}" data-find="${esc(e.name)}" data-host="${esc(e.found ? e.found.host || "" : "")}"`, e.name, url);
}
function addEntityLink(name, url, h) {                            // a name's row gets its link once its site is known
  const ent = Array.from(document.querySelectorAll("#entities .cand")).find((x) => x.querySelector("input") && x.querySelector("input").dataset.find === name);
  if (!ent) return;
  const t = ent.querySelector(".t");
  if (!t.querySelector("a")) t.insertAdjacentHTML("beforeend", `<a class="u" href="${esc(siteOf(url))}" target="_blank" rel="noopener">${esc(h || host(url))}</a>`);
  ent.querySelector("input").dataset.host = h || host(url);
}
function addAddedRow(aid, row) {
  return appendHtml($("added"), urlRow("src-" + aid + "-" + row.id, row.id, ` data-via="${esc(aid)}" data-entity="${esc(row.entity || "")}" data-host="${esc(row.host || host(row.url || ""))}"`, row.entity || row.host || host(row.url), row.url));
}

// one page block per rewrite on reopen; the live handlers build the same DOM step by step. An added page is a version of the answer, not a block.
function drawResult(a) {
  const aid = a.action_id, res = a.result;
  const unfinished = a.status === "running" ? "Not finished." : (a.status === "error" ? (a.error || "Failed.") : (a.status === "stopped" ? "Stopped." : null));
  if (a.kind === "score") {
    const req = a.request || {}, block = $(`res-${req.action_id}-${req.index || 0}`);
    if (!block) return;
    if (res && a.status === "done") { S.lastScore = res; renderScore(block, res, aid); }
    else { const h = block.querySelector(".sch"); if (h) h.textContent = unfinished || ""; }
    return;
  }
  if (a.kind !== "rewrite") return;
  const rows = res ? (res.rows || []) : [], before = res ? res.page_before || "" : "";
  rows.forEach((row) => { setPage(makeCompare(aid, row.index), before, row.page); });
  if (!rows.length) { const b = makeCompare(aid, 0); b.querySelector(".pagediff .pad").innerHTML = `<span class="muted">${esc(unfinished || "No website rewrite was written.")}</span>`; b.querySelector(".score").hidden = true; }
}

// ------------------------------------------------------------------ the SSE handlers
const STAGE_TEXT = {plan: "Planning the first search.", triage: "Reading the results.", answer: "Writing the answer.", observer: "Sorting the websites it read."};
function onEvent(ev) {
  const t = T();
  switch (ev.type) {
    case "stage": {
      if (S.kind === "ask" && ev.status === "end" && !ev.error) {
        const p = ev.parsed || {};
        if (ev.name === "plan") traceAdd({kind: "search", stage: "plan", query: p.query, why: null, s: ev.s, ids: []});
        else if (ev.name === "triage") { const names = (p.shortlist || []).map((n) => { n = String(n).trim(); if (/^r\d+$/.test(n)) { const r = TR.rows[n]; return r ? dec(r.title).slice(0, 60) : n; } return n.split(/\s+[(–—-]\s*|\s\(|:\s/)[0].trim(); }).filter(Boolean); traceAdd({kind: "thought", stage: "triage", text: names.length ? `Shortlisted ${names.join(", ")}.` : "Read the results.", s: ev.s}); }
        else if (String(ev.name).startsWith("verify")) {
          if (p.action === "search") traceAdd({kind: "search", stage: ev.name, query: p.query, why: p.why, s: ev.s, ids: []});
          else if (p.action === "fetch") traceAdd({kind: "open", stage: ev.name, id: p.id, why: p.why, s: ev.s, url: null, host: "", ok: null});
          else traceAdd({kind: "thought", stage: ev.name, text: p.why || (p.action === "done" ? "Research done." : ""), s: ev.s, done: p.action === "done"});
        } else if (ev.name === "answer") traceAdd({kind: "answer", s: ev.s});
      }
      if (ev.status === "start") setText(t.status, STAGE_TEXT[ev.name] || (String(ev.name).startsWith("verify") ? "Deciding the next step." : `Step ${ev.name}.`));
      else if (ev.error) setText(t.status, `Step ${ev.name} failed: ${ev.error}`);
      else if (ev.parsed && ev.parsed.action === "done") setText(t.status, "Research done.");
      break;
    }
    case "search": {
      if (S.kind === "ask" && ev.origin === "user") traceAdd({kind: "search", stage: "discover", origin: "user", query: ev.query, why: ev.why, s: null, ids: []});   // the user's own words, a step of its own
      appendHtml(t.queries, queryHtml(ev.query, ev.stage === "discover" ? null : ev.why));
      setText(t.status, `Searching for ${ev.query}.`);
      break;
    }
    case "results": {
      if (S.kind === "ask") { (ev.rows || []).forEach((r) => { TR.rows[r.id] = r; }); const st = traceLast("search"); if (st) { st.ids = (st.ids || []).concat((ev.rows || []).map((r) => r.id)); if (!st.query) st.query = ev.query; } traceRender(); }
      (ev.rows || []).forEach((r) => appendHtml(t.rows, traceRowHtml(r, t.prefix, r.id)));
      if (t.readcount) setText(t.readcount, `${ev.n_total} websites read so far (the first 300 words of each).`);
      setText(t.status, ev.hits === 0 ? "No results for that search." : `Read ${ev.fetched} of ${ev.hits} websites.`);
      break;
    }
    case "opened": {
      if (S.kind === "ask") { const st = traceLast("open"); if (st && (st.id === ev.id || !st.url)) { st.url = ev.url; st.host = ev.host; st.ok = ev.ok; st.words = ev.words; st.id = ev.id; } traceRender(); }
      addTag(document.getElementById(t.prefix + ev.id), "opened");
      setText(t.status, ev.ok ? `Opened ${ev.id}, ${ev.words} words.` : `${ev.id} could not be opened.`);
      break;
    }
    case "answer": {
      if (S.kind === "ask") {
        { const st = traceLast("answer"); if (st) { st.words = ev.words; st.s = ev.s; } }
        $("answerwrap").hidden = false;
        S.versions = [{kind: "natural", label: "What AI says today", text: ev.text || "", link: sessionLink, entity: null, host: null, aid: null}]; S.vi = 0; S.drafts = {}; S.diffOn = {};
        showVersion(0);
        (ev.cited || []).forEach((id) => addTag(document.getElementById(t.prefix + id), "cited"));
        setText(t.status, `Answered in ${ev.s} s.`);
      }
      break;
    }
    case "resolving": { S.resolving = true; if (S.sess) $("counts").textContent = "Looking up the sites."; break; }
    case "resolved": {                                         // a name's site is known: its row gets the link
      if (S.sess) { S.sess.found = S.sess.found || {}; S.sess.found[ev.entity] = Object.assign(S.sess.found[ev.entity] || {}, {name: ev.entity, url: ev.url, host: ev.host}); }
      addEntityLink(ev.entity, ev.url, ev.host);
      if (S.find === ev.entity) { $("editline").textContent = editLine(ev.host); setWriteLabel(); }   // picked before its address was known
      break;
    }
    case "resolved_all": {
      S.resolving = false;
      $("counts").textContent = SIDE_NOTE + ((ev.missing || []).length ? ` No website found for ${ev.missing.join(", ")}.` : "");
      break;
    }
    case "source_added": {
      if (S.cur && ev.entity) S.cur.entity = ev.entity;        // the name the server used (the reopened block reads the same one)
      if (S.kind === "add_url" && S.cur && ev.row) {
        S.cur.rid = ev.row.id; S.cur.host = ev.row.host || host(ev.row.url); S.cur.url = ev.row.url;
        const el = addAddedRow(ev.action_id, {...ev.row, entity: S.cur.entity || ev.entity || ev.row.entity});
        const inp = el && el.querySelector("input"); if (inp) inp.checked = true;
        S.find = null; S.rid = ev.row.id; S.via = ev.action_id; S.entity = S.cur.entity || ev.entity || ""; $("entity").value = S.entity;
        $("host").textContent = S.cur.host;
        $("editline").textContent = editLine(S.cur.host || S.entity); setWriteLabel();
      }
      break;
    }
    case "baseline": {                                         // the picked name's page is now in front of AI as it is: one more version of the answer
      if (S.sess) { S.sess.found = S.sess.found || {}; S.sess.found[ev.entity] = Object.assign(S.sess.found[ev.entity] || {}, {name: ev.entity, url: ev.url, rid: ev.rid, host: ev.host, answer: ev.answer, action_id: ev.action_id}); }
      if (S.cur) S.cur.host = ev.host;
      addEntityLink(ev.entity, ev.url, ev.host);
      $("editline").textContent = editLine(ev.host || ev.entity);
      break;
    }
    case "page_before": { if (S.cur) S.cur.before = ev.text; break; }
    case "written": {
      let b = $(`res-${ev.action_id}-${ev.index}`);
      if (S.cur && ev.before) S.cur.before = ev.before;
      const before = S.cur ? (S.cur.before || "") : (ev.before || "");
      if (!b) b = makeCompare(ev.action_id, ev.index);
      foldOlder();
      setPage(b, before, ev.text);
      break;
    }
    case "replayed": {
      if (S.kind === "add_url" && S.cur) {
        const cur = S.cur;
        if (S.sess) {
          const a = (S.sess.actions || []).find((x) => x.action_id === cur.action_id);
          const res = {answer: ev.answer, rid: cur.rid, url: cur.url || "", entity: cur.entity, row: (a && a.result && a.result.row) || {id: cur.rid, host: cur.host, url: cur.url || ""}};
          if (a) { a.status = "done"; a.result = Object.assign(a.result || {}, res); } else S.sess.actions.push({action_id: cur.action_id, kind: "add_url", status: "done", result: res});
        }
        $("addhint").textContent = ADD_HINT;
        break;
      }
      if (S.kind === "rewrite") {
        const h = S.cur ? (S.cur.host || "") : "";
        pushVersion({kind: "rewrite", label: `With your rewritten ${h || "website"}`, text: ev.answer, target: S.cur ? S.cur.target : "", link: sessionLink, entity: S.cur ? S.cur.entity : null,
                     host: h, aid: ev.action_id, index: ev.index, cited_page: ev.cited_page, invalid: ev.invalid}, true);
      }
      break;
    }
    case "prompts": { break; }
    case "scored": { break; }                                  // the spark alone says AI is at work, no count
    case "score_done": { if (S.kind === "score" && S.cur && S.cur.el) { const sw = S.cur.el.querySelector(".sw"); if (sw) sw.hidden = true; } break; }
    case "note": {
      setText(t.status, ev.text);
      // an add's notes stay out of sight: the spark in the answer's toolbar says AI is at work
      // a rewrite's notes stay out of sight: the spark under the button says AI is at work
      // a score's notes stay out of sight: the spark and the count say AI is at work
      break;
    }
    default: break;
  }
}

// one POST at a time from the page: a second click while the first is in flight is ignored (the server also answers 409)
async function guarded(fn) {
  if (S.job || S.pending) return;
  S.pending = true; render();
  try { await fn(); } finally { S.pending = false; render(); }
}

// a new question always starts a new session: whatever runs is stopped, the last session's view is cleared at once

// a new question always starts a new session: whatever runs is left behind, the last session's view is cleared at once
async function ask() {
  const query = $("q").value.trim();
  if (!query) { $("askhint").textContent = "Ask a question."; return; }
  S.run++;
  if (S.ctl) { try { S.ctl.abort(); } catch (e) { /* gone */ } S.ctl = null; }
  S.job = null; S.stopping = false;
  beginAsk(query);
  logEvent("METRICUS_ASK", {q: query.slice(0, 600), from: S.askFrom || "box", ref: S.askFrom === "link" ? document.referrer.slice(0, 300) : ""});
  S.askFrom = null;
  let r;
  try { r = await api("/v1/ask", {q: query}); }
  catch (e) { traceDone(null); $("tracelabel").textContent = "Failed."; $("askhint").textContent = e.message; S.kind = null; S.view = "ask"; render(); logError("ask", e); return; }
  S.session = r.sid; S.job = "ask"; S.kind = "ask"; S.t0 = Date.now();
  history.replaceState(null, "", "#s=" + r.sid);                     // a reload goes on with this run
  render();
  runSteps(r.sid, 0);
}
function askNow() { if (S.pending) return; S.pending = true; render(); ask().finally(() => { S.pending = false; render(); }); }
$("ask").addEventListener("click", () => { if (S.job === "ask") stopJob(); else askNow(); });
$("q").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); askNow(); } });   // Enter sends, Shift+Enter a new line
// the question box grows with its text, one line at first (a chat box), and scrolls past the CSS max-height
function growQ() { const q = $("q"); q.style.height = "auto"; const h = q.scrollHeight; q.style.height = Math.max(52, h) + "px"; q.style.overflowY = h > 230 ? "auto" : "hidden"; }
$("q").addEventListener("input", growQ);
window.addEventListener("load", growQ);
// the second box at the end of the landing sends the same way (its text goes into the box at the top)
function askFrom2() { S.askFrom = "second box"; $("q").value = $("q2").value; $("q2").value = ""; growQ(); askNow(); }
$("ask2").addEventListener("click", askFrom2);
$("q2").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); askFrom2(); } });
["choice-ask", "choice-score"].forEach((id) => $(id).addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: "smooth"}); $("q").focus(); }));

function stopJob() {
  if (S.job !== "ask" || S.stopping) return;
  S.stopping = true; render();
  $("askhint").textContent = "Stopping.";
  if (S.ctl) { try { S.ctl.abort(); } catch (e) { /* gone */ } }
}
// the pick: a name (its page found and put in front of AI when you write, unless it already was), a page AI read, or a page you added
function pickHost() {
  if (!S.sess) return "";
  if (S.find) { const f = (S.sess.found || {})[S.find]; return f && f.host ? f.host : ""; }
  if (S.via) { const a = (S.sess.actions || []).find((x) => x.action_id === S.via); const row = a && a.result && a.result.row; return row ? (row.host || host(row.url || "")) : ""; }
  const row = (S.sess.catalog || []).find((c) => c.id === S.rid) || {};
  return row.host || host(row.url || "");
}
function setWriteLabel() {                                          // the button names the picked target website once its address is known
  const h = S.sess ? pickHost() : "";
  $("write").textContent = h ? `Get Ideas For Optimizing ${h} AI Visibility` : "Get Ideas For Optimizing AI Visibility";
}
function pickRow(e) {
  const r = e.target;
  if (!r || r.name !== "rid" || !S.sess) return;
  let name;
  if (r.dataset.find) { name = r.dataset.find; S.rid = null; S.via = null; S.find = name; }
  else {
    S.find = null; S.rid = r.value; S.via = r.dataset.via || null; name = r.dataset.entity || "";
    if (!S.via && !name) { const row = (S.sess.catalog || []).find((c) => c.id === S.rid) || {}; name = row.entity_name || row.entity || ""; }
  }
  const h = r.dataset.host || pickHost();
  S.entity = name; $("entity").value = name;
  $("editline").textContent = editLine(h || name || "this website");
  $("host").textContent = h;
  setWriteLabel(); render();                                        // the controls that depend on a pick (Suggest improvements)
  logEvent("METRICUS_PICK", {host: h || "", name: name || ""});
}
$("entities").addEventListener("change", pickRow);
$("added").addEventListener("change", pickRow);

async function addSource() {
  if (!S.session) { $("addhint").textContent = "Ask a question first."; return; }
  const url = $("addurl").value.trim();
  if (!url) { $("addhint").textContent = "Add a website address."; return; }
  const entity = $("addentity").value.trim() || null, sid = S.session;
  S.kind = "add_url"; S.job = "add";
  S.cur = {kind: "add_url", host: host(url), url: url, entity: entity, rid: null, target: "", before: null};
  $("addhint").textContent = "";
  render();
  try {
    const r = await api(`/v1/s/${sid}/add`, {url: url, entity: entity});
    if (S.session !== sid) return;
    onEvent({type: "source_added", action_id: r.action_id, row: r.row, entity: r.entity});
    if (S.sess) S.sess.actions = (S.sess.actions || []).concat([{action_id: r.action_id, kind: "add_url", status: "done", result: {url: r.row.url, rid: r.row.id, row: r.row, entity: r.entity}}]);
    $("addurl").value = ""; $("addentity").value = "";
    logEvent("METRICUS_ADD", {host: r.row.host || host(r.row.url || "")});
  } catch (e) { if (S.session === sid) $("addhint").textContent = e.message; }
  finally { if (S.kind === "add_url") { S.kind = null; S.cur = null; S.job = null; } render(); }
}
$("add").addEventListener("click", () => guarded(addSource));
// the write button looks greyed out until a target is picked and the answer is edited; a click then wiggles it and says why
const WRITE_NEED_PICK = () => `Pick the target website ${WHERE()} first.`;
const WRITE_NEED_EDIT = "The AI response has to be edited so that Metricus can optimize the website accordingly.";
function writeBlock() { if (!S.rid && !S.find) return WRITE_NEED_PICK(); if (S.drafts[S.vi] == null) return WRITE_NEED_EDIT; return null; }
function updateWriteState() {
  const why = writeBlock(), b = $("write");
  b.classList.toggle("dim", !!why); b.setAttribute("aria-disabled", why ? "true" : "false");
  const h = $("writehint").textContent;
  if ((h === WRITE_NEED_PICK() || h === WRITE_NEED_EDIT) && h !== why) $("writehint").textContent = "";   // the reason is gone: so is the line
}
function wiggle(el) { el.classList.remove("wiggle"); void el.offsetWidth; el.classList.add("wiggle"); }
$("write").addEventListener("click", () => {
  const why = writeBlock();
  if (why) { wiggle($("write")); $("writehint").textContent = why; return; }
  guarded(writeNow);
});
async function writeNow() {
  if (!S.session) { $("writehint").textContent = "Ask a question first."; return; }
  const entity = $("entity").value.trim() || null, target = fieldText(), sid = S.session;
  S.kind = "rewrite"; S.job = "rewrite";
  S.cur = {kind: "rewrite", entity: entity, rid: S.rid, via: S.via || null, find: S.find || null, target: target, host: pickHost(), before: null};
  $("writehint").textContent = "";
  render();
  const t0 = Date.now();
  logEvent("METRICUS_WRITE", {host: S.cur.host || ""});
  try {
    const w = await api(`/v1/s/${sid}/write`, {rid: S.rid, via: S.via || null, find: S.find || null, target: target, entity: entity});
    if (S.session !== sid) return;
    S.cur.action_id = w.action_id;
    if (w.host) S.cur.host = w.host;
    if (w.found && S.sess) { S.sess.found = S.sess.found || {}; S.sess.found[w.found.name] = w.found; addEntityLink(w.found.name, w.found.url, w.found.host); }
    onEvent({type: "page_before", text: w.before});
    onEvent({type: "written", action_id: w.action_id, index: w.index, text: w.text, before: w.before});
    const action = {action_id: w.action_id, kind: "rewrite", status: "running", request: {rid: S.cur.rid, via: S.cur.via, find: S.cur.find, target: target},
                    result: {rid: S.cur.rid, via: S.cur.via, found: w.found || null, target: target, page_before: w.before, entity: entity, host: w.host, rows: [{index: w.index, page: w.text}]}};
    if (S.sess) S.sess.actions = (S.sess.actions || []).concat([action]);
    const rp = await apiRetry(`/v1/s/${sid}/replay`, {action_id: w.action_id, index: w.index});
    if (S.session !== sid) return;
    Object.assign(action.result.rows[0], {answer: rp.answer, cited: rp.cited, cited_page: rp.cited_page, invalid: rp.invalid});
    action.status = "done";
    onEvent({type: "replayed", action_id: w.action_id, index: w.index, answer: rp.answer, cited: rp.cited, cited_page: rp.cited_page, invalid: rp.invalid});
    logEvent("METRICUS_WRITTEN", {host: S.cur.host || "", seconds: Math.round((Date.now() - t0) / 1000)});
  } catch (e) { if (S.session === sid) { $("writehint").textContent = e.message; logError("write", e); } }
  finally { if (S.kind === "rewrite") { S.kind = null; S.cur = null; S.job = null; } render(); }
}
// "Suggest improvements": the answer shown, with small changes that present the picked target better, placed in the field as your edit
$("suggest").addEventListener("click", async () => {
  if (!S.session || S.suggesting || (!S.rid && !S.find) || !S.versions.length) return;
  const vi = S.vi, before = S.drafts[vi];
  S.suggesting = true; $("sughint").textContent = ""; $("sugwork").hidden = false; render();
  try {
    const r = await api(`/v1/s/${S.session}/suggest`, {text: fieldText(), rid: S.rid, via: S.via || null, find: S.find || null, entity: S.entity || null});
    logEvent("METRICUS_SUGGEST", {host: r.host || pickHost() || ""});
    S.undo = {vi: vi, draft: before};
    S.drafts[vi] = norm(r.text);
    showVersion(vi, true);
  } catch (e) { $("sughint").textContent = e.message; }
  finally { S.suggesting = false; $("sugwork").hidden = true; render(); }
});
$("unsuggest").addEventListener("click", () => {                   // back to the text before the suggestion
  if (!S.undo) return;
  const u = S.undo; S.undo = null;
  if (u.draft == null) delete S.drafts[u.vi]; else S.drafts[u.vi] = u.draft;
  showVersion(u.vi, true); render();
});

// the panel folds to its icon and back; open by default, the choice kept in this browser
function setSide(open) {
  $("s-sources").classList.toggle("closed", !open);
  $("sidetog").title = open ? "Hide the panel" : "Show the panel"; $("sidetog").setAttribute("aria-label", $("sidetog").title);
  try { localStorage.setItem("live.side", open ? "open" : "closed"); } catch (e) { /* no storage: open each time */ }
}
$("sidetog").addEventListener("click", () => setSide($("s-sources").classList.contains("closed")));
(() => { let v = "open"; try { v = localStorage.getItem("live.side") || "open"; } catch (e) { v = "open"; } setSide(v !== "closed"); })();

$("navhome").addEventListener("click", (e) => {                   // the name in the bar: the landing, at its top (a running job keeps its view)
  e.preventDefault();
  if (S.job) return;
  S.view = "ask"; S.sess = null; S.session = null;
  history.replaceState(null, "", location.pathname);
  render(); window.scrollTo({top: 0, behavior: "instant"});
});

// on a phone the panel (the names and the box to add a website) sits in the page, right above the answer; on a wide screen it is the column on the left
const NARROW = window.matchMedia("(max-width: 900px)");
const WHERE = () => (NARROW.matches ? "above" : "on the left");
function placePanel() {
  const panel = $("s-sources"), slot = $("panel-slot"), layout = $("layout");
  if (!panel || !slot || !layout) return;
  if (NARROW.matches) { if (panel.parentNode !== slot) slot.appendChild(panel); }
  else if (panel.parentNode !== layout) layout.insertBefore(panel, layout.firstChild);
  if (S.versions.length && !S.rid && !S.find) $("editline").textContent = EDIT_NONE();
  if ($("writehint").textContent.startsWith("Pick the target website")) $("writehint").textContent = WRITE_NEED_PICK();
}
if (NARROW.addEventListener) NARROW.addEventListener("change", placePanel); else NARROW.addListener(placePanel);
placePanel();

// ------------------------------------------------------------------ the event log: every click, edit and view, so a visit can be rebuilt
// (the answers, the rewritten websites, the suggestions and the scores are logged by the API itself, with the same uid and sid)
const logState = () => ({session: S.session || "", version: S.versions.length ? S.vi + 1 : 0, of: S.versions.length, target: pickHost() || ""});
document.addEventListener("click", (e) => {
  const t = e.target;
  const hit = (sel) => t.closest(sel);
  let el;
  if ((el = hit("#vprev, #vnext"))) setTimeout(() => logEvent("METRICUS_VERSION", Object.assign(logState(), {to: S.vi + 1, kind: (S.versions[S.vi] || {}).kind || ""})), 0);
  else if (hit("#vdiff")) setTimeout(() => logEvent("METRICUS_ANSWER_DIFF", Object.assign(logState(), {on: !!S.diffOn[S.vi]})), 0);
  else if ((el = hit(".result .tog"))) logEvent("METRICUS_WEBSITE_DIFF", Object.assign(logState(), {on: el.dataset.mode !== "diff"}));
  else if ((el = hit(".result .cp"))) logEvent("METRICUS_COPY_WEBSITE", logState());
  else if (hit(".result .sc")) logEvent("METRICUS_SCORE_CLICK", logState());
  else if (hit("#write")) logEvent("METRICUS_WRITE_CLICK", Object.assign(logState(), {blocked: writeBlock() || "", target_text: writeBlock() ? "" : fieldText().slice(0, 8000)}));
  else if (hit("#suggest")) logEvent("METRICUS_SUGGEST_CLICK", logState());
  else if (hit("#unsuggest")) logEvent("METRICUS_UNDO_SUGGESTION", logState());
  else if (hit("#add")) logEvent("METRICUS_ADD_CLICK", Object.assign(logState(), {url: $("addurl").value.trim().slice(0, 300), name: $("addentity").value.trim().slice(0, 100)}));
  else if (hit("#ask")) { if (S.job === "ask") logEvent("METRICUS_STOP", logState()); }
  else if (hit("#traceh")) setTimeout(() => logEvent("METRICUS_TRACE_OPEN", Object.assign(logState(), {open: $("trace").classList.contains("expanded")})), 0);
  else if ((el = hit("#tracesteps .step"))) logEvent("METRICUS_TRACE_STEP", Object.assign(logState(), {step: el.dataset.i, text: (el.querySelector(".line") || el).textContent.trim().slice(0, 200)}));
  else if ((el = hit('a[href^="#src-"]'))) logEvent("METRICUS_CITE_CLICK", Object.assign(logState(), {id: el.getAttribute("href").slice(5)}));
  else if (hit("#sidetog")) setTimeout(() => logEvent("METRICUS_PANEL", Object.assign(logState(), {open: !$("s-sources").classList.contains("closed")})), 0);
  else if ((el = hit("#choice-ask, #choice-score"))) logEvent("METRICUS_LANDING_CHOICE", {which: el.id === "choice-ask" ? "Ask" : "AI Visibility Score"});
  else if ((el = hit("details.faq summary"))) logEvent("METRICUS_FAQ_OPEN", {question: el.textContent.trim().slice(0, 200)});
  else if (hit("#navhome")) logEvent("METRICUS_HOME_CLICK", logState());
  else if (hit("#navcta")) logEvent("METRICUS_NAV_CTA", Object.assign(logState(), {label: ($("navcta").innerText || "").trim().slice(0, 60)}));
  else if ((el = hit("a[href]"))) {
    const href = el.getAttribute("href") || "";
    if (/^https?:/.test(href)) logEvent("METRICUS_LINK_OUT", Object.assign(logState(), {url: href.slice(0, 300), where: el.closest("#entities, #added") ? "panel" : (el.closest("#tracesteps") ? "research" : (el.closest("#answertext") ? "answer" : "page"))}));
  }
}, true);
document.addEventListener("change", (e) => {                       // a pick in the panel (the name and its website)
  const r = e.target;
  if (r && r.name === "rid") logEvent("METRICUS_PICK", Object.assign(logState(), {name: r.dataset.entity || r.dataset.find || "", host: r.dataset.host || "", kind: r.dataset.find ? "name" : (r.dataset.via ? "added" : "read")}));
}, true);
const tut = $("tutorial");     // the example video first under the tool: it plays muted once three quarters of it are on screen, once,
if (tut) {                     // and waits when it leaves; "Sound on" unmutes it where it is; its end card leads up to the question box.
  const snd = $("tutorial-sound"), toBox = $("tutorial-tobox"), endHit = $("tutorial-endhit");   // What the visitor does is logged,
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;                           // the page's own muted plays are not
  let own = false, engaged = false, quarter = 0, seekTimer = null, soundTimer = null;
  const at = () => Math.round(tut.currentTime * 10) / 10;
  const byPage = () => performance.now() - Number(tut.dataset.auto || 0) < 800;      // a play, pause or seek the page just made
  const page = (fn) => { tut.dataset.auto = String(performance.now()); fn(); };
  const endAt = () => Number(tut.dataset.endcard) || (tut.duration || 0) - 5;
  const atEnd = () => tut.ended || (tut.duration > 0 && tut.currentTime >= endAt());
  const pills = () => { const e = atEnd(); toBox.hidden = endHit.hidden = !e; snd.hidden = e || !tut.muted || tut.paused; };
  if (!calm && "IntersectionObserver" in window) new IntersectionObserver((es) => {
    const r = es[es.length - 1].intersectionRatio;
    if (own || tut.ended || $("landing").hidden) return;
    if (r >= 0.75 && tut.paused) page(() => tut.play().catch(() => {}));              // blocked (a phone's low power mode): the poster stays
    else if (r < 0.35 && !tut.paused) page(() => tut.pause());
  }, {threshold: [0, 0.35, 0.75]}).observe(tut);
  snd.addEventListener("click", () => { own = engaged = true; page(() => { tut.muted = false; }); pills(); logEvent("METRICUS_VIDEO_SOUND_ON", {at: at()}); });
  const up = (from) => { logEvent("METRICUS_VIDEO_TO_BOX", {at: at(), from: from}); if (!tut.paused) page(() => tut.pause()); focusQ(); };
  toBox.addEventListener("click", () => up("button"));
  endHit.addEventListener("click", () => up("end card"));
  tut.addEventListener("playing", pills);
  tut.addEventListener("play", () => { if (!byPage()) { own = engaged = true; logEvent("METRICUS_VIDEO_PLAY", {at: at(), muted: tut.muted}); } });
  tut.addEventListener("pause", () => {
    pills();
    if (!byPage() && !tut.ended) { own = true; logEvent("METRICUS_VIDEO_PAUSE", {at: at()}); }
  });
  tut.addEventListener("timeupdate", () => {
    pills();
    if (!engaged) return;
    const q = tut.duration ? Math.floor((4 * tut.currentTime) / tut.duration) : 0;
    if (q > quarter && q < 4) { quarter = q; logEvent("METRICUS_VIDEO_PROGRESS", {quarter: q, at: at(), muted: tut.muted}); }
  });
  tut.addEventListener("ended", () => { pills(); quarter = 0; if (engaged) logEvent("METRICUS_VIDEO_END", {muted: tut.muted}); });
  tut.addEventListener("seeked", () => {
    pills();
    if (byPage()) return;
    clearTimeout(seekTimer); seekTimer = setTimeout(() => { own = engaged = true; logEvent("METRICUS_VIDEO_SEEK", {to: at()}); }, 600);
  });
  tut.addEventListener("volumechange", () => {
    pills();
    if (byPage()) return;
    clearTimeout(soundTimer);
    soundTimer = setTimeout(() => { own = engaged = true; logEvent("METRICUS_VIDEO_SOUND", {muted: tut.muted, volume: Math.round(tut.volume * 100) / 100}); }, 600);
  });
}
let editTimer = null;                                              // the answer as edited, once typing pauses for 3 s
$("answertext").addEventListener("input", () => {
  clearTimeout(editTimer);
  editTimer = setTimeout(() => { if (S.versions.length) logEvent("METRICUS_EDIT", Object.assign(logState(), {text: fieldText().slice(0, 8000)})); }, 3000);
});

function focusQ() {                                                // the question box, the cursor in it
  window.scrollTo({top: 0, behavior: "instant"});
  const q = $("q");
  q.focus({preventScroll: true});
  const n = q.value.length;
  try { q.setSelectionRange(n, n); } catch (e) { /* not a text field */ }
}
if ($("navcta")) $("navcta").addEventListener("click", (e) => {    // the bar's button on "/" itself: the box, focused in the click
  e.preventDefault();
  if (location.hash) history.replaceState(null, "", location.pathname);
  if (!S.job) { S.view = "ask"; S.sess = null; S.session = null; render(); }
  focusQ();
});
window.addEventListener("hashchange", route);
window.scrollTo(0, 0);                                              // every load starts at the top (the view is built after the load)
(() => {
  const q = new URLSearchParams(location.search).get("q");          // a question from the box at the end of any page goes straight in
  if (q && q.trim()) {
    history.replaceState(null, "", location.pathname);
    $("q").value = q.trim().slice(0, 600); growQ(); S.askFrom = "link"; askNow();
    return;
  }
  route();
})();
