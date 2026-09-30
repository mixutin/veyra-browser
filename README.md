# Veyra Browser

> **A modern, privacy-first browser for people who actually live in the web.**

Veyra is an open browser project combining the privacy ambitions of Brave with the workflow ideas that make modern browsers such as Zen compelling: vertical tabs, workspaces, split views, command-first navigation, sane defaults, and a calm UI.

The goal is not to reskin Chromium. The goal is to build a browser that is easier to migrate to, harder to track, faster to operate, and less cluttered.

## What works today

- Real multi-tab browsing using Electron `WebContentsView`
- Persistent isolated Veyra browser profile
- Ghostery's ads + tracking blocking engine at the network layer
- Brave Search from the omnibox/new-tab search
- Vertical-tab shell
- Command palette
- Ctrl/Cmd+L, Ctrl/Cmd+T and Ctrl/Cmd+K workflows
- Popups/new windows redirected into tabs
- Automatic browser-profile discovery
- Bookmark import from Firefox, Chrome, Chromium, Brave and Edge
- Hardened renderer defaults: sandbox, context isolation and no Node integration

## Run it

```bash
git clone https://github.com/mixutin/veyra-browser
cd veyra-browser
npm install
npm start
```

Node.js 20+ is recommended.

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

Current prototype: bookmarks from Firefox/Chromium-family profiles.

Planned: history, open tabs, search engines, selected settings, extensions where compatible, and password migration through OS-supported secure flows.

## Why not simply fork Brave today?

A production Chromium fork is a very large continuously-maintained security project. Starting with a browser shell lets Veyra validate UX, privacy services and migration without pretending a one-off Chromium snapshot is safe. Once the product model is stable, the project can move browser-engine integration toward Chromium/CEF with a defined rebasing and security-update process.

## Project status

**0.1 prototype — active development.** Do not yet use Veyra as your only browser for sensitive accounts.

See [ROADMAP](docs/ROADMAP.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTRIBUTING](CONTRIBUTING.md), and [SECURITY](SECURITY.md).

## License

Mozilla Public License 2.0.