import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, X, GripVertical, Heart, CloudSun, Calculator as CalcIcon, Globe2,
  Gamepad2, Brain, Sparkles, Timer, Coins, StickyNote, TrendingUp, Dice5,
  Trash2, RefreshCw,
} from "lucide-react";
import { ALL_PRODUCTS } from "@/data/generatedProducts";
import type { ShopProduct } from "@/data/shopProducts";

/* ============================================================
   WIDGET DOCK — Boutique "site dans le site"
   Widgets ajoutables, réagençables, persistés (localStorage).
   ============================================================ */

type WidgetId =
  | "wishlist" | "weather" | "calculator" | "worldclock" | "currency"
  | "snake" | "memory" | "quiz" | "notes" | "drops" | "countdown"
  | "trending" | "roulette" | "recent";

type WidgetDef = {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  hint: string;
  size?: "sm" | "md" | "lg";
};

const WIDGETS: WidgetDef[] = [
  { id: "wishlist",  title: "Wishlist",           icon: <Heart className="w-4 h-4" />,     hint: "Vos favoris",           size: "md" },
  { id: "drops",     title: "Live Drops",         icon: <Sparkles className="w-4 h-4" />,  hint: "Offres flash",          size: "lg" },
  { id: "roulette",  title: "Roulette produit",   icon: <Dice5 className="w-4 h-4" />,     hint: "Découverte aléatoire",  size: "md" },
  { id: "countdown", title: "Prochain drop",      icon: <Timer className="w-4 h-4" />,     hint: "Compte à rebours",      size: "sm" },
  { id: "weather",   title: "Météo",              icon: <CloudSun className="w-4 h-4" />,  hint: "Temps réel",            size: "sm" },
  { id: "worldclock",title: "Horloges monde",     icon: <Globe2 className="w-4 h-4" />,    hint: "Tokyo · NY · Paris",    size: "md" },
  { id: "currency",  title: "Convertisseur",      icon: <Coins className="w-4 h-4" />,     hint: "EUR ⇄ USD ⇄ JPY",       size: "sm" },
  { id: "calculator",title: "Calculatrice",       icon: <CalcIcon className="w-4 h-4" />,  hint: "Rapide",                size: "sm" },
  { id: "snake",     title: "Snake",              icon: <Gamepad2 className="w-4 h-4" />,  hint: "Mini-jeu",              size: "md" },
  { id: "memory",    title: "Memory",             icon: <Brain className="w-4 h-4" />,     hint: "Mémorisation",          size: "md" },
  { id: "quiz",      title: "Quiz Manga",         icon: <Sparkles className="w-4 h-4" />,  hint: "Culture otaku",         size: "md" },
  { id: "trending",  title: "Tendances",          icon: <TrendingUp className="w-4 h-4" />,hint: "Tags populaires",       size: "sm" },
  { id: "recent",    title: "Vus récemment",      icon: <RefreshCw className="w-4 h-4" />, hint: "Historique",            size: "md" },
  { id: "notes",     title: "Notes rapides",      icon: <StickyNote className="w-4 h-4" />,hint: "Bloc-notes local",      size: "sm" },
];

const LS_ACTIVE = "shop.widgets.active.v1";
const LS_WISHLIST = "shop.wishlist.v1";
const LS_RECENT = "shop.recent.v1";
const LS_NOTES = "shop.notes.v1";

const readLS = <T,>(k: string, f: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; }
};
const writeLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------- API publique pour brancher wishlist/recent depuis la page ---------- */
export const wishlistApi = {
  get: (): string[] => readLS<string[]>(LS_WISHLIST, []),
  toggle: (id: string) => {
    const cur = wishlistApi.get();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    writeLS(LS_WISHLIST, next);
    window.dispatchEvent(new CustomEvent("shop:wishlist-changed"));
    return next;
  },
  has: (id: string) => wishlistApi.get().includes(id),
};
export const recentApi = {
  get: (): string[] => readLS<string[]>(LS_RECENT, []),
  push: (id: string) => {
    const cur = recentApi.get().filter((x) => x !== id);
    const next = [id, ...cur].slice(0, 20);
    writeLS(LS_RECENT, next);
    window.dispatchEvent(new CustomEvent("shop:recent-changed"));
  },
};

/* ================= WIDGETS ================= */

