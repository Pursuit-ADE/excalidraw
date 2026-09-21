import { exportToCanvas, exportToSvg } from "@excalidraw/utils";

import { applyDarkModeFilter } from "@excalidraw/common";

import { actionCopyAsPng, actionCopyAsSvg } from "../../actions";
import { actionChangeExportWithAttribution } from "../../actions/actionExport";
import { getDefaultAppState } from "../../appState";
import {
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

  it("reads Excalidraw.com", () => {
    expect(EXPORT_ATTRIBUTION_TEXT).toBe("Excalidraw.com");
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
      const elements = [createRectangle()];
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
  });

  describe("exportToCanvas", () => {
    it("draws the badge only when requested", async () => {
      const elements = [createRectangle()];
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
});
