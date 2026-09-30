# Changelog

## 0.3.0-alpha.2 — Gaming + resource control

- Repositioned Veyra as a gaming-first privacy browser and Opera GX alternative.
- Rebuilt the browser chrome with a sleeker, lower-noise dark UI.
- Added **Veyra Control** with live application RAM and CPU metrics.
- Added Game, Balanced, and Saver resource presets.
- Added configurable soft RAM target, warm-tab limit, and auto-sleep timer.
- Added automatic sleeping for least-recently-used inactive tabs.
- Added Ctrl/Cmd+Shift+G Game Mode shortcut.
- Added a live performance dashboard on the new-tab page.
- Added Windows NSIS installer, portable executable, and ZIP build targets.
- Added automatic release upload for Linux, Windows, and macOS artifacts.
- Disabled electron-builder implicit publishing on tags so packaging never fails after artifacts are built.
- Added resource-controller unit tests.

## 0.2.0 — Alpha browser core

- Added crash/restart-safe tab and workspace persistence.
- Added Personal, Work, Research, and user-created workspaces.
- Added real two-page split view with side swapping.
- Added lazy-restored tabs and manual inactive-tab sleeping.
- Added recently closed tabs with Ctrl/Cmd+Shift+T.
- Added Ctrl/Cmd+W, Ctrl/Cmd+Tab, and numbered tab switching.
- Added quick bookmarks and Ctrl/Cmd+D.
- Added local Veyra browsing history.
- Added Firefox history import.
- Added Chromium/Chrome/Brave/Edge history import.
- Added live Veyra Shield block statistics.
- Added Global Privacy Control and DNT request headers.
- Added top-level tracking-query cleaning.
- Added Linux AppImage and Debian package builds.
- Added Debian Chromium-sandbox permission setup.
- Added tagged/manual GitHub Actions builds for Linux, Windows, and macOS.
- Added unit tests for state and local-library behavior.

The 0.2 line is still an alpha product shell. The long-term goal remains a maintained Chromium-class browser platform with extension compatibility, rapid security rebases, per-site privacy controls, and a signed updater.
