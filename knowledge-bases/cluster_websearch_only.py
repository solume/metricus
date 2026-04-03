#!/usr/bin/env python3
"""
Cluster using ONLY web-search-originated queries.
Sources: R1+R2 cluster files, R3 extracted, R4 websearch files.
NO manually written prompts.
"""

import re
import os
from collections import defaultdict

STOP_WORDS = {
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','it','as','be','was','are','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might',
    'can','shall','not','no','so','if','than','that','this','these','those',
    'then','there','here','when','where','who','what','which','how','why',
    'about','into','through','during','before','after','above','below',
    'between','up','down','out','off','over','under','again','further',
    'once','each','every','all','both','few','more','most','other','some',
    'such','only','own','same','too','very','just','also','even','still',
    'already','almost','really','actually','much','many','like','well',
    'get','got','gets','getting','my','your','our','i','me','we','you',
    'they','them','their','its','vs','vs.','does','don','doesn','didn',
    'won','isn','aren','wasn','weren','hasn','haven','hadn','wouldn',
    'couldn','shouldn','need','help','way','make','know','think','see',
    'use','work','try','want','let','should','take','give','go','come',
}

def load_queries_from_cluster_file(filepath):
    queries = []
    if not os.path.exists(filepath):
        return queries
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line.startswith('- `') and line.endswith('`'):
                q = line[3:-1].strip()
                if q:
                    queries.append(q)
    return queries

def load_lines(filepath):
    queries = []
    if not os.path.exists(filepath):
        return queries
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('---'):
                if line.startswith('- '):
                    line = line[2:]
                if line:
                    queries.append(line)
    return queries

def normalize(q):
    q = q.lower().strip()
    q = re.sub(r'[^\w\s]', ' ', q)
    q = re.sub(r'\s+', ' ', q).strip()
    return q

def tokenize(q):
    tokens = normalize(q).split()
    return set(t for t in tokens if t not in STOP_WORDS and len(t) > 2)

def deduplicate(queries):
    seen_normalized = {}
    unique = []
    for q in queries:
        norm = normalize(q)
        if norm in seen_normalized:
            continue
        seen_normalized[norm] = True
        unique.append(q)

    final = []
    final_tokens = []
    for q in unique:
        toks = tokenize(q)
        if len(toks) < 2:
            continue
        is_dup = False
        for ft in final_tokens:
            if len(toks) == 0 or len(ft) == 0:
                continue
            overlap = len(toks & ft) / min(len(toks), len(ft))
            if overlap > 0.85:
                is_dup = True
                break
        if not is_dup:
            final.append(q)
            final_tokens.append(toks)
    return final

def cluster_queries(queries, max_cluster_size=8, min_similarity=0.30):
    tokenized = [(q, tokenize(q)) for q in queries]
    tokenized.sort(key=lambda x: -len(x[1]))

    clusters = []
    assigned = set()

    for i, (q, toks) in enumerate(tokenized):
        if i in assigned:
            continue
        cluster = [q]
        cluster_tokens = set(toks)
        assigned.add(i)

        for j, (q2, toks2) in enumerate(tokenized):
            if j in assigned or len(cluster) >= max_cluster_size:
                break
            if len(toks2) == 0:
                continue
            overlap = len(toks2 & cluster_tokens) / len(toks2)
            if overlap >= min_similarity:
                cluster.append(q2)
                cluster_tokens |= toks2
                assigned.add(j)

        clusters.append((cluster, cluster_tokens))

    large = [(c, t) for c, t in clusters if len(c) >= 3]
    small = [(c, t) for c, t in clusters if len(c) < 3]

    for sc, st in small:
        best_idx = -1
        best_sim = 0
        for idx, (lc, lt) in enumerate(large):
            if len(lc) >= max_cluster_size:
                continue
            if len(st) == 0 or len(lt) == 0:
                continue
            sim = len(st & lt) / max(len(st), 1)
            if sim > best_sim:
                best_sim = sim
                best_idx = idx
        if best_idx >= 0 and best_sim >= 0.15:
            lc, lt = large[best_idx]
            for q in sc:
                if len(lc) < max_cluster_size:
                    lc.append(q)
            large[best_idx] = (lc, lt | st)
        else:
            large.append((sc, st))

    large.sort(key=lambda x: -len(x[0]))
    return large

