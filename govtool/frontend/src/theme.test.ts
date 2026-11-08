import { describe, expect, it } from "vitest";

// GovTool's theme and consts barrel import each other; loading the barrel
// first gives the same evaluation order as the app.
import { ds, FONT_FAMILY, RADIUS, SHADOWS } from "@consts";
import { theme } from "@/theme";

describe("theme", () => {
  it("uses the Figma brand blue", () => {
    expect(theme.palette.primary.main).toBe("#1447E6");
    expect(theme.palette.primaryBlue).toBe("#1447E6");
  });

  it("exposes the design scales on the palette", () => {
    expect(theme.palette.ds.gray["900"]).toBe("#101828");
    expect(theme.palette.ds.primary["600"]).toBe(ds.primary["600"]);
  });

  it("maps legacy text keys to the new grays", () => {
    expect(theme.palette.textBlack).toBe("#101828");
    expect(theme.palette.textGray).toBe("#475467");
  });

  it("uses Figma shadows and radius", () => {
    expect(theme.shadows[1]).toBe(SHADOWS.header);
    expect(theme.shadows[3]).toBe(SHADOWS.cardBlue);
    expect(theme.shape.borderRadius).toBe(RADIUS.md);
  });

  it("sets Geist as the font", () => {
    expect(theme.typography.fontFamily).toBe(FONT_FAMILY.sans);
  });
});
