# Support setup — MG Profile

## Recommended launch setup

For the current Brazil-first, low-budget stage, the recommended support stack is:

1. **Pix with a random key** for one-time support.
2. **APOIA.se continuous campaign** for recurring monthly support.

Patreon can be revisited later if the audience becomes meaningfully international.

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

## Why APOIA.se for recurring support

The target audience is currently Brazil-first and the platform supports recurring campaigns without a fixed monthly subscription for the creator. Keep the public MGP experience free; recurring support should be voluntary rather than a required membership.

When the campaign exists, update `src/config/support.ts` with the public campaign URL and set its status to `active`.

## Public copy / legal posture

Financial support must remain clearly described as voluntary support to an independent project.

It does **not**:
- buy equity or ownership;
- create a promise of financial return;
- buy moderation privileges;
- buy preferential treatment;
- guarantee that a requested feature will be implemented.

If rewards or supporter tiers are introduced later, document exactly what is offered before accepting money for them.

## Current state

The public `/support` page is live-ready but intentionally shows the financial methods as “being configured” until a public random Pix key and/or APOIA.se campaign URL is supplied.
