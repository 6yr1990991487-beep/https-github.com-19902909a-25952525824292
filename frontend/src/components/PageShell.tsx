import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="theme-shell min-h-screen flex flex-col" style={{ background: "transparent" }} data-testid="page-shell">
    <Navbar />
    <main className="theme-main-content flex-1 pt-[5rem] sm:pt-[5.5rem]">{children}</main>
    <Footer />
  </div>
);
