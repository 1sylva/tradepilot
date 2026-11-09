# TradePilot AI 2.0 — iPhone-first, PAPER ONLY

This package replaces the v1 GitHub Pages frontend and adds a Cloudflare Worker/D1 cloud paper-trading engine. No real orders or exchange credentials exist in this code.

## Files

- `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`: GitHub Pages iPhone PWA
- `backend/worker.js`: Cloudflare Worker with scheduled paper trading, candles, forex read-only prices, signals, alert delivery
- `backend/schema.sql`: D1 database schema, starts HALTED
- `backend/wrangler.toml`: Worker configuration; must edit placeholders
- `.github/workflows/deploy-worker.yml`: manual and push deployment workflow

## Step A — Update GitHub Pages using only iPhone Safari

1. In Files, unzip the archive. Open your existing `tradepilot-ai` GitHub repository in Safari. Use **Request Desktop Website** if menus are missing.
2. Replace the existing six root files (`index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`) using **Add file → Upload files**. GitHub can prompt to overwrite; if it refuses, delete the old files using each file's menu and upload replacements. Keep `README.md` updated too.
3. Upload the `backend` folder's three files, preserving paths `backend/worker.js`, `backend/schema.sql`, `backend/wrangler.toml`. If the iPhone file picker does not upload folders, navigate to a path by creating files via **Add file → Create new file**, entering the path (for example `backend/worker.js`) and pasting file contents using a browser editor, or use github.dev in Safari.
4. Add the workflow at `.github/workflows/deploy-worker.yml`. GitHub web editing supports slash-separated paths. GitHub may require reauthentication/permissions for workflow files.
5. Commit changes. Pages will redeploy the frontend automatically. The cloud engine will show 'Not connected' until configured.

## Step B — Create Cloudflare cloud resources

1. Create or sign into a Cloudflare account at https://dash.cloudflare.com/.
2. In **Workers & Pages → D1 SQL Database**, create a D1 database named `tradepilot-paper` (Cloudflare dashboard navigation labels can change). Copy its database ID.
3. Edit `backend/wrangler.toml` on GitHub: replace `REPLACE_WITH_D1_DATABASE_ID` with the D1 ID and `YOUR-USERNAME` in `ALLOWED_ORIGIN` with your GitHub username. Use exact origin `https://YOUR-USERNAME.github.io` (no slash/path).
4. Find your Cloudflare **Account ID** in the dashboard. Create a Cloudflare API token with the permissions needed to deploy Workers scripts and edit D1 databases, scoped to your account. Do NOT use a Global API Key.
5. In GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, create `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` with the values above. Do not commit them to any file.
6. In GitHub repo → **Actions → Deploy Cloudflare paper engine → Run workflow**. It initializes D1 then deploys the Worker. If the workflow fails, inspect the step logs. You may need to enable GitHub Actions for your repository.
7. Copy the deployed Worker HTTPS URL, usually `https://tradepilot-paper-engine.<subdomain>.workers.dev`.

## Step C — Secure cloud controls

1. Cloudflare dashboard → your deployed Worker → **Settings → Variables and Secrets**. Add a **Secret** named `ADMIN_TOKEN`, with a long random value (at least 32 random characters). Never place it in GitHub, public HTML, or a screenshot.
2. Optional: add `TWELVEDATA_KEY` as a secret for forex read-only quotes. Get a key directly from https://twelvedata.com/ . Its free/paid quotas and access may differ by pair and refresh rate.
3. Optional: add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets to receive cloud alerts. Create a bot through Telegram BotFather and obtain your own chat ID; keep both private. Telegram alert delivery is best-effort.
4. On the iPhone, open your TradePilot Home Screen app, enter Worker URL, tap **Connect & refresh**, enter your ADMIN_TOKEN in the password field, and tap **Start paper bots**. It is stored only in browser session storage, but a compromised device or malicious browser extension can still expose it.
5. Cloudflare cron runs every five minutes independently of the iPhone. The database starts in halted mode for safety. **Emergency stop** halts future cycles; it does not liquidate open paper positions. If the control panel is unavailable, set `halted` to `1` in D1 using Cloudflare's SQL console: `UPDATE settings SET value='1' WHERE key='halted';`.

## Data quality / risks

- Coinbase public exchange hourly candles are used for crypto and exchange-listed meme tokens. Some symbols may be unavailable or restricted; the UI displays errors rather than inventing prices. Data is not guaranteed real-time or tick-level.
- Forex uses Twelve Data `/price` with a separate key; the cloud engine does NOT trade forex yet. Forex pairs appear in the read-only watchlist only.
- Signals are **rule-based**, not trained AI. SMA9, SMA21, RSI14 and MACD12/26 are calculated on hourly candle closes. The cloud engine can act on a still-forming candle; signals may change.
- This is a starter simulator, not a realistic execution model: it has no fees, spreads, slippage, latency modelling, market-impact model, backtest, tax accounting, or robust mark-to-market equity. P/L in the dashboard is realized only. Do not interpret results as achievable returns.
- Bot engine uses 5% of available cash per entry, max $500, long-only, 2% stop-loss and 4% take-profit, no leverage. Stops are checked on scheduled snapshots, **not** guaranteed at the threshold price.
- Worker cron jobs can be delayed or fail; monitoring is necessary. Public API endpoints are read-only. Control endpoints require ADMIN_TOKEN and are restricted by browser CORS origin, but CORS is not authentication.
- In-app browser notifications are best effort and only while the PWA is running. Telegram notifications can arrive with the phone locked when configured, subject to third-party service availability.
- GitHub Pages hosts only static frontend; never commit API keys, tokens or private credentials. Cloudflare Worker and D1 may incur charges depending on usage and plan. Verify provider terms and usage quotas.

## API routes

- `GET /api/status` — cash, positions, bots, trades, events
- `GET /api/candles?symbol=BTC-USD` — Coinbase hourly candles + indicators
- `GET /api/forex` — optional forex read-only watchlist
- `POST /api/control` with `Authorization: Bearer <ADMIN_TOKEN>` and JSON `{"action":"start"}` or `{"action":"stop"}` or `{"action":"toggle","symbol":"BTC-USD","enabled":false}`

## Smoke test

1. Before pressing Start, verify cloud status STOPPED and cash $10,000.
2. Verify a Coinbase chart loads. If not, inspect API response and Cloudflare Worker logs.
3. Optionally configure Twelve Data and verify forex quotes. No fake fallback values should appear.
4. Start paper bots; after at least one scheduled tick, `Last cloud run` should update. No trade is guaranteed; the strategy may say HOLD.
5. Press emergency stop; verify STOPPED. Restart only when ready.

This is educational software, not financial advice.
