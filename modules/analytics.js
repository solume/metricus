import { SCRIPT_URL } from './config.js';

export function track(email, data) {
  const tagged = '[brand] ' + (data || 'unknown');
  const p = new URLSearchParams({ contact: email || '', pricing: tagged });
  fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(() => {});
}

export function trackConversion() {
  if (typeof gtag_report_conversion === 'function') {
    gtag_report_conversion();
  }
}
