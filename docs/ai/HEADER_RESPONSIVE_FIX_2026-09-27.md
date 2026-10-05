# Header responsive hardening — 2026-09-27

## NEXUS integrated brief

Scope: stabilize the global MGP header across narrow mobile, tablet, laptop, intermediate desktop and wide desktop widths without changing the product's visual identity or authentication behavior.

Implementation:
- expanded the header shell from the previous 1280px cap to a 1664px cap;
- kept the compact menu available until a true wide-desktop width;
- introduced progressive visibility tiers for primary navigation, appearance/language controls and authentication actions;
- made the global-search control fluid with a bounded `clamp()` width;
- closes the compact navigation automatically when crossing into the full desktop layout;
- preserved mobile safe-area padding in the open navigation panel.

## Os Sete review

### Sabnock (Segurança)
Status: pass. The change does not alter authentication, authorization, secrets, session handling, or server-side trust boundaries. Existing sign-in/sign-out actions are only repositioned by responsive visibility.

### Bael (Privacidade)
Status: pass. No personal-data collection, profile visibility, retention, telemetry, or consent behavior changed.

### Andromalius (Direitos e procedência)
Status: not_applicable. No external media, image provenance, licensing, or attribution behavior changed.

### Vassago (Pesquisa e atualizações)
Status: not_applicable. No game/editorial data, external source, dependency, or freshness behavior changed.

### Marbas (Automação)
Status: pass. Existing CI remains the verification gate; no scheduled job, workflow cadence, deployment secret, or automation contract changed.

### Andrealphus (Performance e UX)
Status: pass. The previous layout activated all wide-header controls at the same 1536px breakpoint while constraining the shell to 1280px. Progressive breakpoints plus a fluid search width remove that collision zone while keeping DOM and runtime cost effectively unchanged.

## Verification target

Run the existing CI build and changed-file lint on the pull request before merge. Visual verification should cover at minimum 320, 375, 640, 768, 1024, 1280, 1440, 1536, 1600, 1760 and 1920 CSS-pixel viewport widths.
