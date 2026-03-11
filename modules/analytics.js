/**
 * analytics.js — Tracking & lead capture
 *
 * Exports: track, trackConversion
 *
 * track(email, data) — fire-and-forget POST to Google Apps Script
 * trackConversion()  — trigger Google Ads conversion pixel
 */

import { SCRIPT_URL } from './config.js';
import { state } from './state.js';

/**
 * Send a tracking event to the backend spreadsheet.
 * Tags the event with the current use-case key.
 */
export function track(email, data) {
  var tagged = '[' + state.uc + '] ' + (data || 'unknown');
  var p = new URLSearchParams({ contact: email || '', pricing: tagged, uc: state.uc });
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
