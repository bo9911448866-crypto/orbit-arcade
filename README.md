# ORBIT Arcade

A React 19 + TSX frontend, real Three.js orbital sculpture and loading scenes, and an Express/Node.js server. Designed for Render's **Node web service** runtime.

## Included

- All **175 entries in the supplied MonkeyGG2 catalog**, including Flash game query parameters, plus Smart Ball and Where Is the Water: **177 playable catalog entries** across all game folders in the supplied repository.
- Search (including aliases), category filters, favorites, recently played, random selection, a full-window player, reload, fullscreen, and a separate-tab fallback.
- Real game thumbnails and splash artwork bundled locally where available, with a plain title card when no suitable artwork is available. Cover provenance is recorded in `data/cover-sources.json`.
- DuckDuckGo search in the proxy address box: enter search words or an HTTP/HTTPS website URL.
- Real WebGL 3D assets generated in Three.js, pointer interaction, reduced-motion support and a fallback when WebGL is unavailable.
- Ultraviolet **3.2.10**, BareMux **2.1.9**, compatible Epoxy transport **2.1.27**, and Wisp JS **0.5.0**. This is an actual service-worker proxy with a Node WebSocket backend.
- A Render Blueprint, locked npm dependencies, TypeScript checks, production build, and catalog/path tests.

## Entrance screen

Each fresh load of the arcade starts with a visual “404 Not Found” page. Press **O** (lowercase or uppercase) to reveal ORBIT. Refreshing the page resets this screen. It is a visual entrance, not authentication. Proxy recovery pages and game asset routes remain available.

## Run locally

Install Node.js 22 or newer, then:

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. The proxy requires localhost or HTTPS, service workers, SharedWorker, and WebAssembly. The same Express server serves the frontend and WebSocket endpoint; do not start Vite separately.

Production:

```sh
npm run build
npm start
```

The server binds to `0.0.0.0` and uses Render's `PORT` variable, defaulting to 3000. `/health` returns status, game count, and source commit.

## Deploy to Render

1. Extract this project and push its contents to a GitHub or GitLab repository. Keep `package-lock.json`, `data/`, `public/`, and `render.yaml` committed.
2. In Render, choose **New → Blueprint**, connect that repository, and apply `render.yaml`.
3. Open the resulting HTTPS URL after the build succeeds.

For manual setup, choose **Web Service**, runtime **Node**, build command `npm ci && npm run build`, start command `npm start`, health path `/health`, and environment `NODE_ENV=production`, `NODE_VERSION=22`.

Use a Node web service rather than Render Static Sites: Wisp needs HTTP upgrade/WebSocket support. No external proxy server or secret API key is required. Render's free service can sleep when idle, causing a slow first load.

## Game files and availability

The catalog and asset URLs are pinned to this exact source revision:

`d71e46c8b8f2b137435faaeabc61a69456fcc536`

Source: https://gitlab.com/barryjensen-dev/monkeygg2

By default, the Node server streams the original game files from GitLab on demand. **The ZIP does not bundle the large game binaries.** Relative assets, shared files, WASM, and Flash launcher URLs use the same-origin asset route. Upstream outages, API limits, removed assets, external game services, ads, or unsupported game engines can affect individual games. No claim is made that every third-party game or website has been tested or will always work.

For a self-contained copy, run this once where sufficient disk space and Git are available:

```sh
npm run games:download
```

This downloads the full repository at the pinned revision into `vendor/monkeygg2`; the server prioritizes these local files. The download may be large. To make local assets available on Render, run that command during its build, for example `npm ci && npm run games:download && npm run build`; check your service's build/storage limits. The `vendor/` directory is ignored by Git by default.

To intentionally refresh the catalog to upstream's latest main revision, run `npm run catalog:refresh`, inspect the changes and supplemental entries in `data/extra-games.json`, then rebuild and commit the data files. A local vendor checkout must be refreshed to the matching revision as well.

## Proxy details

`/sw.js` is registered at root scope and intercepts only `/uv/service/` requests; `/uv/`, `/baremux/`, and `/epoxy/` serve their package assets. `/wisp/` routes WebSocket upgrades to Wisp JS. The server supplies the cross-origin isolation headers needed by the transport and the service-worker scope header. The proxy iframe shares the service-worker context; missed proxy navigations receive a connection recovery page instead of the arcade homepage or a static 404. Existing installations migrate the old narrow service-worker registration automatically. After upgrading, close old proxy tabs and refresh ORBIT before launching a site again.

Wisp blocks private and loopback IPs, disables UDP, permits destination ports 80/443, limits streams per connection, and checks the WebSocket origin. The proxy rewrites website traffic; it is not a VPN or anonymity guarantee. Some websites block proxies or depend on unsupported APIs. Games run as original third-party content on your deployment's origin.

## Validation

```sh
npm test
npm run build
```

The automated suite checks catalog integrity and path normalization/traversal rejection. The production TSX and Node builds were checked. The proxy URL resolver is tested for DuckDuckGo searches, deep game paths, query strings, and invalid schemes. Production recovery routes and static proxy assets are checked over HTTP. End-to-end proxy traffic requires HTTPS and must be checked on the deployed Render origin; the local preview is HTTP. The game mute button affects supported HTML audio/video elements; WebAudio games and cross-origin embedded players may manage their own sound.

## Attribution and licenses

The game catalog and game files originate from the supplied MonkeyGG2 repository. Its repository license is retained at `data/UPSTREAM-LICENSE`; individual games and assets may carry their own licenses. Dependency licenses remain applicable, including Epoxy's AGPL-3.0-only license, Wisp JS's LGPL-3.0-or-later license, and Ultraviolet's MIT license. This project includes source for its custom application and does not override third-party rights. Keep original notices with redistributed games and dependencies.
