# S2 Volt Materialplanung

Installierbare B2B-PWA für technische Elektro-Materialplanung. Unstrukturierte Ausschreibungen werden lokal vorverarbeitet; AI wird nur für die Positionen genutzt, bei denen regelbasierte Erkennung keinen sicheren Treffer liefert.

## Start

```bash
npm install
copy .env.example .env.local
npm run icons
npm run dev
```

Produktionsprüfung:

```bash
npm test
npm run build
npm start
```

Nicht konfigurierte Provider werden deaktiviert und verhindern den Start nicht. Ollama wird standardmäßig unter `http://localhost:11434` erwartet.

## PWA-Installation

Die App liefert ein echtes Manifest unter `/manifest.webmanifest` und registriert in Produktions-Builds `/sw.js`. In Chrome/Edge erscheint die Installation in der Adressleiste bzw. unter **App installieren**. Android bietet **Zum Startbildschirm hinzufügen** an. Die App verwendet `display: standalone`, S2-Volt-Theme-Farbe und eigene Icons.

Der Service Worker cached App-Shell, Logo, Icons und erfolgreiche statische GET-Ressourcen. Navigation verwendet Network-first mit Cache und `/offline` als Fallback. API-Anfragen werden bewusst nicht gecached. Offline wird keine AI-Antwort simuliert; ein lokal erreichbares Ollama kann weiterhin verwendet werden.

## Logo und Icons

Source of Truth: [offizielles S2-Volt-Logo](https://www.s2-volt.de/bilder/intern/shoplogo/logo_s2volt.svg). Das Logo liegt lokal unter `public/brand/s2volt-logo.svg`. `npm run icons` erzeugt daraus ohne Verzerrung:

- `public/icons/icon.svg`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png` mit größerer Safe Area
- `public/icons/apple-touch-icon.png`
- `public/favicon.svg`

Die Markenfarben `#ff4539` und `#01010c` wurden direkt aus dem SVG abgeleitet und sind zentrale CSS-Tokens.

## AI-Provider

Das gemeinsame `AIProvider`-Interface unterstützt Verbindungstest, optionale Modellsynchronisation, Fähigkeiten, Projekt-/Positionsanalyse und optionale Kostenschätzung. Der `OpenAICompatibleProvider` vermeidet HTTP-Duplikation bei NVIDIA NIM, Groq, OpenAI, Ollama sowie vorbereiteten Adaptern.

Implementiert:

- NVIDIA NIM: `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, `NVIDIA_MODEL`
- Google Gemini: `GEMINI_API_KEY`, `GEMINI_MODEL`
- Groq: `GROQ_API_KEY`, `GROQ_MODEL`
- OpenAI: `OPENAI_API_KEY`, `OPENAI_MODEL`
- Ollama: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
- Cloudflare Workers AI: Account, Token und Modell

Architektonisch vorbereitet: Hugging Face Inference Providers, Cerebras und Mistral. Anthropic ist als ENV-Platzhalter vorgesehen und kann über einen eigenen nicht-OpenAI-kompatiblen Adapter ergänzt werden.

Tarifangaben (`FREE_TIER`, `FREE_TRIAL`, `PAID`, `LOCAL`, `HYBRID`) sind Metadaten der Providerkonfiguration und nicht in die Analyse-Geschäftslogik eingebrannt. Sie sollten administrativ regelmäßig geprüft werden.

## Routing und Kosten

Verfügbare Modi: `AUTO`, `FREE_FIRST`, `QUALITY_FIRST`, `PRIVACY_FIRST`, `MANUAL`, `FALLBACK`.

`FREE_FIRST` bevorzugt passende Free-Tier-, Trial-, Hybrid- und lokale Provider. Erst danach kommen kostenpflichtige Provider infrage. Ein Premium-Call benötigt zugleich:

1. `allowPaid: true` in der Anfrage und
2. `AI_ALLOW_PAID=true` auf dem Server.

Andernfalls greift die harte Kostensperre. Rate Limits, erschöpfte Quoten, Netzfehler und entfernte Modelle setzen nur `temporarilyUnavailableUntil`; der Router versucht automatisch den nächsten Provider. `PRIVACY_FIRST` priorisiert Ollama.

Der `PreClassifier` erkennt eindeutige Kabelbezeichnungen deterministisch. Nur ungelöste Positionen müssen an AI gehen. Nutzungsereignisse werden über das Gateway protokolliert und über `/api/ai/usage` aggregiert. Der MVP verwendet einen prozesslokalen Store; für mehrere Instanzen sollte dieser durch PostgreSQL/Redis ersetzt werden.

## API

- `POST /api/ai/analyze` – geroutete Textanalyse
- `GET /api/ai/providers` – Providerstatus und Pläne
- `POST /api/ai/providers/:id/test` – Authentifizierung, Endpoint, Modell und Textcall testen
- `GET /api/ai/usage` – Nutzungsstatistik

Die gebrandete B2B-Loginoberfläche liegt unter `/login`; die eigentliche Authentifizierung wird an das später gewählte Kunden-/Shop-Identity-System angebunden.

## Design und Bedienung

Zentrale Soft-UI-Tokens steuern helle/dunkle Schatten, Oberflächen, Radien und S2-Rot. Das Layout nutzt eine Desktop-Sidebar, kompakte Tablet-Navigation und mobile Bottom-Navigation. Tabellenzeilen bleiben bewusst flach und informationsdicht; nur Container, Toolbar und Eingaben nutzen Neomorph-Tiefen. Status enthalten stets Text/Symbol zusätzlich zur Farbe.