const Card = ({ title, icon, onRemove, children, className = "" }: {
  title: string; icon: React.ReactNode; onRemove: () => void; children: React.ReactNode; className?: string;
}) => (
  <section className={`rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm shadow-[0_10px_30px_-18px_hsl(var(--neon-magenta)/0.55)] overflow-hidden flex flex-col ${className}`}>
    <header className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
      <span className="text-primary">{icon}</span>
      <h3 className="text-xs font-display font-bold uppercase tracking-wider flex-1">{title}</h3>
      <button onClick={onRemove} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Retirer">
        <X className="w-3.5 h-3.5" />
      </button>
    </header>
    <div className="p-3 flex-1 min-h-0">{children}</div>
  </section>
);

/* -- Wishlist -- */
const WishlistWidget = ({ onOpen }: { onOpen?: (p: ShopProduct) => void }) => {
  const [ids, setIds] = useState<string[]>(() => wishlistApi.get());
  useEffect(() => {
    const h = () => setIds(wishlistApi.get());
    window.addEventListener("shop:wishlist-changed", h);
    return () => window.removeEventListener("shop:wishlist-changed", h);
  }, []);
  const items = useMemo(
    () => ids.map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as ShopProduct[],
    [ids]
  );
  if (items.length === 0)
    return <p className="text-xs text-muted-foreground">Aucun favori. Cliquez sur ❤ sur un produit.</p>;
  return (
    <ul className="space-y-1.5 max-h-56 overflow-auto pr-1">
      {items.map((p) => (
        <li key={p.id} className="flex items-center gap-2 text-xs">
          <button onClick={() => onOpen?.(p)} className="flex-1 text-left truncate hover:text-primary">
            {p.name}
          </button>
          <span className="text-primary font-bold">{p.price} €</span>
          <button onClick={() => wishlistApi.toggle(p.id)} className="text-muted-foreground hover:text-primary" aria-label="Retirer">
            <Trash2 className="w-3 h-3" />
          </button>
        </li>
      ))}
    </ul>
  );
};

