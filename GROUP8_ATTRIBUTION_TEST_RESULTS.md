# Group 8: Independent Attribution Testing

Tester: Christian
Branch: christian/attribution-testing
Implementation tested: Mitra's Excalidraw attribution changes

## Objective

Verify that the Excalidraw logo and domain appear in exported drawings when attribution is enabled and are absent when disabled.

## Test Results

| Test | Result |
| --- | --- |
| PNG export with attribution enabled | PASS |
| PNG export with attribution disabled | PASS |
| Clipboard image with attribution enabled | PASS |
| Clipboard image with attribution disabled | PASS |

## Observations

- The export preview displays the Excalidraw logo and domain when attribution is enabled.
- The attribution toggle gives users control before exporting.
- The logo and domain appeared relatively large in the initial preview.
- A successfully downloaded PNG was opened in macOS Preview and confirmed to contain the attribution.
- Clipboard attribution was tested by pasting into Google Docs.

## Issues Encountered During Testing

- Creating a shareable link failed during an earlier local test.
- Some initial PNG exports produced empty files.
- A browser file-writing operation failed in Cursor's embedded browser.
- Retesting in Safari allowed the PNG export to be verified.

These issues should not be treated as confirmed defects in the attribution implementation without further investigation.

## Recommendation

Keep attribution optional and controlled before export. Review the badge size to ensure it remains visible without distracting from the drawing.

## Scope

This report documents independent testing only. No changes to Mitra's implementation are included.