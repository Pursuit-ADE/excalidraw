import {
  EXCALIDRAW_LOGO_ICON_PATH,
  EXCALIDRAW_LOGO_ICON_VIEWBOX,
  EXPORT_ATTRIBUTION_TEXT,
} from "@excalidraw/excalidraw/scene/exportAttribution";

export const EXCALIDRAW_COM_BADGE_URL =
  "https://excalidraw.com/?utm_source=excalidraw&utm_medium=app&utm_content=canvasBadge";

/** always-visible "Excalidraw.com" link in the bottom-right of the whiteboard */
export const ExcalidrawComBadge = () => (
  <a
    className="excalidraw-com-badge"
    href={EXCALIDRAW_COM_BADGE_URL}
    target="_blank"
    rel="noopener noreferrer"
    title={`Open ${EXPORT_ATTRIBUTION_TEXT}`}
  >
    <svg
      viewBox={`0 0 ${EXCALIDRAW_LOGO_ICON_VIEWBOX} ${EXCALIDRAW_LOGO_ICON_VIEWBOX}`}
      aria-hidden="true"
    >
      <path d={EXCALIDRAW_LOGO_ICON_PATH} fill="currentColor" />
    </svg>
    <span>{EXPORT_ATTRIBUTION_TEXT}</span>
  </a>
);
