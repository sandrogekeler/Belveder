# Belveder: roadmap

Intent, not record. What is done lives in the code and the closed issues; this
file says what is next and why. Unchecked items are not done.

## Now

- [ ] Receive GitHub App webhooks and backfill nightly

## Next

- [ ] PWA shell: GitHub sign-in, issues by priority over WebSocket
- [ ] Panels: roadmap, PRs waiting, red main, health sweep, template drift

## Later

- [ ] Web Push for new p0, red main and review requested
- [ ] Desktop app: Tauri 2 around the same frontend, Windows first. The phone
      keeps the PWA. Chosen 2026-11-20: a web page cannot read the disk, and
      the File System Access API is Chromium only (Sandro tests in Firefox).
- [ ] Local projects panel in the desktop app: types are the folders in
      `D:\Private\Projects`, projects the folders in each type (a type can
      name a subfolder, such as `MusicProduction\Projects`). Cards show last
      change and the main file's program, plus GitHub data for git folders.
      Opens a folder in Explorer or a file in its program. Never deletes.
      File paths stay on the PC.
- [ ] New project from a type's template folder
