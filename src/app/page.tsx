"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronDown, Dumbbell, Pencil, Plus, Search, Sparkles, Trash2, Trophy, X } from "lucide-react";

type Family = "Press" | "Lower" | "Pull";
type RecordEntry = { id: string; name: string; weight: number; date: string; achievedAt: string; previous: number; hue: string; family: Family };
const starterRecords = [
  { id: "demo-deadlift", name: "Deadlift", weight: 190, achievedAt: "2026-10-28", previous: 185, family: "Lower" as Family },
  { id: "demo-bench", name: "Bench Press", weight: 105, achievedAt: "2026-10-21", previous: 102.5, family: "Press" as Family },
  { id: "demo-pullup", name: "Weighted Pull Up", weight: 35, achievedAt: "2026-10-14", previous: 32.5, family: "Pull" as Family },
  { id: "demo-squat", name: "Squat", weight: 150, achievedAt: "2026-10-08", previous: 145, family: "Lower" as Family },
  { id: "demo-overhead", name: "Overhead Press", weight: 67.5, achievedAt: "2026-09-30", previous: 65, family: "Press" as Family },
  { id: "demo-incline", name: "Incline Bench Press", weight: 85, achievedAt: "2026-09-18", previous: 82.5, family: "Press" as Family },
  { id: "demo-dips", name: "Weighted Dips", weight: 45, achievedAt: "2026-09-06", previous: 42.5, family: "Pull" as Family },
  { id: "demo-close-grip", name: "Close Grip Bench Press", weight: 90, achievedAt: "2026-08-22", previous: 87.5, family: "Press" as Family },
];
const hueFor = (family: Family) => family === "Press" ? "#92a8f6" : family === "Lower" ? "#f18a69" : "#d9a876";
const displayDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
function exerciseIcon(name: string, family: Family) {
  const value = name.toLowerCase();
  if (value.includes("pull up") || value.includes("pull-up")) return "pullup";
  if (value.includes("bench")) return "bench";
  if (value.includes("squat")) return "squat";
  if (value.includes("deadlift")) return "deadlift";
  if (value.includes("overhead press")) return "overhead";
  if (value.includes("dip")) return "dip";
  return family === "Lower" ? "squat" : family === "Pull" ? "pullup" : "overhead";
}
function LiftAvatar({ item, large = false }: { item: Pick<RecordEntry, "name" | "family" | "hue">; large?: boolean }) {
  return <div className={`avatar ${large ? "avatar-large" : ""}`} style={{ "--accent": item.hue } as React.CSSProperties}>
    <img src={`/exercise-icons/${exerciseIcon(item.name, item.family)}.svg`} alt={`${item.name} illustration`} />
  </div>;
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [lifts, setLifts] = useState<RecordEntry[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All lifts");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RecordEntry | null>(null);
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [name, setName] = useState("");
  const [family, setFamily] = useState<Family>("Press");
  const [weight, setWeight] = useState("");
  const [previous, setPrevious] = useState("0");
  const [achievedAt, setAchievedAt] = useState(localToday);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pr-club-lifts");
      setLifts(saved ? JSON.parse(saved) as RecordEntry[] : starterRecords.map(item => ({ ...item, date: displayDate(item.achievedAt), hue: hueFor(item.family) })));
    } catch {
      setLifts(starterRecords.map(item => ({ ...item, date: displayDate(item.achievedAt), hue: hueFor(item.family) })));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("pr-club-lifts", JSON.stringify(lifts));
  }, [lifts, ready]);

  const shown = useMemo(() => lifts.filter(item => (filter === "All lifts" || item.family === filter) && item.name.toLowerCase().includes(query.toLowerCase())), [filter, lifts, query]);
  const latest = lifts[0] ?? null;
  const best = lifts.length ? lifts.reduce((a, b) => a.weight > b.weight ? a : b) : null;
  const amount = (value: number) => unit === "kg" ? value.toLocaleString("en-GB", { maximumFractionDigits: 1 }) : Math.round(value * 2.20462).toLocaleString("en-GB");

  function startAdd() {
    setEditTarget(null); setName(""); setFamily("Press"); setWeight(""); setPrevious("0"); setAchievedAt(localToday); setError(""); setModalOpen(true);
  }
  function startEdit(item: RecordEntry) {
    setEditTarget(item); setName(item.name); setFamily(item.family); setWeight(String(item.weight)); setPrevious(String(item.previous)); setAchievedAt(item.achievedAt); setError(""); setModalOpen(true);
  }
  async function saveLift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim(); const nextWeight = Number(weight); const oldWeight = Number(previous);
    if (!cleanName || !Number.isFinite(nextWeight) || nextWeight < 0 || !Number.isFinite(oldWeight) || oldWeight < 0) return;
    if (lifts.some(item => item.name.toLowerCase() === cleanName.toLowerCase() && item.id !== editTarget?.id)) { setError("That exercise is already in your log."); return; }
    setError("");
    if (editTarget) {
      setLifts(current => current.map(item => item.id === editTarget.id ? { ...item, name: cleanName, family, weight: nextWeight, previous: oldWeight, achievedAt, date: displayDate(achievedAt), hue: hueFor(family) } : item).sort((a, b) => b.achievedAt.localeCompare(a.achievedAt)));
    } else {
      setLifts(current => [{ id: crypto.randomUUID(), name: cleanName, family, weight: nextWeight, previous: oldWeight, achievedAt, date: displayDate(achievedAt), hue: hueFor(family) }, ...current].sort((a, b) => b.achievedAt.localeCompare(a.achievedAt)));
    }
    setFilter("All lifts"); setQuery(""); setModalOpen(false); setEditTarget(null);
  }
  async function removeLift(item: RecordEntry) {
    if (!window.confirm(`Delete ${item.name} from your training log?`)) return;
    setLifts(current => current.filter(lift => lift.id !== item.id));
  }

  if (!ready) return <main className="center-screen">Loading the demo…</main>;

  return <main className="min-h-screen"><div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
    <header className="flex h-[76px] items-center justify-between border-b border-[#30352d]"><a href="#top" className="flex items-center gap-2.5"><span className="brand-mark"><Dumbbell size={17}/></span><span className="text-[15px] font-bold tracking-[.08em]">PR CLUB<span className="ml-2 text-[10px] font-medium tracking-[.14em] text-[#858b7e]">TRAINING LOG</span></span></a><div className="flex items-center gap-3 text-xs text-[#a2a899]"><span className="hidden sm:block">DEMO MODE · SAVED IN THIS BROWSER</span></div></header>
    <section id="top" className="pt-11 sm:pt-14"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow"><span className="live-dot"/>YOUR STRENGTH, AT A GLANCE</div><h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-.045em] sm:text-5xl">Personal records<span className="text-[#c7f36b]">.</span></h1><p className="mt-3 text-sm text-[#999f91]">Every milestone, all in one place.</p></div><button onClick={() => setUnit(unit === "kg" ? "lb" : "kg")} className="unit-toggle"><span className={unit === "kg" ? "unit-active" : ""}>KG</span><span className={unit === "lb" ? "unit-active" : ""}>LB</span><ChevronDown size={13}/></button></div>
      <div className="mt-9 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]"><div className="featured-card"><div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.16em] text-[#1b2411]"><Sparkles size={14}/> MOST RECENT PR</div>{latest ? <div className="mt-6 flex items-center justify-between gap-2"><div><div className="text-3xl font-semibold text-[#171a14]">{amount(latest.weight)} <span className="text-base font-medium">{unit}</span></div><div className="mt-1 text-sm font-semibold text-[#29311e]">{latest.name}</div><div className="mt-3 flex items-center gap-1.5 text-xs text-[#586247]"><CalendarDays size={13}/>{latest.date}</div></div><LiftAvatar item={latest} large/></div> : <div className="mt-6 text-lg font-semibold text-[#29311e]">Add your first exercise.</div>}</div>
        <div className="stat-card"><div className="stat-label"><Trophy size={14}/> TOP LIFT</div>{best ? <><div className="mt-8 text-2xl font-semibold">{best.name}</div><div className="mt-2 text-sm text-[#9ea494]">{amount(best.weight)} {unit} · {best.date}</div><div className="mt-6 flex items-center gap-1 text-xs text-[#c7f36b]"><ArrowUpRight size={14}/> +{amount(best.weight-best.previous)} kg on your best</div></> : <div className="mt-8 text-sm text-[#9ea494]">No lifts yet</div>}</div>
        <div className="stat-card"><div className="stat-label"><Dumbbell size={14}/> LIFTS TRACKED</div><div className="mt-8 text-4xl font-semibold">{String(lifts.length).padStart(2, "0")}</div><div className="mt-2 text-sm text-[#9ea494]">Exercises with a best lift</div><div className="mt-6 text-xs text-[#6f766a]">{latest ? <>Last updated <span className="text-[#bec4b6]">{latest.date}</span></> : "Your log is ready"}</div></div></div>
    </section>
    <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">THE LOG</div><h2 className="mt-2 text-2xl font-semibold">Your lifts <span className="ml-1 text-sm font-medium text-[#7d8477]">{String(lifts.length).padStart(2, "0")}</span></h2></div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><div className="search-box"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find an exercise" aria-label="Find an exercise"/></div><button onClick={startAdd} className="add-button"><Plus size={15}/> Add exercise</button></div></div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{["All lifts", "Press", "Lower", "Pull"].map(value => <button key={value} onClick={() => setFilter(value)} className={`filter-chip ${filter === value ? "filter-selected" : ""}`}>{value}</button>)}</div>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#30352d] bg-[#191c18]"><div className="table-head hidden grid-cols-[minmax(210px,1.65fr)_1fr_1fr_1fr_64px] gap-3 px-5 py-3 text-[10px] font-semibold tracking-[.14em] md:grid"><span>EXERCISE</span><span>PERSONAL BEST</span><span>DATE ACHIEVED</span><span>PROGRESS</span><span/></div>
        {shown.map(item => <div key={item.id} className="record-row border-t border-[#30352d]"><div className="flex min-w-0 items-center gap-4"><LiftAvatar item={item}/><div className="min-w-0"><div className="truncate text-sm font-medium">{item.name}</div><div className="mt-1 text-xs text-[#777e71]">{item.family} day</div></div></div><div className="record-weight">{amount(item.weight)} <span>{unit}</span></div><div className="record-date"><CalendarDays size={13}/>{item.date}</div><div className="record-progress"><ArrowUpRight size={14}/> +{amount(item.weight-item.previous)} kg</div><div className="record-actions"><button onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`} title="Edit"><Pencil size={14}/></button><button onClick={() => void removeLift(item)} aria-label={`Delete ${item.name}`} title="Delete"><Trash2 size={14}/></button></div></div>)}
        {shown.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#8a9183]">{lifts.length ? "No lifts match that search." : "No exercises yet. Add your first exercise to get started."}</div>}
      </div></section>
    <footer className="mt-8 flex flex-wrap justify-between gap-2 text-[11px] text-[#666d61]"><span>YOUR TRAINING HISTORY</span><span className="flex items-center gap-1.5"><span className="live-dot"/> Saved in this browser</span></footer>
  </div>
  {error && <div role="alert" className="fixed bottom-4 left-1/2 z-30 w-[min(92%,600px)] -translate-x-1/2 rounded-lg border border-[#633e31] bg-[#2d211c] px-4 py-3 text-sm text-[#f1ad91]">{error}</div>}
  {modalOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="exercise-form-title" className="add-modal"><div className="flex items-start justify-between"><div><div className="eyebrow">THE LOG</div><h2 id="exercise-form-title" className="mt-2 text-2xl font-semibold">{editTarget ? "Edit exercise" : "Add an exercise"}</h2><p className="mt-2 text-sm text-[#999f91]">Keep the date and previous PR with your record.</p></div><button className="icon-button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={17}/></button></div><form className="mt-6 grid gap-4" onSubmit={saveLift}><label className="form-label">Exercise name<input autoFocus required maxLength={60} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Romanian Deadlift" className="form-input"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">Category<select className="form-input" value={family} onChange={event => setFamily(event.target.value as Family)}><option>Press</option><option>Lower</option><option>Pull</option></select></label><label className="form-label">Date achieved<input required type="date" value={achievedAt} onChange={event => setAchievedAt(event.target.value)} className="form-input"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">Personal best (kg)<input required type="number" min="0" step="0.5" value={weight} onChange={event => setWeight(event.target.value)} className="form-input"/></label><label className="form-label">Previous PR (kg)<input required type="number" min="0" step="0.5" value={previous} onChange={event => setPrevious(event.target.value)} className="form-input"/></label></div>{lifts.some(item => item.name.toLowerCase() === name.trim().toLowerCase() && item.id !== editTarget?.id) && <p className="text-xs text-[#f18a69]">That exercise is already in your log.</p>}<div className="mt-2 flex justify-end gap-2"><button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="add-button">{editTarget ? "Save changes" : "Add exercise"}</button></div></form></section></div>}
  <Styles/></main>;
}

function Styles() { return <style jsx global>{`
  body{margin:0;background:#10120f;color:#f4f4ed;font-family:Arial,Helvetica,sans-serif}button,input,select{font:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}
  .center-screen{display:grid;min-height:100vh;place-items:center;padding:24px;background:#10120f;color:#f4f4ed;font-size:14px}.login-card{width:min(100%,440px);padding:28px;border:1px solid #30352d;border-radius:16px;background:#191c18}
  .brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#c7f36b;color:#161a11}.avatar-user{display:grid;place-items:center;width:31px;height:31px;border:1px solid #41473b;border-radius:50%;background:#22261f;color:#dce0d5;font-size:10px;font-weight:700}.eyebrow{display:flex;align-items:center;gap:8px;color:#899080;font-size:10px;font-weight:700;letter-spacing:.16em}.live-dot{width:6px;height:6px;border-radius:50%;background:#c7f36b;box-shadow:0 0 9px #c7f36b70}
  .unit-toggle{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #34392f;border-radius:8px;background:#191c18;color:#7f8678;font-size:10px;font-weight:700}.unit-active{color:#c7f36b}.featured-card,.stat-card{min-height:192px;padding:20px;border:1px solid #30352d;border-radius:12px;background:#191c18}.featured-card{background:#c7f36b;border-color:#c7f36b}.stat-label{display:flex;align-items:center;gap:8px;color:#909789;font-size:10px;font-weight:700;letter-spacing:.14em}
  .avatar{display:grid;flex:none;place-items:center;width:62px;height:62px;border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);border-radius:15px;background:color-mix(in srgb,var(--accent) 14%,#191c18)}.avatar img{display:block;width:54px;height:54px;object-fit:contain}.avatar-large{width:86px;height:86px;border-color:#a3cb59;border-radius:19px;background:#b5df5d}.avatar-large img{width:76px;height:76px}
  .search-box{display:flex;height:38px;align-items:center;gap:9px;padding:0 11px;border:1px solid #30352d;border-radius:8px;background:#191c18;color:#818879}.search-box input{width:145px;background:transparent;color:#f4f4ed;font-size:12px;outline:none}.search-box input::placeholder{color:#747b6e}.add-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:0 14px;border:1px solid #c7f36b;border-radius:8px;background:#c7f36b;color:#171a14;font-size:12px;font-weight:700}.filter-chip{padding:7px 13px;border:1px solid #30352d;border-radius:999px;color:#8f9688;font-size:11px;white-space:nowrap}.filter-selected{border-color:#738c42;background:#262e1d;color:#d2f48f}.table-head{color:#7f8678}
  .record-row{display:grid;grid-template-columns:minmax(210px,1.65fr) .8fr 1fr .8fr 64px;align-items:center;gap:18px;padding:17px 18px;transition:background .15s}.record-row:hover{background:#1e221d}.record-weight{font-size:15px;font-weight:600}.record-weight span{font-size:10px;font-weight:500;color:#898f83}.record-date{display:flex;align-items:center;gap:7px;color:#9da394;font-size:12px}.record-date svg{color:#6e7666}.record-progress{display:flex;align-items:center;gap:4px;color:#c7f36b;font-size:11px;white-space:nowrap}.record-actions{display:flex;justify-content:flex-end;gap:5px}.record-actions button,.icon-button{display:grid;width:30px;height:30px;place-items:center;border:1px solid #34392f;border-radius:7px;color:#aab09f}.record-actions button:hover{border-color:#768a4e;color:#d2f48f}.record-actions button:last-child:hover{border-color:#794839;color:#f18a69}
  .modal-backdrop{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:#080a08c9;backdrop-filter:blur(5px)}.add-modal{width:min(100%,480px);padding:24px;border:1px solid #3b4135;border-radius:16px;background:#191c18;box-shadow:0 24px 80px #0009}.form-label{display:grid;gap:8px;color:#c2c7bb;font-size:12px;font-weight:600}.form-input{width:100%;height:42px;padding:0 12px;border:1px solid #353b31;border-radius:8px;background:#111410;color:#f4f4ed;font-size:13px;outline:none}.form-input:focus{border-color:#8eaa55}.cancel-button{padding:0 14px;border:1px solid #373d33;border-radius:8px;color:#b8beb0}
  @media(max-width:900px){.record-row{grid-template-columns:minmax(0,1fr) auto;gap:12px 10px;padding:16px}.record-row .record-weight{grid-column:2;grid-row:1}.record-row .record-date{grid-column:1;grid-row:2;padding-left:78px}.record-row .record-progress{grid-column:2;grid-row:2;justify-content:flex-end}.record-row .record-actions{grid-column:1/-1;grid-row:3;justify-content:flex-end}.avatar{width:58px;height:58px}.avatar img{width:50px;height:50px}}
`}</style>; }
