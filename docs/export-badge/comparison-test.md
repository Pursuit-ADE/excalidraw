# Creator / viewer comparison test (PRD P2, appendix E)

Three versions only — not a third Export-window toggle. Run this with real people; the export API can produce the files.

| Version | How to export | What they should see |
| --- | --- | --- |
| Off (none) | Export without `exportWithAttribution` | Drawing only |
| Text only | `exportWithAttribution: true`, `exportAttributionVariant: "text"` | `excalidraw.com`, no logo |
| Logo + copy | `exportWithAttribution: true` (default variant) | Logo + `excalidraw.com` |

Tiny diagrams still use the P2 compact mark on the logo + copy version: logo + `excalidraw.com`.

```js
import { exportToSvg } from "@excalidraw/utils";

const files = null;
const off = await exportToSvg({ elements, files });
const text = await exportToSvg({
  elements,
  files,
  exportWithAttribution: true,
  exportAttributionVariant: "text",
});
const logoAndText = await exportToSvg({
  elements,
  files,
  exportWithAttribution: true,
});
```

Automated check: `packages/excalidraw/tests/scene/exportAttribution.test.ts` (“exports the three PRD appendix E comparison versions”).

## Creator script

Same diagram, same Export image window, three files (or three previews). After each:

1. Would you leave this on when you export?
2. Does it look like an ad, or like a small credit?
3. Would you turn it off? Why?

## Viewer script

Show the three images without saying which tool made them. After each:

1. What tool made this?
2. Can you read a site you could type?
3. (SVG in a browser) Does the badge open Excalidraw in a new tab?

## Decision rule

Ship the version creators will leave on **and** viewers can name Excalidraw from. If those disagree, keep the quieter mark.
