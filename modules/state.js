/**
 * state.js — Shared state + simple event bus
 *
 * Exports: bus, state, ucParam
 *
 * bus.on(event, fn)   — subscribe
 * bus.off(event, fn)  — unsubscribe
 * bus.emit(event, data) — publish
 *
 * state.uc      — current use-case key ('brand' | 'coding' | 'data')
 * state.content — resolved content object for current UC
 * state.tier    — selected pricing tier key
 */

// ── Event bus ──
const listeners = {};

export const bus = {
  on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
  },
  off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(function (f) { return f !== fn; });
  },
  emit(event, data) {
    (listeners[event] || []).forEach(function (fn) { fn(data); });
  },
};

// ── Shared state ──
const params = new URLSearchParams(window.location.search);

export const state = {
  uc:      params.get('uc') || 'brand',
  tier:    params.get('tier') || 'deepdive',
  email:   params.get('email') || '',
  content: null, // set by app.js after content loads
};

/** Build a uc= query prefix (empty string for default 'brand') */
export function ucParam() {
  return state.uc !== 'brand' ? 'uc=' + state.uc + '&' : '';
}
