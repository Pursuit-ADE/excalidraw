import { exportToCanvas, exportToSvg } from "@excalidraw/utils";

import { applyDarkModeFilter } from "@excalidraw/common";

import { actionCopyAsPng, actionCopyAsSvg } from "../../actions";
import { copyBlobToClipboardAsPng } from "../../clipboard";
import { actionChangeExportWithAttribution } from "../../actions/actionExport";
import { getDefaultAppState } from "../../appState";
import { exportToCanvas as exportToCanvasInternal } from "../../scene/export";
import {
  EXPORT_ATTRIBUTION_COMPACT_TEXT,
  EXPORT_ATTRIBUTION_TEXT,
  getExportAttributionFontSize,
  getExportAttributionUrl,
} from "../../scene/exportAttribution";
import { API } from "../helpers/api";

import type { AppState } from "../../types";

const createRectangle = (width = 200, height = 100) =>
  API.createElement({ type: "rectangle", x: 0, y: 0, width, height });

const getBadge = (svg: SVGSVGElement) =>
  svg.querySelector<SVGAElement>("a.excalidraw-attribution");

const getBadgeText = (svg: SVGSVGElement) =>
  getBadge(svg)?.querySelector("text") ?? null;

const getFillTextCalls = (canvas: HTMLCanvasElement) =>
  (canvas.getContext("2d") as any)
    .__getEvents()
    .filter((event: any) => event.type === "fillText")
    .map((event: any) => event.props.text);

