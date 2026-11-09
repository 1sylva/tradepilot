# TradePilot AI — iPhone PWA

Static, offline-capable (after first visit with a service worker) paper-trading simulator. No live quotes, AI inference, exchange API keys, real orders, or background execution. All quotes are synthetic. Trades have no fees/slippage. Bot logic uses short vs long moving averages. This is an educational prototype, not a backtest or investment tool.

## iPhone-only deployment via GitHub Pages
1. Sign in to github.com in Safari and create a **public** repository named `tradepilot-ai` (public means all code is visible; never commit secrets).
2. In the repo, use **Add file → Upload files** (switch Safari to Request Desktop Website if needed). Upload `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `icon.svg`, `sw.js` at the repository root, then commit. If Safari won't upload multiple files, upload one at a time.
3. Go to **Settings → Pages → Build and deployment → Deploy from a branch**. Select `main` and `/ (root)` and save.
4. After deployment completes, open `https://YOUR-USERNAME.github.io/tradepilot-ai/` in Safari. Verify it works.
5. Tap Safari Share → Add to Home Screen → Add.

GitHub Pages may take a few minutes to publish. iOS may display slightly different menu names. The simulator pauses when the app is backgrounded; it is NOT a server bot.

## Safety
- Do not enter broker API keys into this app or GitHub Pages.
- Emergency stop affects the local simulator only, not real exchange positions.
- LocalStorage can be cleared by Safari; no account syncing.
- For live trading, move execution and credentials to a secure server and add exchange-specific protections, authenticated commands, a persistent database, and extensive testing.
