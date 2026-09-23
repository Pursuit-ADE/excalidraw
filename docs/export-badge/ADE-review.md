# ADE review of branch `Mitra`

Reviewer: Adedoyin (branch `ADE`)
Reviewed: [origin/Mitra](https://github.com/Pursuit-ADE/excalidraw/tree/Mitra) at `376e4399`
Against: Group 8 PRD (Sep 19, 2026) and Day 15–20 roadmap only

Mitra’s five commits are kept as-is. This file is the test/QA result for the team.

## How this was tested

- Read the `origin/Mitra` diff vs `ADE` (38 files, +1358/−31).
- Read `packages/excalidraw/scene/exportAttribution.ts`, export/clipboard/dialog/app wiring, and `docs/export-badge/README.md`.
- Inspected `docs/export-badge/example-export.svg` (badge is an `<a class="excalidraw-attribution">` with UTM `utm_content=svg`; text is **Excalidraw.com**).
- Unit tests and `yarn start` were **not** re-run here: the machine had **no free disk** (`df` showed ~170MB, `yarn install` died with `ENOSPC`). Mitra’s write-up says 16 badge tests and 2,213 suite tests passed on her machine.

Please run locally when there is disk:

```bash
yarn
yarn test:app --watch=false packages/excalidraw/tests/scene/exportAttribution.test.ts excalidraw-app/tests/AppFooter.test.tsx
yarn start
```

Then: draw a shape → Ctrl+Shift+E → confirm preview, PNG, SVG, copy, toggle, dark mode, transparent background.

## What matches the PRD / roadmap (P0)

| Roadmap / PRD | On `Mitra`? |
| --- | --- |
| Day 15: logo + text on Export-window PNG and SVG, bottom-right, below the drawing | Yes. Extra height so it does not cover shapes. |
| Day 16: Export-window copy, right-click Copy as PNG/SVG, Shift+Alt+C | Yes. All go through `exportCanvas` / `exportToSvg`. |
| Day 16: SVG clickable to excalidraw.com with campaign tags | Yes. `https://excalidraw.com/?utm_source=excalidraw&utm_medium=export&utm_content=svg`, `target="_blank"`. |
| Day 17: one Export-window toggle; preview and file follow it | Yes. `actionChangeExportWithAttribution` + switch in `ImageExportDialog`. |
| Day 17: on by default on excalidraw.com; off in npm package | Yes. `getDefaultAppState().exportWithAttribution === false`; app uses `APP_DEFAULT_APP_STATE` (`true`). Utils require an explicit `exportWithAttribution` opt so thumbnails that spread appState do not get a badge. |
| Day 18: copy paths counted as `export`; `attribution:on` / `off` | Yes. `copyAsPng` / `copyAsSvg` category `"export"` + `getLabelSuffix`. `onExportImage` label includes `attribution:on\|off`. |
| Day 18: dark mode + transparent readability | Yes. Text `#46464f` / inverted in dark; halo outline only when `exportBackground` is false. |
| Day 19: tiny/huge, selection, custom bg; npm off | Layout widens tiny exports; font scales 14–40px with size (P1 as well). Library default off is tested. |
| Logo from Excalidraw pencil, purple `#6965db`, Excalifont | Yes. |

## Wrong vs the PRD (copy)

PRD appendix B: badge content is the logo followed by **“Made with excalidraw.com”**.
PRD Day 17 / §3: toggle labelled **Add “Made with Excalidraw”** (`labels.addWatermark`, already in 57 locales).

On `Mitra`:

- Badge text is **`Excalidraw.com`** (`EXPORT_ATTRIBUTION_TEXT`).
- Toggle label is **`Add "Excalidraw.com"`** (`imageExportDialog.label.attribution` in `en.json` only).
- `labels.addWatermark` / `labels.madeWithExcalidraw` are still unused.

Mitra’s README flags this as still open (“capital E”; wording vs `excalidraw.com`). Until Avni/the test kit picks otherwise, the written PRD still says **Made with excalidraw.com**.

## Extra vs the PRD (not P0; some are non-goals or P2)

These work in code, but they are **not** Day 15–20 P0 and some conflict with PRD non-goals / “other surfaces”:

1. **Whiteboard corner badge** (`ExcalidrawComBadge` in `AppFooter`) — always on, not tied to the export toggle. PRD non-goal: other surfaces.
2. **Phone badge** (`MobileExcalidrawComBadge`) — same.
3. **Clickable clipboard HTML** (`copyBlobToClipboardAsPng` + `text/html` `<a><img>`) — PRD P2 / non-goal for PNG/clipboard links. Mitra’s paste tests: Word keeps the link; Google Docs drops it.
4. **Remember toggle in the browser** — PRD P1 (roadmap cut #5). Implemented via `exportWithAttribution` in localStorage / `APP_DEFAULT_APP_STATE`.
5. **Badge growing with diagram size** (14–40px) — PRD P1 (roadmap cut #4). Implemented.

## Gaps / risks

- **Wording** is the main P0 miss (see above).
- **Toggle not translated** (new `en.json` key instead of existing `addWatermark`).
- **Corner badge cannot be turned off** while export badge can — creators who hide the export badge still see “Excalidraw.com” on the canvas. That is more visible than Avni’s “subtle, never look like an ad.”
- **Canvas badge URL** uses `utm_medium=app&utm_content=canvasBadge` and **local origin** while testing, not `utm_medium=export`. Fine for a local demo; not the PRD export campaign.
- **Could not re-verify** tests or the live Export window on this machine (disk full).

## Done on ADE after this review

1. `EXPORT_ATTRIBUTION_TEXT` is `excalidraw.com` (shorter, subtler credit).
2. Export toggle uses Avni’s pick: **Give Excalidraw a nod**, plus the “?” tooltip.
3. P2 compact badge: tiny exports use logo + `excalidraw.com` when the full string would overflow.
4. P2 comparison versions: `exportAttributionVariant` `"text"` | `"logoAndText"` plus [`docs/export-badge/comparison-test.md`](comparison-test.md).

Still a team call: keep or strip the corner/phone badge and HTML clipboard link.