/* -- Weather (Open-Meteo, no key) -- */
const WeatherWidget = () => {
  const [city, setCity] = useState("Paris");
  const [q, setQ] = useState("Paris");
  const [data, setData] = useState<{ t: number; code: number; wind: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let cancel = false;
    (async () => {
      setErr(null);
      try {
        const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`).then((r) => r.json());
        const loc = g?.results?.[0];
        if (!loc) throw new Error("Ville introuvable");
        const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,wind_speed_10m`).then((r) => r.json());
        if (cancel) return;
        setData({ t: w.current.temperature_2m, code: w.current.weather_code, wind: w.current.wind_speed_10m });
      } catch (e) {
        if (!cancel) setErr((e as Error).message);
      }
    })();
    return () => { cancel = true; };
  }, [city]);
  const emoji = (c: number) => c === 0 ? "☀️" : c < 3 ? "🌤️" : c < 50 ? "☁️" : c < 70 ? "🌧️" : c < 80 ? "❄️" : "⛈️";
  return (
    <div className="space-y-2">
      <form onSubmit={(e) => { e.preventDefault(); setCity(q); }} className="flex gap-1">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-8 text-xs" placeholder="Ville…" />
        <Button type="submit" size="sm" className="h-8">OK</Button>
      </form>
      {err && <p className="text-[10px] text-destructive">{err}</p>}
      {data && (
        <div className="flex items-center gap-3">
          <div className="text-3xl">{emoji(data.code)}</div>
          <div>
            <div className="font-display text-2xl font-bold">{Math.round(data.t)}°C</div>
            <div className="text-[10px] text-muted-foreground">{city} · vent {Math.round(data.wind)} km/h</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -- Calculator -- */
const CalculatorWidget = () => {
  const [expr, setExpr] = useState("");
  const [res, setRes] = useState("");
  const press = (k: string) => {
    if (k === "=") {
      try {
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict";return (${expr.replace(/[^0-9+\-*/.() ]/g, "")})`)();
        setRes(String(v));
      } catch { setRes("Erreur"); }
    } else if (k === "C") { setExpr(""); setRes(""); }
    else setExpr((e) => e + k);
  };
  const KEYS = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"];
  return (
    <div className="space-y-1.5">
      <div className="rounded-md bg-background/60 border border-border/60 px-2 py-1.5 text-right font-mono text-sm min-h-[2.5rem]">
        <div className="text-muted-foreground text-[10px] truncate">{expr || "0"}</div>
        <div className="text-primary font-bold">{res || "—"}</div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {KEYS.map((k) => (
          <button key={k} onClick={() => press(k)} className="h-7 rounded-md border border-border/60 bg-secondary/40 hover:bg-primary/20 hover:border-primary/60 text-xs font-semibold transition">{k}</button>
        ))}
        <button onClick={() => press("C")} className="col-span-4 h-7 rounded-md border border-primary/50 bg-primary/10 text-primary text-xs font-bold">Effacer</button>
      </div>
    </div>
  );
};

/* -- World Clock -- */
const WorldClockWidget = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const zones = [
    { city: "Tokyo",   tz: "Asia/Tokyo",     flag: "🇯🇵" },
    { city: "Paris",   tz: "Europe/Paris",   flag: "🇫🇷" },
    { city: "N-York",  tz: "America/New_York", flag: "🇺🇸" },
    { city: "Séoul",   tz: "Asia/Seoul",     flag: "🇰🇷" },
    { city: "Londres", tz: "Europe/London",  flag: "🇬🇧" },
    { city: "Sydney",  tz: "Australia/Sydney", flag: "🇦🇺" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-1.5 text-xs">
      {zones.map((z) => (
        <li key={z.tz} className="flex items-center gap-1.5 rounded-md bg-secondary/40 border border-border/60 px-2 py-1">
          <span>{z.flag}</span>
          <span className="flex-1 truncate">{z.city}</span>
          <span className="font-mono font-bold text-primary">
            {now.toLocaleTimeString("fr-FR", { timeZone: z.tz, hour: "2-digit", minute: "2-digit" })}
          </span>
        </li>
      ))}
    </ul>
  );
};

/* -- Currency Converter -- */
const CurrencyWidget = () => {
  const [amt, setAmt] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [rate, setRate] = useState<number | null>(null);
  useEffect(() => {
    let cancel = false;
    fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`).then((r) => r.json())
      .then((d) => { if (!cancel) setRate(d?.rates?.[to] ?? null); })
      .catch(() => !cancel && setRate(null));
    return () => { cancel = true; };
  }, [from, to]);
  const val = rate ? (parseFloat(amt || "0") * rate).toFixed(2) : "—";
  const CURR = ["EUR","USD","JPY","GBP","KRW","CHF","CAD","AUD","CNY"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        <Input value={amt} onChange={(e) => setAmt(e.target.value)} className="h-8 text-xs" />
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 rounded-md bg-background border border-border text-xs px-1">
          {CURR.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex gap-1 items-center">
        <span className="text-xs text-muted-foreground">= </span>
        <div className="flex-1 rounded-md bg-secondary/40 border border-border/60 px-2 py-1 text-primary font-bold text-sm">{val}</div>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="h-8 rounded-md bg-background border border-border text-xs px-1">
          {CURR.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-[10px] text-muted-foreground">Taux BCE · frankfurter.app</p>
    </div>
  );
};

/* -- Snake game -- */
const SnakeWidget = () => {
  const N = 12;
  const [snake, setSnake] = useState<number[][]>([[6,6],[6,5]]);
  const [dir, setDir] = useState<[number,number]>([0,1]);
  const [food, setFood] = useState<[number,number]>([3,3]);
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);
  const dirRef = useRef(dir);
  dirRef.current = dir;
  useEffect(() => {
    if (dead) return;
    const t = setInterval(() => {
      setSnake((s) => {
        const [dr,dc] = dirRef.current;
        const nh: [number,number] = [(s[0][0]+dr+N)%N, (s[0][1]+dc+N)%N];
        if (s.some(([r,c]) => r===nh[0] && c===nh[1])) { setDead(true); return s; }
        const ate = nh[0]===food[0] && nh[1]===food[1];
        const ns = [nh, ...s];
        if (!ate) ns.pop();
        else {
          setScore((x) => x+1);
          setFood([Math.floor(Math.random()*N), Math.floor(Math.random()*N)]);
        }
        return ns;
      });
    }, 160);
    return () => clearInterval(t);
  }, [dead, food]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp"   && dirRef.current[0]!==1)  setDir([-1,0]);
      if (e.key === "ArrowDown" && dirRef.current[0]!==-1) setDir([1,0]);
      if (e.key === "ArrowLeft" && dirRef.current[1]!==1)  setDir([0,-1]);
      if (e.key === "ArrowRight"&& dirRef.current[1]!==-1) setDir([0,1]);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const reset = () => { setSnake([[6,6],[6,5]]); setDir([0,1]); setDead(false); setScore(0); };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span>Score : <b className="text-primary">{score}</b></span>
        {dead && <button onClick={reset} className="text-primary underline">Rejouer</button>}
      </div>
      <div className="grid gap-0.5 aspect-square bg-background/60 rounded-md p-1" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {Array.from({ length: N*N }).map((_, i) => {
          const r = Math.floor(i/N), c = i%N;
          const isHead = snake[0][0]===r && snake[0][1]===c;
          const isBody = snake.some(([sr,sc]) => sr===r && sc===c);
          const isFood = food[0]===r && food[1]===c;
          return (
            <div key={i} className={`aspect-square rounded-[2px] ${
              isHead ? "bg-primary" : isBody ? "bg-primary/60" : isFood ? "bg-[hsl(var(--neon-magenta))]" : "bg-secondary/40"
            }`} />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div />
        <button onClick={() => setDir([-1,0])} className="h-6 rounded bg-secondary/40 border border-border/60">↑</button>
        <div />
        <button onClick={() => setDir([0,-1])} className="h-6 rounded bg-secondary/40 border border-border/60">←</button>
        <button onClick={() => setDir([1,0])}  className="h-6 rounded bg-secondary/40 border border-border/60">↓</button>
        <button onClick={() => setDir([0,1])}  className="h-6 rounded bg-secondary/40 border border-border/60">→</button>
      </div>
    </div>
  );
};

/* -- Memory game -- */
const MemoryWidget = () => {
  const EMOJIS = ["🌸","⚡","🔥","🗡️","🐉","🌊","🌙","⭐"];
  const build = () => [...EMOJIS, ...EMOJIS].map((e,i) => ({ i, e, flipped: false, matched: false }))
    .sort(() => Math.random()-0.5);
  const [cards, setCards] = useState(build);
  const [sel, setSel] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    if (sel.length === 2) {
      setMoves((m) => m+1);
      const [a,b] = sel;
      const match = cards[a].e === cards[b].e;
      const t = setTimeout(() => {
        setCards((c) => c.map((x,i) => i===a||i===b ? { ...x, flipped: match, matched: match } : x));
        setSel([]);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [sel, cards]);
  const flip = (i: number) => {
    if (sel.length >= 2 || cards[i].flipped) return;
    setCards((c) => c.map((x,idx) => idx===i ? { ...x, flipped: true } : x));
    setSel((s) => [...s, i]);
  };
  const won = cards.every((c) => c.matched);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span>Coups : <b className="text-primary">{moves}</b></span>
        <button onClick={() => { setCards(build()); setMoves(0); setSel([]); }} className="text-primary underline">Reset</button>
      </div>
      {won && <p className="text-xs text-primary font-bold">🎉 Bravo !</p>}
      <div className="grid grid-cols-4 gap-1">
        {cards.map((c, i) => (
          <button key={i} onClick={() => flip(i)} className={`aspect-square rounded-md border text-lg transition ${c.flipped ? "bg-primary/20 border-primary/60" : "bg-secondary/40 border-border/60"}`}>
            {c.flipped ? c.e : ""}
          </button>
        ))}
      </div>
    </div>
  );
};

/* -- Quiz Manga -- */
const QuizWidget = () => {
  const QS = [
    { q: "Créateur de One Piece ?", opts: ["Kishimoto","Oda","Toriyama","Kubo"], a: 1 },
    { q: "Nom du dojo de Rock Lee ?", opts: ["Konoha","Chidori","Rasengan","Sharingan"], a: 0 },
    { q: "Quel héros porte un cahier ?", opts: ["L","Kira","Light","Ryuk"], a: 2 },
    { q: "Attaque signature de Goku ?", opts: ["Rasengan","Bankai","Kamehameha","Getsuga"], a: 2 },
    { q: "Studio de Ghibli fondé par ?", opts: ["Miyazaki","Anno","Shinkai","Yuasa"], a: 0 },
    { q: "Personnage principal de JJK ?", opts: ["Yuji","Gojo","Megumi","Nobara"], a: 0 },
  ];
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = QS[i];
  const answer = (k: number) => {
    if (pick !== null) return;
    setPick(k);
    if (k === q.a) setScore((s) => s+1);
    setTimeout(() => { setPick(null); setI((n) => (n+1) % QS.length); }, 900);
  };
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold min-h-[2rem]">{q.q}</p>
      <div className="grid grid-cols-2 gap-1">
        {q.opts.map((o, k) => (
          <button key={k} onClick={() => answer(k)}
            className={`text-[11px] px-2 py-1.5 rounded-md border transition ${
              pick === null ? "bg-secondary/40 border-border/60 hover:border-primary/60"
              : k === q.a ? "bg-primary/30 border-primary text-primary"
              : k === pick ? "bg-destructive/20 border-destructive"
              : "bg-secondary/20 border-border/40 opacity-60"
            }`}>
            {o}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">Score : <b className="text-primary">{score}</b> / {i+1}</p>
    </div>
  );
};

/* -- Notes -- */
const NotesWidget = () => {
  const [txt, setTxt] = useState<string>(() => readLS<string>(LS_NOTES, ""));
  useEffect(() => { writeLS(LS_NOTES, txt); }, [txt]);
  return (
    <textarea value={txt} onChange={(e) => setTxt(e.target.value)}
      placeholder="Bloc-notes… (sauvegarde locale)"
      className="w-full h-32 rounded-md bg-background/60 border border-border/60 p-2 text-xs resize-none focus:outline-none focus:border-primary/60" />
  );
};

/* -- Live Drops -- */
const DropsWidget = ({ onOpen }: { onOpen?: (p: ShopProduct) => void }) => {
  const deals = useMemo(
    () => ALL_PRODUCTS.filter((p) => p.compareAt && p.compareAt > p.price)
      .sort((a,b) => (b.compareAt!-b.price)/b.compareAt! - (a.compareAt!-a.price)/a.compareAt!)
      .slice(0, 8),
    []
  );
  return (
    <ul className="space-y-1 max-h-56 overflow-auto pr-1">
      {deals.map((p) => {
        const off = Math.round((1 - p.price / p.compareAt!) * 100);
        return (
          <li key={p.id}>
            <button onClick={() => onOpen?.(p)} className="w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded-md hover:bg-primary/10">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">-{off}%</span>
              <span className="flex-1 truncate text-left">{p.name}</span>
              <span className="text-primary font-bold">{p.price} €</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/* -- Countdown -- */
const CountdownWidget = () => {
  const target = useMemo(() => {
    const d = new Date(); d.setHours(24,0,0,0); return d;
  }, []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target.getTime() - now);
  const h = Math.floor(diff/3600000), m = Math.floor(diff/60000)%60, s = Math.floor(diff/1000)%60;
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Prochain drop dans</p>
      <div className="font-display font-black text-3xl gradient-text mt-1">
        {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Nouveaux produits chaque nuit à minuit</p>
    </div>
  );
};

/* -- Trending tags -- */
const TrendingWidget = () => {
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    ALL_PRODUCTS.forEach((p) => m.set(p.tag, (m.get(p.tag) ?? 0) + (p.sold ?? 1)));
    return [...m.entries()].sort((a,b) => b[1]-a[1]).slice(0, 12);
  }, []);
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(([t,n], i) => (
        <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full border ${
          i < 3 ? "bg-primary/20 border-primary/60 text-primary" : "bg-secondary/40 border-border/60"
        }`}>
          #{t} <span className="opacity-60">{n}</span>
        </span>
      ))}
    </div>
  );
};

