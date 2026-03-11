/**
 * app.js — Main entry point (landing page)
 *
 * Wires together all modules. Loaded as <script type="module">.
 * No global side-effects — everything flows through imports.
 */

import { UC_CONTENT } from '../content/index.js';
import { resolveVariant } from './ab-test.js';
import { state } from './state.js';
import { renderPage } from '../components/renderer.js';
import { initForms } from '../components/forms.js';
import { initFaq } from '../components/faq.js';
import { initSticky } from '../components/sticky.js';

// 1. Resolve use-case variant and store in shared state
resolveVariant(UC_CONTENT);

// 2. Render all page content from the resolved variant
renderPage();

// 3. Render FAQ (has its own delegated toggle handler)
initFaq();

// 4. Set up form event delegation
initForms();

// 5. Sticky CTA visibility observer
initSticky();

// 6. Variant tab active state
(function initVariantTabs() {
  var tabs = document.querySelectorAll('.variant-tab');
  tabs.forEach(function (tab) {
    if (tab.getAttribute('data-uc') === state.uc) {
      tab.classList.add('active');
    }
  });
})();
