/**
 * analytics.js — Tracking & lead capture
 *
 * Exports: track, trackConversion
 *
 * track(email, data) — fire-and-forget POST to Google Apps Script
 * trackConversion()  — trigger Google Ads conversion pixel
 */

import { SCRIPT_URL } from './config.js';

/**
 * Send a tracking event to the backend spreadsheet.
 */
export function track(email, data) {
  var tagged = '[brand] ' + (data || 'unknown');
  var p = new URLSearchParams({ contact: email || '', pricing: tagged });
  fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(function () {});
}

/**
 * Fire a Google Ads conversion event (if gtag is loaded).
 */
export function trackConversion() {
  if (typeof gtag_report_conversion === 'function') {
    gtag_report_conversion();
  }
}
