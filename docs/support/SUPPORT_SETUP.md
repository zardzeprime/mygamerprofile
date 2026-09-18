# Support setup — MG Profile

## Recommended launch setup

For the current Brazil-first, low-budget stage, the recommended support stack is:

1. **Pix with a random key** for one-time support.
2. **Ko-fi monthly support / memberships** for recurring support.

Keep the public MGP experience free at launch; supporter tiers can be introduced only when the benefits are concrete and deliverable.

## Why Pix first

- familiar to Brazilian users;
- no extra account is required for the supporter beyond their bank/payment app;
- easy to place behind a copy button and, later, a QR code;
- a random Pix key avoids publishing a CPF, phone number or personal email as the public payment identifier.

Do not commit private banking data to the repository.

When ready, update `src/config/support.ts`:

- set the Pix method status to `active`;
- add only the random Pix key intended for public use.

A QR code can be added later from a valid Pix Copia e Cola payload.

## Why Ko-fi for recurring support

Ko-fi supports both simple recurring monthly payments and membership tiers. For the current one-person project stage, start with voluntary monthly support rather than promising a large rewards program. If supporter tiers are enabled later, benefits should be limited to things MGP can reliably deliver, such as optional profile cosmetics, supporter community spaces or special editorial/community content.

When the Ko-fi page exists, update `src/config/support.ts` with the public page URL and set its status to `active`.

## Public copy / legal posture

Financial support must remain clearly described as voluntary support to an independent project.

It does **not**:
- buy equity or ownership;
- create a promise of financial return;
- buy moderation privileges;
- buy preferential treatment;
- guarantee that a requested feature will be implemented.

If rewards or supporter tiers are introduced later, document exactly what is offered before accepting money for them. Possible future directions may include MGP cosmetics/customization, supporter-only community spaces, and special content or collaborations when the project has capacity. Do not promise access to specific pro players, influencers, events or collaborations before those arrangements exist.

## Current state

The public `/support` page is live-ready but intentionally shows the financial methods as “being configured” until a public random Pix key and/or Ko-fi page URL is supplied.
