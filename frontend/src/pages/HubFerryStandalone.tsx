// eslint-disable-next-line @typescript-eslint/no-var-requires
const FerryBackground = require("@/components/FerryBackground").default;

export default function HubFerryStandalone() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #87CEEB 0%, #4a7aae 100%)" }}
      data-testid="hub-ferry-standalone-page"
    >
      <FerryBackground />
    </main>
  );
}
