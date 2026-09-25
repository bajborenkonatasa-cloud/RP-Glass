RP-Glass v0.8.4 surgical JS fix

Replace ONLY index.js in your RP-Glass repository/installation.
Keep your existing manifest.json, style.css and assets folder.

Expected proof after a full SillyTavern restart:
RP 0.8.4 ✓

This patch:
- boots immediately when SillyTavern injects the extension after DOMContentLoaded;
- replaces stale RP✓ with a version-stamped badge;
- creates Hanabi/mood layer independently of #chat;
- resolves assets relative to the actual extension script;
- recognizes scene headers in h1/h2/h3/p/blockquote.
