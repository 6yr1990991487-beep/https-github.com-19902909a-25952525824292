import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

// Minimal in-memory routing harness — simulates a click on each sitelink
// and asserts the router lands on the exact internal URL. Partner links
// keep their absolute href + open in a new tab.

const InternalSitelinks: Array<[RegExp, string]> = [
  [/^Lovanet Plateforme officiel →$/i, "/"],
  [/^Catalogue →$/i, "/anime-catalog"],
  [/^Univers Lovanet →$/i, "/univers"],
  [/^Magasin →$/i, "/shop"],
  [/^AnimemomentsAnimeofficiel → YouTube$/i, "/chaine-youtube"],
  [/^AnimemomentsAnimeofficiel →$/i, "/chaine-youtube"],
  [/^Anime\.Moments\.officiel → Prime Video$/i, "/prime-video"],
  [/^Anime\.Moments\.officiel → TikTok$/i, "/tiktok"],
  [/^À venir →$/i, "/anime-countdown"],
];

const PartnerLinks: Array<[string, string]> = [
  ["youtube-partner", "https://www.youtube.com/@animemomentsanimeofficiel"],
  ["prime-partner", "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime"],
  ["tiktok-partner", "https://www.tiktok.com/@anime.moments.officiel"],
];

function AppUnderTest({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div><h1>route:/</h1><Footer /></div>} />
        <Route path="/univers" element={<div><h1>route:/univers</h1><Footer /></div>} />
        <Route path="/shop" element={<div><h1>route:/shop</h1><Footer /></div>} />
        <Route path="/anime-countdown" element={<div><h1>route:/anime-countdown</h1><Footer /></div>} />
        <Route path="/anime-catalog" element={<div><h1>route:/anime-catalog</h1><Footer /></div>} />
        <Route path="/chaine-youtube" element={<div><h1>route:/chaine-youtube</h1><Footer /></div>} />
        <Route path="/prime-video" element={<div><h1>route:/prime-video</h1><Footer /></div>} />
        <Route path="/tiktok" element={<div><h1>route:/tiktok</h1><Footer /></div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("E2E — sitelinks navigation & partner targets", () => {
  it.each(InternalSitelinks)("clicking %s navigates to %s (no _blank)", async (label, path) => {
    const user = (await import("@testing-library/react")).fireEvent;
    const { unmount } = render(<AppUnderTest path="/" />);
    // Use the first matching link — Footer may render duplicates in nav + footer columns.
    const link = screen.getAllByRole("link", { name: label })[0];
    expect(link.getAttribute("href")).toBe(path);
    expect(link).not.toHaveAttribute("target", "_blank");
    user.click(link, { button: 0 });
    expect(await screen.findByRole("heading", { name: `route:${path}` })).toBeInTheDocument();
    unmount();
  });

  it.each(PartnerLinks)("partner %s opens %s in a new tab with noopener noreferrer", (_id, href) => {
    render(<AppUnderTest path="/" />);
    const anchors = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href") === href);
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      expect(a).toHaveAttribute("target", "_blank");
      const rel = a.getAttribute("rel") ?? "";
      expect(rel).toMatch(/noopener/);
      expect(rel).toMatch(/noreferrer/);
    }
  });
});