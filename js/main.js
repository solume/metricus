const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlMZxJmAmm90HGKg6AJxEeB8xOP83Dyq4rUHnCD8aubV1NzPqb1ZlSbjzmBAnO63r2/exec';

const STRIPE = {
    snapshot:  'https://buy.stripe.com/4gMeVe6IOfSjauBgma7g400',
    deepdive:  'https://buy.stripe.com/9B614ogjobC346dd9Y7g401',
    arsenal:   'https://buy.stripe.com/8x2cN63wC5dF7ipd9Y7g402'
};

function send(email, data) {
    const p = new URLSearchParams({ contact: email, pricing: data || 'unknown' });
    fetch(SCRIPT_URL + '?' + p.toString(), { mode: 'no-cors' }).catch(() => {});
}

function buyTier(tier) {
    send('', 'funnel:tier-click:' + tier);
    window.location.href = 'onboarding/?tier=' + tier;
}

function heroSubmit(e) {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    const email = input.value;
    // Log the email interest, then send to onboarding
    send(email, 'hero-email');
    window.location.href = 'onboarding/?tier=deepdive&email=' + encodeURIComponent(email);
}
