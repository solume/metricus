/**
 * app.js — Main entry point (landing page)
 *
 * Initializes interactive components. All content is
 * pre-rendered in HTML — no dynamic rendering needed.
 */

import { initForms } from '../components/forms.js';
import { initFaq } from '../components/faq.js';
import { initSticky } from '../components/sticky.js';

// 1. Set up form event delegation
initForms();

// 2. FAQ toggle handler
initFaq();

// 3. Sticky CTA visibility observer
initSticky();
