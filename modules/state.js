/**
 * state.js — Shared state + simple event bus
 *
 * Exports: bus, state
 *
 * bus.on(event, fn)   — subscribe
 * bus.off(event, fn)  — unsubscribe
 * bus.emit(event, data) — publish
 *
 * state.tier    — selected pricing tier key
 * state.email   — prefilled email from URL
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
  tier:    params.get('tier') || 'deepdive',
  email:   params.get('email') || '',
};
