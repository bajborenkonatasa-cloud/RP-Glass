# RP-Glass v0.8.3 — Fail-Loud Living Canary

RP✓ already proved index.js executes.

This build creates the Hanabi dock immediately after RP✓ with inline styles,
before any chat/mood logic. It cannot be hidden by RP-Glass CSS.

Expected:
- RP✓
- 104px Hanabi dock above the input
- mood pill `✦ спокойствие`
- if the image URL fails, the dock visibly says `ХАНАБИ ♡ asset не найден`
- if DOM creation throws, a red `RP ERR:` panel appears

The rest of the known-working v0.6 styling remains intact.