/* -- Roulette -- */
const RouletteWidget = ({ onOpen }: { onOpen?: (p: ShopProduct) => void }) => {
  const [p, setP] = useState<ShopProduct>(() => ALL_PRODUCTS[Math.floor(Math.random()*ALL_PRODUCTS.length)]);
  const spin = () => setP(ALL_PRODUCTS[Math.floor(Math.random()*ALL_PRODUCTS.length)]);
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border/60 bg-background/50 p-2">
        <p className="text-[10px] uppercase text-primary tracking-widest">{p.tag}</p>
        <p className="text-xs font-semibold line-clamp-2 min-h-[2rem]">{p.name}</p>
        <p className="font-display font-extrabold gradient-text text-lg">{p.price} €</p>
      </div>
      <div className="flex gap-1">
        <Button size="sm" className="flex-1 h-8" onClick={spin}><Dice5 className="w-3.5 h-3.5 mr-1" />Tirer</Button>
        <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => onOpen?.(p)}>Voir</Button>
      </div>
    </div>
  );
};

/* -- Recent -- */
const RecentWidget = ({ onOpen }: { onOpen?: (p: ShopProduct) => void }) => {
  const [ids, setIds] = useState<string[]>(() => recentApi.get());
  useEffect(() => {
    const h = () => setIds(recentApi.get());
    window.addEventListener("shop:recent-changed", h);
    return () => window.removeEventListener("shop:recent-changed", h);
  }, []);
  const items = ids.map((id) => ALL_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as ShopProduct[];
  if (items.length === 0) return <p className="text-xs text-muted-foreground">Aucun produit consulté.</p>;
  return (
    <ul className="space-y-1 max-h-56 overflow-auto pr-1">
      {items.slice(0,8).map((p) => (
        <li key={p.id}>
          <button onClick={() => onOpen?.(p)} className="w-full flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-primary/10">
            <span className="flex-1 truncate text-left">{p.name}</span>
            <span className="text-primary font-bold">{p.price} €</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

/* ============================================================
   DOCK
   ============================================================ */

const RENDER: Record<WidgetId, (p: { onOpen?: (p: ShopProduct) => void }) => React.ReactNode> = {
  wishlist:   ({ onOpen }) => <WishlistWidget onOpen={onOpen} />,
  weather:    () => <WeatherWidget />,
  calculator: () => <CalculatorWidget />,
  worldclock: () => <WorldClockWidget />,
  currency:   () => <CurrencyWidget />,
  snake:      () => <SnakeWidget />,
  memory:     () => <MemoryWidget />,
  quiz:       () => <QuizWidget />,
  notes:      () => <NotesWidget />,
  drops:      ({ onOpen }) => <DropsWidget onOpen={onOpen} />,
  countdown:  () => <CountdownWidget />,
  trending:   () => <TrendingWidget />,
  roulette:   ({ onOpen }) => <RouletteWidget onOpen={onOpen} />,
  recent:     ({ onOpen }) => <RecentWidget onOpen={onOpen} />,
};

const DEFAULT_ACTIVE: WidgetId[] = ["wishlist","drops","countdown","weather","worldclock","roulette"];

export const WidgetDock = ({ onOpen }: { onOpen?: (p: ShopProduct) => void }) => {
  const [active, setActive] = useState<WidgetId[]>(() => readLS<WidgetId[]>(LS_ACTIVE, DEFAULT_ACTIVE));
  const [picker, setPicker] = useState(false);
  useEffect(() => { writeLS(LS_ACTIVE, active); }, [active]);

  const add = (id: WidgetId) => { if (!active.includes(id)) setActive([...active, id]); setPicker(false); };
  const remove = (id: WidgetId) => setActive(active.filter((x) => x !== id));
  const move = (id: WidgetId, dir: -1 | 1) => {
    const i = active.indexOf(id); const j = i + dir;
    if (i < 0 || j < 0 || j >= active.length) return;
    const next = [...active]; [next[i], next[j]] = [next[j], next[i]]; setActive(next);
  };

  const available = WIDGETS.filter((w) => !active.includes(w.id));

  return (
    <section className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-10">
      <header className="flex items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">Boutique · Tableau de bord</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl gradient-text">Mes widgets</h2>
          <p className="text-xs text-muted-foreground mt-1">Personnalisez la boutique · vos réglages sont sauvegardés.</p>
        </div>
        <div className="relative">
          <Button onClick={() => setPicker((v) => !v)} className="rounded-full h-9">
            <Plus className="w-4 h-4 mr-1" /> Ajouter un widget
          </Button>
          {picker && (
            <div className="absolute right-0 mt-2 z-20 w-72 rounded-xl border border-border/70 bg-card/95 backdrop-blur shadow-2xl p-2 max-h-80 overflow-auto">
              {available.length === 0 && <p className="text-xs text-muted-foreground p-2">Tous les widgets sont déjà actifs.</p>}
              {available.map((w) => (
                <button key={w.id} onClick={() => add(w.id)} className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md hover:bg-primary/10">
                  <span className="text-primary">{w.icon}</span>
                  <span className="flex-1">
                    <span className="block text-xs font-semibold">{w.title}</span>
                    <span className="block text-[10px] text-muted-foreground">{w.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {active.map((id) => {
          const def = WIDGETS.find((w) => w.id === id)!;
          const span = def.size === "lg" ? "sm:col-span-2" : "";
          return (
            <div key={id} className={span}>
              <Card title={def.title} icon={def.icon} onRemove={() => remove(id)}>
                {RENDER[id]({ onOpen })}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => move(id, -1)} className="text-[10px] text-muted-foreground hover:text-primary">← Déplacer</button>
                  <button onClick={() => move(id, 1)}  className="text-[10px] text-muted-foreground hover:text-primary ml-auto">Déplacer →</button>
                </div>
              </Card>
            </div>
          );
        })}
        {active.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-8 text-center text-xs text-muted-foreground">
            Aucun widget actif — cliquez sur <b>Ajouter un widget</b>.
          </div>
        )}
      </div>
    </section>
  );
};

export default WidgetDock;