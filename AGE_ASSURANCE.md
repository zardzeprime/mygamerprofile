# MGP — Age Assurance & Age-Gated Content

Last reviewed: 2026-09-15

## Product rule

MGP separates **declared age bands** from **strong 18+ assurance**.

- Date of birth is collected privately and is not displayed on the public profile.
- Ordinary age bands (Livre/12/14/16) use the account birth-date signal plus MGP safety rules.
- Areas explicitly marked `verified_18` require a separate strong adult-verification result before access is granted.
- Entering an adult birth date does **not** by itself unlock `verified_18` content.

The age policy belongs to the specific game/topic rather than to the whole platform. A 16+ title does not require document verification merely because MGP also hosts 18+ titles.

## Account age data

`public.account_age_data` stores the birth date and guardian/supervision state. It is private by RLS and is not an advertising-profile source.

The application should derive an age band at request time and use the most restrictive safe state when data is missing or inconsistent.

For children whose use requires guardian participation/consent under applicable law, the final product must use a trusted guardian flow before enabling unrestricted social features. MGP must not treat the child's own checkbox as guardian confirmation.

## Strong 18+ verification

`public.account_age_verifications` stores only a verification result and provenance:

- `status`
- `verified_over_18`
- approved verification method
- provider name/reference
- verification and expiry dates

The normal application database must **not** retain a raw RG, CNH, passport or selfie merely to prove adulthood.

Preferred production architecture:

1. User selects **Verify 18+**.
2. MGP creates a one-time age-assurance session on the server.
3. The user is redirected to an approved age/identity verifier.
4. The verifier processes the document and any liveness checks in its controlled environment.
5. MGP receives a signed webhook/result such as `over_18 = true` plus a provider reference.
6. MGP records the verdict in `account_age_verifications`.
7. MGP grants access to resources marked `verified_18` while the verification remains valid.

This reduces breach impact and avoids building an identity-document vault inside MGP.

## If direct document upload is ever unavoidable

Direct MGP storage is a fallback, not the default. Before enabling it, all of the following are required:

- private, non-public object storage;
- no client-readable bucket/listing;
- server-side malware/file-type/size validation;
- encryption in transit and at rest;
- strict moderator role separation and audit logs;
- a defined deletion deadline after the age verdict is made;
- a deletion job and evidence that the raw document was purged;
- updated Privacy Policy and retention wording before collection begins;
- incident-response procedures specifically covering identity documents.

## Content classification

`public.games.minimum_age` expresses the MGP baseline age for a title. `public.games.age_gate_level` controls enforcement:

- `none`: no account-age restriction;
- `account_age`: compare the private birth-date age band to the content baseline;
- `verified_18`: strong 18+ verification required.

Topics/posts can also carry content warnings/audience labels independently of the game-level baseline. Legitimate discussion of mature games does not authorize pornography, explicit sexual content, exploitation or gratuitous gore.

## Advertising separation

Birth date, guardian state, gender identity and adult-verification data must not be fed into behavioral-advertising profiles. Identified minors must receive age-appropriate, non-profiled ad treatment consistent with applicable law and the ad provider's tooling.

## Legal/product review gate

The strong-verification button may be shown as **coming soon**, but document collection must not be enabled until:

1. an age-assurance provider/method is selected;
2. callback/webhook security is implemented;
3. Terms and Privacy name the final processing/retention model;
4. the production flow has been tested end-to-end;
5. access enforcement exists server-side, not only as a blurred frontend overlay.
