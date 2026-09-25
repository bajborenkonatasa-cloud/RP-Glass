# RP-Glass v0.8.2 — Living Layer visibility fix

RP✓ in v0.8.1 proved the extension JavaScript is executing.

This build fixes the next layer:
- Hanabi and mood HUD are created directly during boot, not only after chat classification.
- Asset path is discovered from the actual RP-Glass index.js script URL.
- Hanabi has an unmistakable fallback circle. If the WebP path fails, the circle still appears and says `Ханаби ♡ asset?`.
- RP✓ remains only as a temporary passive proof marker; it is intentionally not clickable.

Expected:
- RP✓ upper-right
- Hanabi circle/portrait lower-right above input
- mood pill above Hanabi
