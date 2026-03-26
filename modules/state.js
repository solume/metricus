const listeners = {};

export const bus = {
  on(event, fn) { (listeners[event] = listeners[event] || []).push(fn); },
  off(event, fn) { if (!listeners[event]) return; listeners[event] = listeners[event].filter(f => f !== fn); },
  emit(event, data) { (listeners[event] || []).forEach(fn => fn(data)); },
};

const params = new URLSearchParams(window.location.search);

export const state = {
  tier: params.get('tier') || 'deepdive',
  email: params.get('email') || '',
  website: params.get('website') || '',
};
