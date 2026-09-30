# Veyra Architecture

## Product strategy

Veyra has two layers:

1. **Browser product layer** — tabs, workspaces, profiles, migration, privacy controls, commands, UI and sync.
2. **Browser engine layer** — Chromium networking/rendering, sandboxing, extensions, site isolation, codecs and security rebases.

The prototype deliberately develops the product layer first while using Electron's Chromium runtime.

## Current prototype

```text
BrowserWindow (Veyra chrome)
├── local renderer UI
├── persistent session: persist:veyra
├── Ghostery ad/tracker blocker
└── WebContentsView per tab
    └── sandboxed remote web content
```

Remote pages do not receive Node.js integration. The local shell uses a narrow preload IPC surface.

## Browser services to extract

As Veyra grows, move responsibilities out of `main.js` into testable services:

- Tab/session service
- Workspace/container service
- Permissions broker
- History service
- Bookmark service
- Downloads service
- Search engine service
- Privacy/shields service
- Extension service
- Migration service
- Update/release service
- Sync service

## Privacy engine

The prototype uses `@ghostery/adblocker-electron` with its prebuilt ads-and-tracking engine.

The production target should add:

- cached filter engine with deterministic updates
- EasyList/EasyPrivacy and regional lists
- user rules and allowlists
- cosmetic filtering
- URL tracking-parameter sanitization
- CNAME uncloaking research
- bounce tracking mitigation
- HTTPS upgrades
- first/third-party cookie policy
- anti-fingerprinting defenses
- per-site shields UI and request counts

## Chromium path

Electron is not the final definition of Veyra.

A Chromium/CEF phase must address:

- upstream Chromium rebases on a strict cadence
- Chromium sandbox parity
- site isolation
- Chrome-extension compatibility strategy
- updater signing and rollback protection
- Safe Browsing or equivalent
- codec/patent/licensing review
- crash reporting that is opt-in and privacy-preserving
- reproducible CI builds
- Windows/macOS/Linux release signing

## Extensions

Electron's extension support is useful for experiments but does not equal Chrome Web Store parity. Extension compatibility should become a dedicated subsystem during the Chromium phase rather than being overpromised in the prototype.

## Sync

Sync should be optional and end-to-end encrypted. Encryption keys should be created client-side and the service should never require plaintext browsing data.