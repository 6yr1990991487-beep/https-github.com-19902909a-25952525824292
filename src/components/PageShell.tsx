import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col" style={{ background: "transparent" }}>
    <Navbar />
    <main className="flex-1 pt-12">{children}</main>
    <Footer />
  </div>
);