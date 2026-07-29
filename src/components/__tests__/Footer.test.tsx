import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "../Footer";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe("Footer sitelinks & partenaires", () => {
  it("renders the 9 stacked sitelinks with correct internal hrefs", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", {
      name: /Lovanet — Plateforme officielle/i,
    });
    const expected: Array<[RegExp, string]> = [
      [/Lovanet Plateforme officiel →/i, "/"],
      [/Catalogue →/i, "/anime-catalog"],
      [/Univers Lovanet/i, "/decouvrir"],
      [/Boutique →/i, "/shop"],
      [/AnimemomentsAnimeofficiel → YouTube/i, "/chaine-youtube"],
      [/AnimemomentsAnimeofficiel →$/i, "/chaine-youtube"],
      [/Anime\.Moments\.officiel → Prime Video/i, "/prime-video"],
      [/Anime\.Moments\.officiel → TikTok/i, "/tiktok"],
      [/À venir →/i, "/anime-countdown"],
    ];
    for (const [label, href] of expected) {
      const link = within(nav).getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      // Internal links must stay same-tab
      expect(link).not.toHaveAttribute("target", "_blank");
    }
  });

  it("opens each partner link in a new tab with rel noopener noreferrer", () => {
    renderFooter();
    const partners = [
      "https://www.youtube.com/@animemomentsanimeofficiel",
      "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime",
      "https://www.tiktok.com/@anime.moments.officiel",
    ];
    for (const href of partners) {
      const links = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === href);
      expect(links.length).toBeGreaterThan(0);
      for (const a of links) {
        expect(a).toHaveAttribute("target", "_blank");
        expect(a.getAttribute("rel") ?? "").toMatch(/noopener/);
        expect(a.getAttribute("rel") ?? "").toMatch(/noreferrer/);
      }
    }
  });
});