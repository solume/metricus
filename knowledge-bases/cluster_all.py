#!/usr/bin/env python3
"""
Merge all query rounds, deduplicate, and cluster for each KB.
Reads: existing cluster files (R1+R2), R2 prompts, R3 extracted queries.
Outputs: new cluster files with expanded query sets.
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
    """Extract queries from existing cluster markdown files."""
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

def load_queries_from_prompts(filepath):
    """Extract numbered prompts from prompt files, convert to search queries."""
    queries = []
    if not os.path.exists(filepath):
        return queries
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            # Match numbered prompts like "1. query text" or "- query text"
            m = re.match(r'^\d+\.\s+(.+)$', line)
            if m:
                queries.append(m.group(1).strip())
    return queries

def load_queries_from_extracted(filepath):
    """Load one-query-per-line extracted files."""
    queries = []
    if not os.path.exists(filepath):
        return queries
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # Remove leading dash if present
                if line.startswith('- '):
                    line = line[2:]
                if line:
                    queries.append(line)
    return queries

def normalize(q):
    """Normalize query for deduplication."""
    q = q.lower().strip()
    q = re.sub(r'[^\w\s]', ' ', q)
    q = re.sub(r'\s+', ' ', q).strip()
    return q

def tokenize(q):
    """Tokenize and remove stop words."""
    tokens = normalize(q).split()
    return set(t for t in tokens if t not in STOP_WORDS and len(t) > 2)

def deduplicate(queries):
    """Remove near-duplicate queries using token similarity."""
    seen_normalized = {}
    unique = []

    for q in queries:
        norm = normalize(q)
        if norm in seen_normalized:
            continue
        seen_normalized[norm] = True
        unique.append(q)

    # Second pass: remove queries where token overlap > 85%
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
    """Two-pass clustering: greedy expansion then singleton merging."""
    tokenized = [(q, tokenize(q)) for q in queries]

    # Sort by token count descending (richer queries first)
    tokenized.sort(key=lambda x: -len(x[1]))

    clusters = []
    assigned = set()

    # Pass 1: Greedy clustering
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
            # Similarity: overlap with cluster tokens
            overlap = len(toks2 & cluster_tokens) / len(toks2)
            if overlap >= min_similarity:
                cluster.append(q2)
                cluster_tokens |= toks2
                assigned.add(j)

        clusters.append((cluster, cluster_tokens))

    # Pass 2: Merge small clusters (1-2 items) into best matching larger cluster
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
            # Only add up to max size
            for q in sc:
                if len(lc) < max_cluster_size:
                    lc.append(q)
            large[best_idx] = (lc, lt | st)
        else:
            large.append((sc, st))

    # Sort clusters by size descending
    large.sort(key=lambda x: -len(x[0]))

    return large

def generate_cluster_label(tokens):
    """Generate a short label from most common tokens."""
    # Pick top 4 most distinctive tokens
    sorted_tokens = sorted(tokens, key=lambda t: len(t), reverse=True)[:6]
    return ', '.join(sorted_tokens[:4])

def write_cluster_file(filepath, topic_name, clusters):
    """Write cluster markdown file."""
    total_queries = sum(len(c) for c, _ in clusters)

    with open(filepath, 'w') as f:
        f.write(f'# Query Clusters: {topic_name}\n\n')
        f.write(f'Total queries: {total_queries} | Clusters: {len(clusters)}\n\n')
        f.write('Each cluster = one answer block (~150-200 words, self-contained, independently citable).\n\n')
        f.write('---\n\n')

        for i, (queries, tokens) in enumerate(clusters, 1):
            label = generate_cluster_label(tokens)
            f.write(f'## Cluster {i}: {label} ({len(queries)} queries)\n\n')
            for q in queries:
                f.write(f'- `{q}`\n')
            f.write('\n')

BASE = '/Users/berndhuber/Desktop/cc-test/metricus/knowledge-bases'

# Process each KB
configs = [
    {
        'name': 'AI Brand Accuracy Guide',
        'cluster_file': 'clusters-brand-accuracy.md',
        'prompt_files': ['prompts-brand-accuracy.md', 'prompts-brand-accuracy-r2.md'],
        'extracted_file': 'extracted-brand-accuracy-r3.txt',
        'output_file': 'clusters-brand-accuracy-v2.md',
    },
    {
        'name': 'AI Recommendation Alignment Framework',
        'cluster_file': 'clusters-alignment.md',
        'prompt_files': ['prompts-alignment.md', 'prompts-alignment-r2.md'],
        'extracted_file': 'extracted-alignment-r3.txt',
        'output_file': 'clusters-alignment-v2.md',
    },
    {
        'name': 'AI Platform Intelligence Guide',
        'cluster_file': 'clusters-platform-intel.md',
        'prompt_files': ['prompts-platform-intelligence.md', 'prompts-platform-intelligence-r2.md'],
        'extracted_file': 'extracted-platform-intel-r3.txt',
        'output_file': 'clusters-platform-intel-v2.md',
    },
    {
        'name': 'AI Buyer Behavior Research',
        'cluster_file': 'clusters-buyer-behavior.md',
        'prompt_files': ['prompts-buyer-behavior.md', 'prompts-buyer-behavior-r2.md'],
        'extracted_file': 'extracted-buyer-behavior-r3.txt',
        'output_file': 'clusters-buyer-behavior-v2.md',
    },
]

for cfg in configs:
    print(f"\n{'='*60}")
    print(f"Processing: {cfg['name']}")
    print(f"{'='*60}")

    # Gather all queries
    all_queries = []

    # From existing clusters
    q = load_queries_from_cluster_file(os.path.join(BASE, cfg['cluster_file']))
    print(f"  Existing clusters: {len(q)} queries")
    all_queries.extend(q)

    # From prompt files
    for pf in cfg['prompt_files']:
        q = load_queries_from_prompts(os.path.join(BASE, pf))
        print(f"  Prompts ({pf}): {len(q)} queries")
        all_queries.extend(q)

    # From extracted R3
    q = load_queries_from_extracted(os.path.join(BASE, cfg['extracted_file']))
    print(f"  Extracted R3: {len(q)} queries")
    all_queries.extend(q)

    print(f"  Total raw: {len(all_queries)}")

    # Deduplicate
    unique = deduplicate(all_queries)
    print(f"  After dedup: {len(unique)}")

    # Cluster
    clusters = cluster_queries(unique)
    print(f"  Clusters: {len(clusters)}")

    # Stats
    sizes = [len(c) for c, _ in clusters]
    singletons = sum(1 for s in sizes if s == 1)
    print(f"  Cluster sizes: min={min(sizes)}, max={max(sizes)}, avg={sum(sizes)/len(sizes):.1f}")
    print(f"  Singletons: {singletons}")

    # Write output
    output_path = os.path.join(BASE, cfg['output_file'])
    write_cluster_file(output_path, cfg['name'], clusters)
    print(f"  Written to: {cfg['output_file']}")

print("\nDone!")
