# Veyra Browser

> **A modern, privacy-first browser for people who actually live in the web.**

Veyra is an open browser project combining the privacy ambitions of Brave with the workflow ideas that make modern browsers such as Zen compelling: vertical tabs, workspaces, split views, command-first navigation, sane defaults, and a calm UI.

The goal is not to reskin Chromium. The goal is to build a browser that is easier to migrate to, harder to track, faster to operate, and less cluttered.

## What works today

- Real multi-tab browsing using Electron `WebContentsView`
- Crash/restart-safe session persistence
- Personal, Work, Research, and user-created workspaces
- Real two-page split view
- Lazy-restored tabs plus manual sleep for inactive tabs
- Ghostery ads + tracking blocking with cosmetic filtering
- Live blocked-request statistics
- Global Privacy Control + DNT request headers
- Tracking-parameter cleaning on top-level navigation
- Brave Search from the omnibox/new-tab search
- Vertical tabs and command palette
- Quick bookmarks on the new-tab page + Ctrl/Cmd+D
- Local browsing-history store
- Firefox, Chrome, Chromium, Brave, and Edge profile discovery
- Bookmark **and history** import
- Hardened renderer defaults: sandbox, context isolation and no Node integration

## Run it

```bash
git clone https://github.com/mixutin/veyra-browser
cd veyra-browser
npm install
npm start
```

Node.js 20+ is recommended.

### Build installable Linux packages

```bash
npm run dist:linux
```

This creates an AppImage and Debian package in `dist/`. On Ubuntu/Debian, prefer the `.deb`: its post-install hook configures Electron's Chromium sandbox helper with the required root ownership and SUID permission. Veyra does **not** ship a `--no-sandbox` default.

Tagged releases and manual workflow runs build Linux, Windows, and macOS artifacts in GitHub Actions.

## The end-state

Veyra is aiming at a **Chromium-class daily driver**, not an Electron toy. Electron is being used for the fast product-shell stage while we prove interaction design and browser services. The long-term platform work is documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Privacy

- Aggressive ads + tracker blocking
- EasyList/EasyPrivacy-compatible rules
- Cosmetic filtering
- Tracking-query stripping
- HTTPS upgrades
- Bounce-tracking mitigation
- Anti-fingerprinting defenses
- Per-site shield controls
- Third-party cookie controls
- Private and ephemeral workspaces
- No sponsored new-tab clutter
- No required Veyra account

### Power-user UX

- Vertical or horizontal tabs
- Workspaces and tab groups
- Split view
- Sidebar web apps
- Tab sleeping/freezing
- Peek tabs
- Command palette everywhere
- Fuzzy tab/history/bookmark search
- Fully remappable shortcuts
- Session snapshots
- Reader/focus modes
- Screenshot + annotation
- Copy-clean-link
- Picture-in-picture improvements
- Theme packs and custom CSS variables

### Migration

The migration wizard is a first-class feature, not an afterthought.

Current alpha: bookmarks and history from Firefox, Chrome, Chromium, Brave, and Edge profiles.

Planned next: open tabs/session import, search engines, selected settings, extension compatibility reporting, and password migration through OS-supported secure flows.

## Why not simply fork Brave today?

A production Chromium fork is a very large continuously-maintained security project. Starting with a browser shell lets Veyra validate UX, privacy services and migration without pretending a one-off Chromium snapshot is safe. Once the product model is stable, the project can move browser-engine integration toward Chromium/CEF with a defined rebasing and security-update process.

## Project status

**0.2 alpha — active development.** The browser is runnable and packageable, but it is not yet a hardened Chromium-fork replacement. Do not yet use Veyra as your only browser for sensitive accounts.

See [ROADMAP](docs/ROADMAP.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTRIBUTING](CONTRIBUTING.md), and [SECURITY](SECURITY.md).

## License

Mozilla Public License 2.0.