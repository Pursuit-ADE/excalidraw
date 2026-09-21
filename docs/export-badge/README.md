# Excalidraw.com badge

Group 8 (Mitra Kermanian, Adedoyin Ahoton, Bertrand Cius, Jimmy Ong, Christian Douka) · branch `Mitra` · September 21, 2026

Built from our [PRD](https://docs.google.com/document/d/1rL5RdZMQbKbBUnGbWUuceDsuuRutfZGiX5hzWvQI3TA/edit) for Avni Nahar, Head of Marketing. Full visual write-up (ask Mitra for access): [Excalidraw.com Badge Build](https://claude.ai/artifact/NidnBVNnrCaRxJY5Hx3Jok).

## What it does

- **Every image export carries a small badge**: the Excalidraw logo and "Excalidraw.com", in the bottom-right corner, below the drawing so it never covers a shape. PNG, SVG and all three clipboard copies.
- **The whiteboard shows the same badge, always on**, in the bottom-right corner next to the encryption icon. It opens excalidraw.com in a new tab.
- **One switch removes it from exports**: Add "Excalidraw.com" in the Export image window. It is on by default on excalidraw.com, off by default for apps that use the npm package, and the choice is remembered in the browser.
- **Every export is measured**: right-click and Shift+Alt+C copies now count as exports, and every export records `attribution:on` or `attribution:off`.

![The whiteboard with the Excalidraw.com badge in the bottom-right corner](01-whiteboard.png)

| Switch on (default) | Switch off |
| --- | --- |
| ![Export window with the badge in the preview](03-export-dialog.png) | ![Export window with the badge switched off](05-export-dialog-off.png) |

Exported PNG, light and dark mode:

![PNG export with the badge](export-light.png)

![PNG export in dark mode with the badge](export-dark.png)

Corner badge in dark theme:

![Corner badge in dark theme](07-corner-dark.png)

[`example-export.svg`](example-export.svg) is a real SVG export. Open it in a browser and click the badge: it links to `https://excalidraw.com/?utm_source=excalidraw&utm_medium=export&utm_content=svg`.

## Where a click works

| Where the badge appears | Clickable | Why |
| --- | --- | --- |
| The whiteboard corner | Yes | A normal link, opens in a new tab. |
| SVG file, or Copy to clipboard as SVG | Yes | SVG can hold links (opened in a browser or inside a page). |
| SVG shown as a picture, for example in a GitHub README | No | Browsers turn links off inside images shown this way. |
| PNG file | No | A PNG is only pixels. The readable address does the job. |
| Image copied to the clipboard | Not yet | Next step: also copy a linked version, after paste testing. |

## Tracking

| What someone does | Event | Label example |
| --- | --- | --- |
| PNG, SVG or Copy from the Export window | `export` · `png` / `svg` / `clipboard` | `ui \| attribution:on` |
| Right-click, Copy to clipboard as PNG or SVG | `export` · `copyAsPng` / `copyAsSvg` | `contextMenu (desktop) \| attribution:on` |
| Shift+Alt+C | `export` · `copyAsPng` | `keyboard (desktop) \| attribution:off` |
| Turn the badge switch on or off | `export` · `toggleAttribution` | `ui (desktop) \| attribution:off` |

Brand Visibility Rate = exports labelled `attribution:on` ÷ all exports, per format. Target: at least 50% in every format within three months.

## Where the badge never appears

The badge is an option an export has to ask for directly; it is never read from the editor's settings. So it can't leak into library thumbnails and previews, images the AI feature makes, the Publish Library window, or other apps built with the npm package. A test checks this.

## Try it

```bash
yarn
yarn start
```

Open http://localhost:3001, draw something, and open the Export image window (Ctrl+Shift+E).

## Main files

- `packages/excalidraw/scene/exportAttribution.ts`: draws the badge and builds the SVG link
- `packages/excalidraw/scene/export.ts`: makes room for the badge in PNG and SVG exports
- `packages/excalidraw/components/ImageExportDialog.tsx`: the switch and live preview
- `excalidraw-app/components/ExcalidrawComBadge.tsx`: the corner badge
- `excalidraw-app/data/localStorage.ts`: on by default for excalidraw.com
- `packages/excalidraw/actions/actionClipboard.tsx`: copies count as exports
- Tests: `packages/excalidraw/tests/scene/exportAttribution.test.ts`, `excalidraw-app/tests/AppFooter.test.tsx`

## Checks

- 12 new tests; the full suite passes (2,209 tests, 137 files)
- Type check, lint and formatting clean
- Checked in the real app: new visitors start with the badge on, switching it off removes it, the choice survives a reload, dark mode works

## Still open

- Clickable clipboard images (copy a linked version, test pasting into Google Docs, Gmail and Word first)
- The corner badge on phones (Excalidraw's mobile menu)
- PRD P2 items: a smaller badge for very small exports, and the badge test with real users
- Open a pull request and record a demo
