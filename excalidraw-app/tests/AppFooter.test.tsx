import { Excalidraw } from "@excalidraw/excalidraw";
import { render } from "@excalidraw/excalidraw/tests/test-utils";

import { AppFooter } from "../components/AppFooter";
import { EXCALIDRAW_COM_BADGE_URL } from "../components/ExcalidrawComBadge";

describe("AppFooter", () => {
  it("always shows a clickable Excalidraw.com badge", async () => {
    await render(
      <Excalidraw>
        <AppFooter onChange={() => {}} />
      </Excalidraw>,
    );

    const badge = document.querySelector<HTMLAnchorElement>(
      "a.excalidraw-com-badge",
    );

    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("Excalidraw.com");
    expect(badge!.getAttribute("href")).toBe(EXCALIDRAW_COM_BADGE_URL);
    expect(badge!.getAttribute("href")).toContain("utm_content=canvasBadge");
    expect(badge!.target).toBe("_blank");
    expect(badge!.rel).toContain("noopener");
  });
});
