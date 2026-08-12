"use client";

import {
  Activity, BarChart3, Bell, Bot, Box, Boxes, BrainCircuit, ChevronDown, CircleDollarSign,
  Cloud, FileSearch, FileText, Gauge, HardDrive, Home, Info, LayoutDashboard, Menu, Moon,
  MoreHorizontal, PackageCheck, Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingCart,
  Sparkles, Sun, UploadCloud, Users, Wifi, Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { NeoBadge, NeoButton, NeoCard, NeoIconButton, NeoInput, NeoMetric, NeoPanel, NeoSelect, NeoSwitch, NeoTextarea } from "./neo";
import { ThemeProvider, useTheme } from "./theme-provider";

type View = "dashboard" | "analysis" | "materials" | "projects" | "providers" | "usage" | "settings";
type Provider = {
  id: string; name: string; short: string; plan: string; model: string; priority: number;
  active: boolean; local?: boolean; capabilities: string[]; verified: string;
};

const initialProviders: Provider[] = [
  { id: "nvidia", name: "NVIDIA NIM", short: "NV", plan: "FREE_TRIAL", model: "Konfigurierbar", priority: 1, active: true, capabilities: ["TEXT", "STRUCTURED", "VISION"], verified: "12.08.2026" },
  { id: "gemini", name: "Google Gemini", short: "G", plan: "HYBRID", model: "gemini-2.5-flash", priority: 2, active: true, capabilities: ["TEXT", "PDF", "VISION"], verified: "12.08.2026" },
  { id: "groq", name: "Groq", short: "GQ", plan: "HYBRID", model: "Automatisch", priority: 3, active: true, capabilities: ["TEXT", "STRUCTURED"], verified: "12.08.2026" },
  { id: "cloudflare", name: "Cloudflare Workers AI", short: "CF", plan: "HYBRID", model: "Konfigurierbar", priority: 4, active: false, capabilities: ["TEXT", "EMBEDDINGS"], verified: "Nicht geprüft" },
  { id: "ollama", name: "Ollama", short: "OL", plan: "LOCAL", model: "llama3.2", priority: 5, active: true, local: true, capabilities: ["TEXT", "PRIVACY"], verified: "Lokal" },
  { id: "openai", name: "OpenAI", short: "AI", plan: "PAID", model: "gpt-4.1-mini", priority: 6, active: false, capabilities: ["TEXT", "STRUCTURED", "VISION"], verified: "12.08.2026" }
];

const projects = [
  { name: "Grundschule Neustadt", positions: 212, value: "31.428,00 €", status: "Sicher", tone: "success" as const },
  { name: "Logistikzentrum Süd", positions: 486, value: "87.602,40 €", status: "Prüfen", tone: "warning" as const },
  { name: "Wohnanlage Parkblick", positions: 174, value: "42.916,80 €", status: "In Analyse", tone: "info" as const },
  { name: "Verwaltung Bauhof", positions: 91, value: "18.879,20 €", status: "Ungeklärt", tone: "danger" as const }
];

const materialRows = [
  ["01.01.0010", "NYM-J 3×1,5 mm²", "500,00", "m", "0,69 €", "345,00 €", "✓ Regelbasiert"],
  ["01.01.0020", "NYM-J 5×2,5 mm²", "240,00", "m", "1,84 €", "441,60 €", "✓ Regelbasiert"],
  ["01.02.0010", "Installationsgerät Schalterprogramm", "48,00", "Stk", "12,90 €", "619,20 €", "! AI Interpretation"],
  ["01.03.0040", "LED-Einbauleuchte 36 W, DALI", "32,00", "Stk", "78,40 €", "2.508,80 €", "! Prüfen"],
  ["01.04.0010", "Kleinverteiler 4-reihig IP40", "4,00", "Stk", "184,50 €", "738,00 €", "✓ Sicher"],
  ["01.05.0030", "Brandschutzkanal I90 60×110", "65,00", "m", "46,20 €", "3.003,00 €", "× Ungeklärt"]
];

const titles: Record<View, [string, string]> = {
  dashboard: ["Übersicht", "Materialplanung"], analysis: ["Neue Ermittlung", "Ausschreibung analysieren"],
  materials: ["Material-Engine", "Materialpositionen"], projects: ["Projekte", "Projektübersicht"],
  providers: ["Administration", "AI-Anbieter"], usage: ["Administration", "AI-Nutzung"], settings: ["System", "Einstellungen"]
};

function AppContent() {
  const [view, setView] = useState<View>("dashboard");
  const [providers, setProviders] = useState(initialProviders);
  const [routingMode, setRoutingMode] = useState("FREE_FIRST");
  const [paidAllowed, setPaidAllowed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  const nav = [
    ["dashboard", LayoutDashboard, "Übersicht"], ["analysis", FileSearch, "Neue Ermittlung"],
    ["materials", Boxes, "Material-Engine"], ["projects", FileText, "Projekte"],
    ["providers", BrainCircuit, "AI-Anbieter"], ["usage", BarChart3, "AI-Nutzung"], ["settings", Settings, "Einstellungen"]
  ] as const;

  const toggleProvider = (id: string, active: boolean) => setProviders((items) => items.map((item) => item.id === id ? { ...item, active } : item));
  const content = useMemo(() => {
    if (view === "analysis") return <AnalysisView routingMode={routingMode} setRoutingMode={setRoutingMode} />;
    if (view === "materials") return <MaterialsView query={query} setQuery={setQuery} />;
    if (view === "projects") return <ProjectsView />;
    if (view === "providers") return <ProvidersView providers={providers} toggle={toggleProvider} />;
    if (view === "usage") return <UsageView />;
    if (view === "settings") return <SettingsView theme={theme} setTheme={setTheme} routingMode={routingMode} setRoutingMode={setRoutingMode} paidAllowed={paidAllowed} setPaidAllowed={setPaidAllowed} />;
    return <Dashboard setView={setView} providers={providers} />;
  }, [view, providers, routingMode, paidAllowed, theme, query]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><img src="/brand/s2volt-logo.svg" alt="S2 Volt" /></div>
        <div className="nav-label">Arbeitsbereich</div>
        <nav aria-label="Hauptnavigation"><ul className="nav-list">
          {nav.map(([id, Icon, label]) => <li key={id}><button className={`nav-button ${view === id ? "active" : ""}`} onClick={() => setView(id)} aria-current={view === id ? "page" : undefined}><Icon /><span>{label}</span></button></li>)}
        </ul></nav>
        <div className="sidebar-footer"><div className="system-pill"><div className="system-status"><i className="status-dot" /><span>System bereit</span></div><small>4 von 6 Providern aktiv</small></div></div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title"><NeoIconButton className="mobile-menu" aria-label="Menü"><Menu /></NeoIconButton><div><h1>{titles[view][1]}</h1><span>S2 Volt · {titles[view][0]}</span></div></div>
          <div className="top-actions"><NeoIconButton aria-label="Benachrichtigungen"><Bell /></NeoIconButton><button className="user-pill"><span className="avatar">TM</span><span className="user-copy"><strong>Thomas Muster</strong><small>Administrator</small></span><ChevronDown size={14} /></button></div>
        </header>
        <div className="content">{content}</div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, children, action }: { eyebrow: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{children}</p></div>{action}</div>;
}

function Dashboard({ setView, providers }: { setView: (view: View) => void; providers: Provider[] }) {
  return <>
    <PageHeading eyebrow="Mittwoch, 12. August 2026" title="Guten Morgen, Thomas." action={<NeoButton className="primary" onClick={() => setView("analysis")}><Plus size={16} /> Neue Ermittlung</NeoButton>}>Alle Elektroprojekte, Materialbedarfe und AI-Kosten auf einen Blick.</PageHeading>
    <div className="metrics-grid">
      <NeoMetric icon={<FileText />} value="12" label="Aktive Projekte" trend="↑ 2 seit letztem Monat" />
      <NeoMetric icon={<CircleDollarSign />} value="184.826 €" label="Projektvolumen" trend="↑ 8,4 % im August" />
      <NeoMetric icon={<PackageCheck />} value="963" label="Materialpositionen" trend="88 % automatisch erkannt" />
      <NeoMetric icon={<Sparkles />} value="91 %" label="Kostenfreie Analysen" trend="146 Premium-Calls gespart" />
    </div>
    <div className="dashboard-grid">
      <NeoPanel><div className="panel-header"><div><h3>Aktuelle Projekte</h3><p>Zuletzt bearbeitete Materialplanungen</p></div><NeoButton onClick={() => setView("projects")}>Alle Projekte</NeoButton></div><div className="project-list">{projects.map((project) => <div className="project-row" key={project.name}><div><h4>{project.name}</h4><div className="project-meta">{project.positions} Materialpositionen</div></div><div className="project-value">{project.value}</div><NeoBadge tone={project.tone}>{project.tone === "success" ? "✓" : project.tone === "danger" ? "×" : "!"} {project.status}</NeoBadge></div>)}</div></NeoPanel>
      <NeoPanel><div className="panel-header"><div><h3>Free-First Routing</h3><p>Aktuelle Provider-Reihenfolge</p></div><NeoBadge tone="success"><Wifi size={10} /> Aktiv</NeoBadge></div><div className="provider-route">{providers.filter((p) => p.active).slice(0, 4).map((provider, index) => <div className="route-item" key={provider.id}><div className="route-number">0{index + 1}</div><div className="route-copy"><strong>{provider.name}</strong><small>{provider.plan.replace("_", " ")}</small></div><NeoBadge tone={provider.local ? "info" : "success"}>✓ Bereit</NeoBadge></div>)}</div><div className="saving-card"><div><span>Geschätzte Ersparnis im August</span><strong>38,60 €</strong></div><ShieldCheck color="var(--brand-primary)" /></div></NeoPanel>
    </div>
  </>;
}

function AnalysisView({ routingMode, setRoutingMode }: { routingMode: string; setRoutingMode: (mode: string) => void }) {
  const [fileName, setFileName] = useState("");
  return <><PageHeading eyebrow="Materialplanung" title="Neue Materialermittlung">Ausschreibung lokal vorverarbeiten und nur unklare Positionen gezielt durch AI analysieren.</PageHeading>
    <div className="upload-grid">
      <NeoPanel><label className="dropzone"><input type="file" hidden accept=".pdf,.xlsx,.xls,.csv,.x83,.d83,.p83" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} /><div><div className="drop-icon"><UploadCloud /></div><h3>{fileName || "Ausschreibung hochladen"}</h3><p>{fileName ? "Datei bereit für die lokale Voranalyse" : "Datei hier ablegen oder auswählen"}</p><div className="format-row">{["PDF", "GAEB", "XLSX", "CSV"].map((f) => <NeoBadge key={f}>{f}</NeoBadge>)}</div></div></label><div className="info-strip"><Info /> <span>GAEB- und Tabellendaten werden zuerst lokal normalisiert. An AI-Provider gehen ausschließlich Position, Kurztext, Langtext, Menge und Einheit.</span></div></NeoPanel>
      <NeoPanel><div className="panel-header"><div><h3>Projekt beschreiben</h3><p>Optionaler Kontext verbessert das Shop-Matching</p></div><Bot size={20} color="var(--brand-primary)" /></div><div className="form-stack"><div className="field"><label>Projektname</label><NeoInput placeholder="z. B. Grundschule Neustadt" /></div><div className="field"><label>Anforderungen / Besonderheiten</label><NeoTextarea placeholder="Umbau im laufenden Betrieb, Schalterprogramm reinweiß, Brandschutz gemäß..." /></div><div className="field"><label>AI-Modus</label><div className="mode-picker">{["FREE_FIRST", "AUTO", "QUALITY_FIRST", "PRIVACY_FIRST"].map((mode) => <button key={mode} className={`mode-button ${routingMode === mode ? "active" : ""}`} onClick={() => setRoutingMode(mode)}>{mode.replace("_", " ")}</button>)}</div></div><NeoButton className="primary"><Sparkles size={16} /> Materialbedarf ermitteln</NeoButton></div></NeoPanel>
    </div>
  </>;
}

function MaterialsView({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const rows = materialRows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="Logistikzentrum Süd" title="Materialpositionen" action={<NeoButton className="primary"><ShoppingCart size={16} /> Projekt in Warenkorb</NeoButton>}>Technische Positionen, Match-Qualität und aktuelle Shoppreise.</PageHeading><NeoPanel><div className="table-toolbar"><div className="search-wrap"><Search /><NeoInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Position oder Material suchen …" /></div><div style={{display:"flex",gap:10}}><NeoButton><RefreshCw size={14} /> Preise aktualisieren</NeoButton><NeoIconButton><MoreHorizontal /></NeoIconButton></div></div><div className="table-scroll"><table className="data-table"><thead><tr>{["LV-Position", "Material / Shop-Match", "Menge", "ME", "EP netto", "Gesamt", "Erkennung"].map((h) => <th key={h} className={h.includes("netto") || h === "Gesamt" ? "align-right" : ""}>{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={i} className={`${[0,2,4,5].includes(i) ? "mono" : ""} ${[4,5].includes(i) ? "align-right" : ""}`}>{i === 6 ? <NeoBadge tone={cell.startsWith("✓") ? "success" : cell.startsWith("×") ? "danger" : "warning"}>{cell}</NeoBadge> : cell}</td>)}</tr>)}</tbody></table></div></NeoPanel></>;
}

function ProjectsView() {
  return <><PageHeading eyebrow="12 aktive Projekte" title="Projektübersicht" action={<NeoButton className="primary"><Plus size={16} /> Neues Projekt</NeoButton>}>Bearbeitungsstatus, Volumen und Materialpositionen aller laufenden Planungen.</PageHeading><NeoPanel><div className="table-toolbar"><div className="search-wrap"><Search /><NeoInput placeholder="Projekte durchsuchen …" /></div><NeoSelect style={{width:180}} defaultValue="all"><option value="all">Alle Status</option><option>In Analyse</option><option>Sicher</option></NeoSelect></div><div className="project-list">{projects.concat(projects.slice(0,2).map(p => ({...p,name:p.name+" · BA 2"}))).map((project) => <NeoCard className="project-row" style={{padding:18,border:0}} key={project.name}><div><h4>{project.name}</h4><div className="project-meta">Zuletzt bearbeitet: heute · {project.positions} Positionen</div></div><div className="project-value">{project.value}</div><NeoBadge tone={project.tone}>{project.status}</NeoBadge></NeoCard>)}</div></NeoPanel></>;
}

function ProvidersView({ providers, toggle }: { providers: Provider[]; toggle: (id: string, active: boolean) => void }) {
  const [testing, setTesting] = useState<string | null>(null);
  const test = async (id: string) => { setTesting(id); await new Promise((r) => setTimeout(r, 700)); setTesting(null); };
  return <><PageHeading eyebrow="Provider-Gateway" title="AI-Anbieter" action={<NeoButton><RefreshCw size={15} /> Modelle aktualisieren</NeoButton>}>Provider, Modelle, Kostenmodelle und Fähigkeiten zentral konfigurieren. Tarifangaben sind administrative Metadaten, keine fest codierte Geschäftslogik.</PageHeading><div className="providers-grid">{providers.map((provider) => <NeoCard className="provider-card" key={provider.id}><div className="provider-top"><div className="provider-logo">{provider.short}</div><div><h3>{provider.name}</h3><p>Priorität {provider.priority} · geprüft {provider.verified}</p></div><NeoSwitch checked={provider.active} onChange={(active) => toggle(provider.id, active)} label={provider.active ? "Aktiv" : "Inaktiv"} /></div><div className="provider-details"><div><span className="detail-label">Kostenmodell</span><span className="detail-value">{provider.plan.replace("_", " ")}</span></div><div><span className="detail-label">Modell</span><span className="detail-value">{provider.model}</span></div><div><span className="detail-label">Status</span><span className="detail-value">{provider.active ? "✓ Bereit" : "– Deaktiviert"}</span></div></div><div className="provider-actions"><div className="capabilities">{provider.capabilities.map((c) => <NeoBadge key={c} tone="neutral">{c}</NeoBadge>)}</div><NeoButton disabled={testing === provider.id} onClick={() => test(provider.id)}>{testing === provider.id ? <RefreshCw className="spin" size={13} /> : <Activity size={13} />} Verbindung testen</NeoButton></div></NeoCard>)}</div></>;
}

function UsageView() {
  const data = [["NVIDIA NIM","184","176","8","422k","0,00 €","1,8 s"],["Gemini","106","103","3","318k","0,00 €","1,3 s"],["Groq","73","69","4","162k","0,00 €","0,7 s"],["Ollama","58","54","4","129k","0,00 €","3,4 s"],["OpenAI","12","12","0","48k","3,62 €","2,1 s"]];
  return <><PageHeading eyebrow="August 2026" title="AI-Nutzung">Kosten, Erfolgsraten, Laufzeiten und Einsparungen über alle konfigurierten Provider.</PageHeading><div className="metrics-grid"><NeoMetric icon={<Gauge />} value="433" label="Analysen diesen Monat" /><NeoMetric icon={<Zap />} value="421" label="Kostenlose / lokale Calls" trend="97,2 % aller Calls" /><NeoMetric icon={<CircleDollarSign />} value="3,62 €" label="Geschätzte Kosten" /><NeoMetric icon={<ShieldCheck />} value="146" label="Premium-Calls gespart" trend="≈ 38,60 € vermieden" /></div><NeoPanel><div className="panel-header"><div><h3>Provider-Statistik</h3><p>Nutzung wird serverseitig je Call protokolliert</p></div><NeoBadge tone="success">✓ Fehlerrate 4,4 %</NeoBadge></div><div className="table-scroll"><table className="data-table"><thead><tr>{["Provider","Anfragen","Erfolgreich","Fehler","Tokens","Kosten","Ø Laufzeit"].map(h=><th key={h} className={h!=="Provider"?"align-right":""}>{h}</th>)}</tr></thead><tbody>{data.map(row=><tr key={row[0]}>{row.map((c,i)=><td key={c} className={`${i?"align-right mono":""}`}>{c}</td>)}</tr>)}</tbody></table></div></NeoPanel></>;
}

function SettingsView({ theme, setTheme, routingMode, setRoutingMode, paidAllowed, setPaidAllowed }: { theme: "light"|"dark"|"system"; setTheme: (t:"light"|"dark"|"system")=>void; routingMode:string; setRoutingMode:(m:string)=>void; paidAllowed:boolean; setPaidAllowed:(v:boolean)=>void }) {
  return <><PageHeading eyebrow="Systemkonfiguration" title="Einstellungen">Darstellung, AI-Kostenstrategie und harte Ausgabenlimits verwalten.</PageHeading><div className="settings-grid"><NeoPanel className="setting-group"><h3>Darstellung</h3><p>Neomorphe Tiefen und Schatten sind für beide Farbschemata optimiert.</p><div className="setting-list"><div className="setting-row"><div className="setting-copy"><strong>Farbschema</strong><span>Hell, Dunkel oder Systemeinstellung</span></div><div className="theme-tabs">{(["light","dark","system"] as const).map(t=><button key={t} className={theme===t?"active":""} onClick={()=>setTheme(t)}>{t==="light"?<Sun size={13}/>:t==="dark"?<Moon size={13}/>:<Settings size={13}/>}</button>)}</div></div><div className="setting-row"><div className="setting-copy"><strong>Informationsdichte</strong><span>Kompakte technische Tabellen</span></div><NeoBadge tone="info">Kompakt</NeoBadge></div></div></NeoPanel><NeoPanel className="setting-group"><h3>AI-Kostenstrategie</h3><p>Die serverseitige Sperre hat immer Vorrang vor der Routing-Einstellung.</p><div className="setting-list"><div className="setting-row"><div className="setting-copy"><strong>Routing-Modus</strong><span>Kosten und Qualität ausbalancieren</span></div><NeoSelect value={routingMode} onChange={e=>setRoutingMode(e.target.value)} style={{width:160}}><option>FREE_FIRST</option><option>AUTO</option><option>QUALITY_FIRST</option><option>PRIVACY_FIRST</option><option>MANUAL</option><option>FALLBACK</option></NeoSelect></div><div className="setting-row"><div className="setting-copy"><strong>Kostenpflichtige APIs zulassen</strong><span>Aus bedeutet: niemals automatisch senden</span></div><NeoSwitch checked={paidAllowed} onChange={setPaidAllowed} label={paidAllowed?"Ja":"Nein"}/></div><div className="setting-row"><div className="setting-copy"><strong>Maximal pro Analyse</strong><span>Wird vor jedem bezahlten Call geprüft</span></div><NeoInput className="budget-input" defaultValue="0,50 €" /></div></div></NeoPanel></div></>;
}

export function MaterialApp() { return <ThemeProvider><AppContent /></ThemeProvider>; }
