export type NavStyle = {
  id: string;
  name: string;
  cardOverlay: string;
  textColor: string;
  accent: string;
  fontFamily?: string;
};

const navStyles: NavStyle[] = [
  {
    id: "default",
    name: "Classique",
    cardOverlay: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
    textColor: "#FFFFFF",
    accent: "#06b6d4",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  {
    id: "warm",
    name: "Chaud",
    cardOverlay: "linear-gradient(180deg, rgba(255,240,230,0.03), rgba(20,8,6,0.12))",
    textColor: "#FFEBD6",
    accent: "#fb923c",
    fontFamily: "Inter, system-ui, sans-serif",
  },
];

export default navStyles;