describe("export attribution badge", () => {
  it("is off by default in the npm package", () => {
    expect(getDefaultAppState().exportWithAttribution).toBe(false);
  });

  it("reads excalidraw.com", () => {
    expect(EXPORT_ATTRIBUTION_TEXT).toBe("excalidraw.com");
  });

  it("opens a new board instead of the last local drawing", () => {
    expect(getExportAttributionUrl("svg")).toBe(
      "https://excalidraw.com/?utm_source=excalidraw&utm_medium=export&utm_content=svg#new",
    );
  });

  it("grows with large diagrams and stays within limits", () => {
    expect(getExportAttributionFontSize(200, 100)).toBe(14);
    expect(getExportAttributionFontSize(1000, 200)).toBe(20);
    expect(getExportAttributionFontSize(5000, 3000)).toBe(40);
  });

  describe("exportToSvg", () => {
    it("is not added unless explicitly requested", async () => {
      // app state alone must not turn it on, so thumbnails and previews that
      // spread the editor's app state never get a badge
      const svg = await exportToSvg({
        elements: [createRectangle()],
        files: null,
        appState: { exportWithAttribution: true },
      });

      expect(getBadge(svg)).toBeNull();
    });

    it("adds a clickable badge below the drawing", async () => {
      const elements = [createRectangle(400, 200)];
      const withoutBadge = await exportToSvg({ elements, files: null });
      const svg = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
      });

      const badge = getBadge(svg);
      expect(badge).not.toBeNull();
      expect(badge!.getAttribute("href")).toBe(getExportAttributionUrl("svg"));
      expect(badge!.getAttribute("href")).toContain("utm_medium=export");
      expect(badge!.getAttribute("href")).toContain("#new");
      expect(badge!.getAttribute("target")).toBe("_blank");
      expect(badge!.getAttribute("rel")).toContain("noopener");
      expect(getBadgeText(svg)!.textContent).toBe(EXPORT_ATTRIBUTION_TEXT);
      expect(badge!.querySelector("path")).not.toBeNull();

      // the export grows so the badge never covers the drawing
      const drawingBottom = Number(withoutBadge.getAttribute("height"));
      expect(Number(svg.getAttribute("height"))).toBeGreaterThan(drawingBottom);
      expect(Number(getBadgeText(svg)!.getAttribute("y"))).toBeGreaterThan(
        drawingBottom,
      );
    });

    it("tags the SVG badge link as a clipboard copy when exported for clipboard", async () => {
      const elements = [createRectangle(400, 200)];

      const fileExport = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
      });
      expect(getBadge(fileExport)!.getAttribute("href")).toBe(
        getExportAttributionUrl("svg"),
      );

      // "Copy as SVG" (Export window, right-click, or Shift+Alt+C) is still a
      // clickable badge — it just has to say "clipboard", not "svg", so the
      // Brand Visibility Rate can be measured per format (PRD §2d, §3, Appendix A)
      const clipboardCopy = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
        exportAttributionFormat: "clipboard",
      });
      const badge = getBadge(clipboardCopy);
      expect(badge!.getAttribute("href")).toBe(
        getExportAttributionUrl("clipboard"),
      );
      expect(badge!.getAttribute("href")).toContain("utm_content=clipboard");
      expect(badge!.getAttribute("target")).toBe("_blank");
    });

    it("widens tiny exports so the badge fits", async () => {
      const svg = await exportToSvg({
        elements: [createRectangle(10, 10)],
        files: null,
        exportWithAttribution: true,
      });

      const width = Number(svg.getAttribute("width"));
      const textRight = Number(getBadgeText(svg)!.getAttribute("x"));
      expect(textRight).toBeLessThanOrEqual(width);
      expect(width).toBeGreaterThan(30);
    });

    it("uses the compact logo + excalidraw.com badge on tiny exports", async () => {
      const svg = await exportToSvg({
        elements: [createRectangle(10, 10)],
        files: null,
        exportWithAttribution: true,
      });

      expect(getBadgeText(svg)!.textContent).toBe(
        EXPORT_ATTRIBUTION_COMPACT_TEXT,
      );
      expect(getBadge(svg)!.querySelector("path")).not.toBeNull();
    });

    it("keeps the full excalidraw.com badge on ordinary exports", async () => {
      const svg = await exportToSvg({
        elements: [createRectangle(400, 200)],
        files: null,
        exportWithAttribution: true,
      });

      expect(getBadgeText(svg)!.textContent).toBe(EXPORT_ATTRIBUTION_TEXT);
    });

    it("exports the three PRD appendix E comparison versions", async () => {
      const elements = [createRectangle(400, 200)];
      const off = await exportToSvg({ elements, files: null });
      const textOnly = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
        exportAttributionVariant: "text",
      });
      const logoAndText = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
        exportAttributionVariant: "logoAndText",
      });

      expect(getBadge(off)).toBeNull();

      expect(getBadgeText(textOnly)!.textContent).toBe(EXPORT_ATTRIBUTION_TEXT);
      expect(getBadge(textOnly)!.querySelector("path")).toBeNull();

      expect(getBadgeText(logoAndText)!.textContent).toBe(
        EXPORT_ATTRIBUTION_TEXT,
      );
      expect(getBadge(logoAndText)!.querySelector("path")).not.toBeNull();
    });

    it("follows dark mode", async () => {
      const elements = [createRectangle()];
      const light = await exportToSvg({
        elements,
        files: null,
        exportWithAttribution: true,
      });
      const dark = await exportToSvg({
        elements,
        files: null,
        appState: { exportWithDarkMode: true },
        exportWithAttribution: true,
      });

      expect(getBadgeText(light)!.getAttribute("fill")).toBe("#46464f");
      expect(getBadgeText(dark)!.getAttribute("fill")).toBe(
        applyDarkModeFilter("#46464f"),
      );
    });

    it("adds an outline only on transparent exports", async () => {
      const elements = [createRectangle()];
      const transparent = await exportToSvg({
        elements,
        files: null,
        appState: { exportBackground: false },
        exportWithAttribution: true,
      });
      const withBackground = await exportToSvg({
        elements,
        files: null,
        appState: { exportBackground: true, viewBackgroundColor: "#ffffff" },
        exportWithAttribution: true,
      });

      expect(getBadgeText(transparent)!.getAttribute("stroke")).toBeTruthy();
      expect(getBadgeText(withBackground)!.getAttribute("stroke")).toBeNull();
    });

    it("sizes the badge to only the exported elements, not a wider scene", async () => {
      // "Only selected" exports (Day 19 P0): the caller already filters
      // `elements` down to the selection before calling exportToSvg, so a
      // small selection must not be sized as if the far-away rest of the
      // scene were still part of the export.
      const selection = [createRectangle(100, 60)];
      const svg = await exportToSvg({
        elements: selection,
        files: null,
        exportWithAttribution: true,
      });

      // a lone 1600x1200 rectangle would need a much wider canvas than 100x60
      expect(Number(svg.getAttribute("width"))).toBeLessThan(400);
    });

    it("keeps at least an 8px margin when export padding is 0", async () => {
      const svg = await exportToSvg({
        elements: [createRectangle(400, 200)],
        files: null,
        exportPadding: 0,
        exportWithAttribution: true,
      });

      const badge = getBadge(svg)!;
      const path = badge.querySelector("path")!;
      const transform = path.getAttribute("transform") || "";
      const [badgeX] = transform
        .replace("translate(", "")
        .split(")")[0]
        .split(" ")
        .map(Number);

      expect(badgeX).toBeGreaterThanOrEqual(8);
      expect(
        Number(svg.getAttribute("width")) - badgeX,
      ).toBeGreaterThanOrEqual(8);
    });

    it("stays inside the canvas on extreme aspect ratios", async () => {
      const veryWide = await exportToSvg({
        elements: [createRectangle(3000, 20)],
        files: null,
        exportWithAttribution: true,
      });
      const veryTall = await exportToSvg({
        elements: [createRectangle(20, 3000)],
        files: null,
        exportWithAttribution: true,
      });

      for (const svg of [veryWide, veryTall]) {
        const badge = getBadgeText(svg)!;
        expect(Number(badge.getAttribute("x"))).toBeLessThanOrEqual(
          Number(svg.getAttribute("width")),
        );
        expect(Number(badge.getAttribute("x"))).toBeGreaterThan(0);
      }
    });
  });

  describe("exportToCanvas", () => {
    it("draws the badge only when requested", async () => {
      const elements = [createRectangle(400, 200)];
      const withoutBadge = await exportToCanvas({ elements, files: null });
      const canvas = await exportToCanvas({
        elements,
        files: null,
        exportWithAttribution: true,
      });

      expect(getFillTextCalls(withoutBadge)).not.toContain(
        EXPORT_ATTRIBUTION_TEXT,
      );
      expect(getFillTextCalls(canvas)).toContain(EXPORT_ATTRIBUTION_TEXT);
      expect(canvas.height).toBeGreaterThan(withoutBadge.height);
    });

    it("draws the compact badge on tiny canvas exports", async () => {
      const canvas = await exportToCanvas({
        elements: [createRectangle(10, 10)],
        files: null,
        exportWithAttribution: true,
      });

      expect(getFillTextCalls(canvas)).toContain(
        EXPORT_ATTRIBUTION_COMPACT_TEXT,
      );
    });

    it("still draws the badge at 2x and 3x export scale", async () => {
      // exercises the internal exportToCanvas that the app (data/index.ts)
      // actually calls, where appState.exportScale drives canvas sizing —
      // the public @excalidraw/utils wrapper above only scales when a
      // maxWidthOrHeight/getDimensions callback is supplied, which is a
      // separate, pre-existing quirk of that wrapper, not of the badge.
      const elements = [API.createElement({ type: "rectangle", width: 400, height: 200 })];
      const appState = {
        ...getDefaultAppState(),
        exportWithAttribution: true,
        width: 0,
        height: 0,
        offsetTop: 0,
        offsetLeft: 0,
      };

      const at1x = await exportToCanvasInternal(
        elements,
        { ...appState, exportScale: 1 },
        {},
        { exportBackground: true, viewBackgroundColor: "#ffffff", exportWithAttribution: true },
      );
      const at3x = await exportToCanvasInternal(
        elements,
        { ...appState, exportScale: 3 },
        {},
        { exportBackground: true, viewBackgroundColor: "#ffffff", exportWithAttribution: true },
      );

      expect(getFillTextCalls(at3x)).toContain(EXPORT_ATTRIBUTION_TEXT);
      expect(at3x.width).toBe(at1x.width * 3);
      expect(at3x.height).toBe(at1x.height * 3);
    });
  });

  describe("tracking", () => {
    const appState = (exportWithAttribution: boolean) =>
      ({ ...getDefaultAppState(), exportWithAttribution } as AppState);

    it("counts copies to the clipboard as exports", () => {
      for (const action of [actionCopyAsPng, actionCopyAsSvg]) {
        expect(action.trackEvent && action.trackEvent.category).toBe("export");
      }
    });

    it("records whether the badge was on", () => {
      const trackEvent = actionCopyAsPng.trackEvent;
      if (!trackEvent) {
        throw new Error("copyAsPng should be tracked");
      }
      expect(trackEvent.getLabelSuffix?.(appState(true))).toBe(
        "attribution:on",
      );
      expect(trackEvent.getLabelSuffix?.(appState(false))).toBe(
        "attribution:off",
      );

      const toggle = actionChangeExportWithAttribution.trackEvent;
      if (!toggle) {
        throw new Error("the badge toggle should be tracked");
      }
      expect(toggle.getLabelSuffix?.(appState(true), false)).toBe(
        "attribution:off",
      );
    });
  });

  describe("copy to clipboard", () => {
    const readBlob = (blob: Blob) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });

    let written: Record<string, Blob | Promise<Blob>>[] = [];
    let write: ReturnType<typeof vi.fn>;
    const originalClipboard = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );

    beforeEach(() => {
      written = [];
      write = vi.fn(async (items: { data: Record<string, any> }[]) => {
        written.push(items[0].data);
      });
      vi.stubGlobal(
        "ClipboardItem",
        class {
          constructor(public data: Record<string, any>) {}
        },
      );
      Object.defineProperty(navigator, "clipboard", {
        value: { write },
        configurable: true,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", originalClipboard);
      } else {
        delete (navigator as any).clipboard;
      }
    });

    const png = () =>
      new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    const link = {
      href: getExportAttributionUrl("clipboard"),
      alt: "excalidraw.com",
      canvas: { width: 1640, height: 274 } as HTMLCanvasElement,
      scale: 2,
    };

    it("copies a linked version of the image when the badge is on", async () => {
      await copyBlobToClipboardAsPng(png(), link);

      expect(write).toHaveBeenCalledTimes(1);
      expect(Object.keys(written[0])).toEqual(["image/png", "text/html"]);
      const html = await readBlob(await written[0]["text/html"]);
      expect(html).toContain(
        'href="https://excalidraw.com/?utm_source=excalidraw&amp;utm_medium=export&amp;utm_content=clipboard#new"',
      );
      expect(html).toContain('src="data:image/png;base64,');
      // sized at 1x even when exported at 2x
      expect(html).toContain('width="820" height="137"');
    });

    it("copies the image alone without a link", async () => {
      await copyBlobToClipboardAsPng(png());

      expect(write).toHaveBeenCalledTimes(1);
      expect(Object.keys(written[0])).toEqual(["image/png"]);
    });

    it("falls back to the image alone if the linked version is rejected", async () => {
      write.mockRejectedValueOnce(new Error("text/html not supported"));
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      await copyBlobToClipboardAsPng(png(), link);

      expect(write).toHaveBeenCalledTimes(2);
      expect(Object.keys(written[0])).toEqual(["image/png"]);
      warn.mockRestore();
    });
  });
});
