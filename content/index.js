/**
 * content/index.js — Aggregates all use-case variants
 *
 * Exports: UC_CONTENT
 *
 * Import individual variants and re-export as a single map.
 * To add a new A/B variant, create a new file and add it here.
 */

import { brand } from './brand.js';
import { coding } from './coding.js';
import { data } from './data.js';

export const UC_CONTENT = { brand, coding, data };
