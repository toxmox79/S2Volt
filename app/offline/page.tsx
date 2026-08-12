import { WifiOff } from "lucide-react";
import { NeoPanel } from "@/components/neo";

export default function OfflinePage() {
  return <main className="offline-page"><NeoPanel className="offline-card"><img src="/brand/s2volt-logo.svg" alt="S2 Volt" /><div className="drop-icon"><WifiOff /></div><h1>Keine Verbindung</h1><p>Die App-Oberfläche bleibt verfügbar. Für die AI-Analyse wird eine Verbindung zu einem konfigurierten AI-Provider benötigt. Ein lokal erreichbares Ollama kann weiterhin verwendet werden.</p></NeoPanel></main>;
}
