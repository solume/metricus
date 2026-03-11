/**
 * config.js — Central configuration
 *
 * Exports: SCRIPT_URL, STRIPE, TIER_INFO, FEATURES
 *
 * Feature flags control which optional sections render.
 * Toggle any flag to false to disable a feature site-wide
 * without touching other files.
 */

export const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxlMZxJmAmm90HGKg6AJxEeB8xOP83Dyq4rUHnCD8aubV1NzPqb1ZlSbjzmBAnO63r2/exec';

export const STRIPE = {
  snapshot: 'https://buy.stripe.com/4gMeVe6IOfSjauBgma7g400',
  deepdive: 'https://buy.stripe.com/9B614ogjobC346dd9Y7g401',
  arsenal:  'https://buy.stripe.com/8x2cN63wC5dF7ipd9Y7g402',
};

export const TIER_INFO = {
  snapshot: { name: 'Snapshot',     price: '$49' },
  deepdive: { name: 'Deep Dive',   price: '$149' },
  arsenal:  { name: 'Full Arsenal', price: '$349' },
};

/** Feature flags — set false to hide a section globally */
export const FEATURES = {
  audience:             true,
  freeLook:             true,
  newsletter:           true,
  scarcity:             true,
  featuredTestimonial:  true,
  blogTease:            true,
  stickyCta:            true,
  faq:                  true,
};
