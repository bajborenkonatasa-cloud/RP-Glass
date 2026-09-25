# RP-Glass v0.8.1 — Bootstrap Fix

Root cause fixed:
v0.8.0 used `import.meta.url` inside a classic SillyTavern extension script.
That is a JavaScript parse error outside ES modules, so the whole index.js could not start.

v0.8.1:
- removes `import.meta.url`;
- derives the assets URL from `document.currentScript.src`;
- adds an obvious `RP✓` boot badge;
- keeps the v0.6 visual base intact;
- keeps Hanabi + mood HUD Living Layer.

Expected test:
1. RP✓ appears near the upper-right of the Tavern viewport.
2. Hanabi mascot appears above the input area.
3. Mood HUD appears above Hanabi.
