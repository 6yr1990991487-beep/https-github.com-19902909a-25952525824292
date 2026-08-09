import { motion } from "framer-motion";
const TrainStation = require("@/components/TrainStation").default;

const LuxuryStationColumn = ({ side, color }: { side: "left" | "right"; color: string }) => {
  return (
    <div
      className="shrink-0 flex flex-col items-center justify-between py-4"
      style={{
        width: 35,
        background: "rgba(232,196,162,0.03)",
        borderRight: side === "left" ? "1px solid rgba(232,196,162,0.1)" : "none",
        borderLeft: side === "right" ? "1px solid rgba(232,196,162,0.1)" : "none",
      }}
    >
      {['◈', '○', '◇', '○', '◈', '○', '◇'].map((symbol, i) => (
        <motion.div
          key={`${side}-${symbol}-${i}`}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          className="text-[10px] font-light"
          style={{ color: `rgba(232,196,162,${i === 2 || i === 4 ? 0.6 : 0.3})` }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default function HubTrainStationStandalone() {
  const roseGold = "#e8c4a2";

  return (
    <main className="min-h-screen overflow-hidden bg-transparent" data-testid="hub-train-station-standalone-page">
      <div className="w-full relative px-2 sm:px-4 py-8 sm:py-12">
        <div className="relative max-w-5xl mx-auto">
          <div className="relative flex flex-col items-center">
            <div className="w-full relative" style={{ marginTop: -6 }}>
              <svg viewBox="0 0 1200 70" className="w-full" style={{ height: 55 }} preserveAspectRatio="none">
                <polygon points="50,70 200,15 1000,15 1150,70" fill="rgba(12,18,28,0.35)" stroke={roseGold} strokeWidth="1.5" />
                <polygon points="250,70 350,28 450,70" fill="none" stroke="rgba(232,196,162,0.3)" strokeWidth="1" />
                <polygon points="750,70 850,28 950,70" fill="none" stroke="rgba(232,196,162,0.3)" strokeWidth="1" />
                {[380, 520, 680, 820].map((x) => (
                  <path
                    key={x}
                    d={`M${x - 25},65 Q${x},30 ${x + 25},65`}
                    fill="none"
                    stroke="rgba(232,196,162,0.25)"
                    strokeWidth="1"
                  />
                ))}
                <circle cx="600" cy="40" r="15" fill="rgba(232,196,162,0.08)" stroke={roseGold} strokeWidth="1" />
                <circle cx="600" cy="40" r="8" fill="rgba(232,196,162,0.15)" stroke="rgba(232,196,162,0.5)" strokeWidth="0.5" />
                {[300, 420, 780, 900].map((x) => (
                  <circle key={x} cx={x} cy="42" r="4" fill="rgba(232,196,162,0.15)" stroke="rgba(232,196,162,0.4)" strokeWidth="0.8" />
                ))}
              </svg>
            </div>

            <div
              className="w-full flex overflow-hidden rounded-lg"
              style={{
                background: "rgba(12,18,28,0.3)",
                border: "1px solid rgba(232,196,162,0.25)",
                borderTop: "none",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 50px rgba(0,0,0,0.2), 0 0 60px rgba(232,196,162,0.08)",
              }}
            >
              <LuxuryStationColumn side="left" color={roseGold} />
              <div className="flex-1 relative">
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(232,196,162,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(232,196,162,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="flex w-full" style={{ height: 28, borderBottom: "1px solid rgba(232,196,162,0.12)" }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex-1 flex items-end justify-center pb-0.5">
                      <div
                        style={{
                          width: "60%",
                          height: 20,
                          borderRadius: "50% 50% 0 0",
                          background: "rgba(232,196,162,0.03)",
                          border: "1px solid rgba(232,196,162,0.1)",
                          borderBottom: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="relative z-10" style={{ minHeight: 520 }}>
                  <TrainStation />
                </div>
              </div>
              <LuxuryStationColumn side="right" color={roseGold} />
            </div>

            <div
              className="w-full h-5 flex items-center justify-center"
              style={{
                background: "rgba(12,18,28,0.4)",
                border: "1px solid rgba(232,196,162,0.18)",
                borderTop: "none",
                borderBottomLeftRadius: 6,
                borderBottomRightRadius: 6,
              }}
            >
              <div className="flex gap-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: i === 3 ? roseGold : "rgba(232,196,162,0.25)",
                      boxShadow: i === 3 ? `0 0 6px ${roseGold}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