def generate_cluster_label(tokens):
    sorted_tokens = sorted(tokens, key=lambda t: len(t), reverse=True)[:6]
    return ', '.join(sorted_tokens[:4])

def write_cluster_file(filepath, topic_name, clusters):
    total_queries = sum(len(c) for c, _ in clusters)
    with open(filepath, 'w') as f:
        f.write(f'# Query Clusters: {topic_name}\n\n')
        f.write(f'Total queries: {total_queries} | Clusters: {len(clusters)}\n\n')
        f.write('All queries are LLM web-search originated (no manually written prompts).\n\n')
        f.write('Each cluster = one answer block (~150-200 words, self-contained, independently citable).\n\n')
        f.write('---\n\n')
        for i, (queries, tokens) in enumerate(clusters, 1):
            label = generate_cluster_label(tokens)
            f.write(f'## Cluster {i}: {label} ({len(queries)} queries)\n\n')
            for q in queries:
                f.write(f'- `{q}`\n')
            f.write('\n')

BASE = '/Users/berndhuber/Desktop/cc-test/metricus/knowledge-bases'

# NOTE: We use the v2 cluster files (which have old R1+R2 web search queries)
# but we need the ORIGINAL cluster files from before we overwrote them.
# The v2 files ARE the same as current cluster files. They contain R1+R2 web search
# queries PLUS manual prompts merged. We can't separate them now.
#
# HOWEVER: The original R1+R2 queries were stored in the v1 cluster files which
# were overwritten. BUT the v2 files were copies. And the originals had only
# web-search queries (115-125 per KB).
#
# SOLUTION: We have R3 extracted (web search) + R4 websearch files.
# The R1+R2 original clusters also had only web search queries.
# We saved v2 copies - but those are already merged with prompts.
#
# Best approach: use R3 + R4 only (which are purely web search),
# plus we can try to recover R1+R2 from round1/round2 research docs.
# Actually the simplest: R3 extracted files + R4 websearch files = all web search queries.
# R3 already included the R1+R2 agent web search queries in its input.

configs = [
    {
        'name': 'AI Brand Accuracy Guide',
        'web_sources': [
            'extracted-brand-accuracy-r3.txt',
            'websearch-brand-accuracy-r4.txt',
        ],
        'output_file': 'clusters-brand-accuracy.md',
    },
    {
        'name': 'AI Recommendation Alignment Framework',
        'web_sources': [
            'extracted-alignment-r3.txt',
            'websearch-alignment-r4.txt',
        ],
        'output_file': 'clusters-alignment.md',
    },
    {
        'name': 'AI Platform Intelligence Guide',
        'web_sources': [
            'extracted-platform-intel-r3.txt',
            'websearch-platform-intel-r4.txt',
        ],
        'output_file': 'clusters-platform-intel.md',
    },
    {
        'name': 'AI Buyer Behavior Research',
        'web_sources': [
            'extracted-buyer-behavior-r3.txt',
            'websearch-buyer-behavior-r4.txt',
        ],
        'output_file': 'clusters-buyer-behavior.md',
    },
]

for cfg in configs:
    print(f"\n{'='*60}")
    print(f"Processing: {cfg['name']}")
    print(f"{'='*60}")

    all_queries = []
    for src in cfg['web_sources']:
        q = load_lines(os.path.join(BASE, src))
        print(f"  {src}: {len(q)} queries")
        all_queries.extend(q)

    print(f"  Total raw web-search queries: {len(all_queries)}")

    unique = deduplicate(all_queries)
    print(f"  After dedup: {len(unique)}")

    clusters = cluster_queries(unique)
    print(f"  Clusters: {len(clusters)}")

    sizes = [len(c) for c, _ in clusters]
    singletons = sum(1 for s in sizes if s == 1)
    print(f"  Cluster sizes: min={min(sizes)}, max={max(sizes)}, avg={sum(sizes)/len(sizes):.1f}")
    print(f"  Singletons: {singletons}")

    output_path = os.path.join(BASE, cfg['output_file'])
    write_cluster_file(output_path, cfg['name'], clusters)
    print(f"  Written to: {cfg['output_file']}")

print("\nDone!")
