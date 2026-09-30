# Veyra Browser

> **A gaming-first privacy browser that leaves more of your PC for the game.**

Veyra is an independent open-source browser project for people who like the resource-control idea behind gaming browsers such as Opera GX, but want a calmer interface, strong tracker/ad blocking, keyboard-first workflows, and easy migration from Firefox or Chromium browsers.

The design target is simple: **less browser tax, less tracking, less clutter.**

## Veyra 0.3 alpha

### Veyra Control

Veyra now exposes real browser resource controls instead of decorative gauges:

- Live Veyra RAM and CPU usage from Electron process metrics
- **Game Mode** — 3 warm tabs, 1 GB soft RAM target, aggressive auto-sleep
- **Balanced** — 8 warm tabs, 2 GB soft RAM target
- **Saver** — 4 warm tabs, 768 MB soft RAM target
- Custom RAM target from 512 MB to 8 GB
- Custom warm-tab limit
- Configurable inactive-tab sleep timer
- One-click **Sleep inactive tabs**
- Sleeping tabs are restored lazily when selected
- Active and split-view tabs are never auto-slept

The RAM target is intentionally a **soft target**, not a fake hard memory cap. Veyra reacts by unloading inactive Chromium renderers rather than terminating the page you are actively using.

### Privacy

- Ghostery ads + tracking engine
- Cosmetic filtering
- Live blocked-request stats
- Global Privacy Control (`Sec-GPC: 1`)
- `DNT: 1`
- Tracking-query cleanup for common parameters such as `utm_*`, `fbclid`, and `gclid`
- Sandboxed remote web content
- Context isolation
- Node.js disabled in remote pages
- No sponsored new-tab feed
- No Veyra account requirement

### Browser workflow

- Vertical tabs
- Persistent sessions
- Personal, Work, Research, and custom workspaces
- Real two-page split view
- Recently closed tabs
- Command palette
- Quick bookmarks
- Local browsing history
- Brave Search default
- Standard browser shortcuts
- Lazy tab restore and sleeping
- Popups redirected into tabs

### Move into Veyra

Current migration support discovers and imports **bookmarks + history** from Firefox, Chrome, Chromium, Brave, and Microsoft Edge.

Open-tab/session migration, search engines, selected preferences, extension compatibility reporting, and secure password migration remain on the roadmap.

## Install / run

### Development

```bash
git clone https://github.com/mixutin/veyra-browser
cd veyra-browser
npm install
npm start
```

Node.js 20+ is recommended.

### Linux

```bash
npm run dist:linux
```

Builds an AppImage and Debian / Ubuntu `.deb`. The Debian package configures Electron's Chromium sandbox helper during installation. Veyra does **not** ship with `--no-sandbox` enabled.

### Windows

```powershell
npm run dist:win
```

Builds on a Windows runner:

- NSIS installer
- Portable `.exe`
- `.zip` package

### macOS

```bash
npm run dist:mac
```

Builds DMG and ZIP packages.

Tagged releases run the full Linux + Windows + macOS matrix and automatically upload produced packages to the GitHub prerelease.

## Keyboard flow

| Action | Shortcut |
| --- | --- |
| Address bar | `Ctrl/Cmd + L` |
| New tab | `Ctrl/Cmd + T` |
| Close tab | `Ctrl/Cmd + W` |
| Reopen tab | `Ctrl/Cmd + Shift + T` |
| Cycle tabs | `Ctrl/Cmd + Tab` |
| Bookmark | `Ctrl/Cmd + D` |
| Command palette | `Ctrl/Cmd + K` |
| Split view | `Ctrl/Cmd + Shift + S` |
| **Game Mode** | `Ctrl/Cmd + Shift + G` |
| New workspace | `Ctrl/Cmd + Shift + N` |
| Workspace 1–9 | `Alt + 1–9` |

## Architecture direction

Veyra is currently proving the product layer on Electron/Chromium: browser chrome, tabs, workspaces, migration, privacy services, resource controls, and packaging.

The long-term goal is a maintained **Chromium-class daily driver** with extension compatibility, rapid Chromium security rebases, signed updates, stronger per-site privacy controls, and a dedicated browser-engine integration rather than pretending an Electron shell alone equals a production Chromium fork.

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [ROADMAP.md](docs/ROADMAP.md).

## Status

**0.3 alpha.** Veyra is runnable and packageable, but it is not yet a hardened replacement for an established browser on sensitive accounts.

Veyra is independent and is not affiliated with Opera, Brave, Mozilla, Google, or Microsoft. Product names mentioned above belong to their respective owners.

## License

Mozilla Public License 2.0.
