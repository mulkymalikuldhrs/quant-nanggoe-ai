
# Change Log

All notable changes to the **Quant Nanggroe AI Ecosystem** will be documented in this file.

## [5.0.0] - 2026-01-06
### The Great Integration (Quant Nanggroe AI x Dhaher Quant 01)
- **Unified Architecture:** Integrated **Dhaher Quant 01** specialized trading terminal into the **Quant Nanggroe AI** Living OS ecosystem.
- **Terminal Upgrade:** `TradingTerminalWindow` now features the full Dhaher dashboard (MiSi Screener, Order Flow, Correlation Matrix, and AI-Driven Fundamentals).
- **Core Dependencies:** Added `animejs` and `react-resizable-panels` to support the new institutional UI widgets.
- **Enhanced Types:** Merged `TradeSignalData`, `StrategyClusterScores`, and `FundamentalAnalysisData` into the core type system.
- **Icon Set:** Expanded `Icons.tsx` to support both OS and Trading Terminal icon aliases (e.g., `BotIcon`, `ChartIcon`).
- **Documentation:** Updated `keterangan.txt` with a comprehensive comparison and integration map.

## [4.7.0] - 2025-05-26
### Community & Credits
- **Developer Profile:** Updated global credits to **Mulky Malikul Dhaher**.
- **Social Integration:** Linked GitHub (`mulkymalikuldhrs`) and Instagram (`@mulkymalikuldhr`).
- **Recruitment:** Now recruiting for **Dhaher & Contributors**.
- **System**: Changelog load/save protocol verified.

## [4.6.0] - 2025-05-25
### Brand Evolution
- **Rebranding:** System officially renamed to **Quant Nanggroe AI**.
- **Credits:** Updated all documentation and UI to reflect **Mulky Malikul Dhaher** as the Lead Developer.

## [4.5.0] - 2025-05-24
### Architectural Alignment (Roadmap Phase 3)
- **Orchestration Engine:** \`AutonomousAgent\` now enforces a strict sequential pipeline (Data -> Analyst -> Risk -> Execution) mirroring professional firms.
- **Library Upgrade:** \`QUANT_LIBRARY.md\` updated with references to **Backtrader**, **PyPortfolioOpt**, and **FinRL** to align agent reasoning with industry-standard Python frameworks.
- **Manifest:** Updated to reflect the shift from "Simulation" to "Orchestration".

## [4.4.0] - 2025-05-23
### The Knowledge Injection
- **Expanded \`QUANT_LIBRARY.md\`**: Context Injection enabled.

## [4.3.0] - 2025-05-22
### The Quantum Brain Update
- **Added \`QUANT_LIBRARY.md\`**: A compiled logic core containing 200+ trading concepts, formulas, and risk models.
- **Agent Logic Upgrade**: 
    - **Quant OS** now references specific patterns (e.g., "Golden Cross", "Bollinger Squeeze") defined in the library.
    - **Risk Daemon** now enforces **Kelly Criterion** and **VaR** logic found in the library.
- **System**: Boot sequence now loads the Quant Library into the Virtual File System.

## [4.2.0] - 2025-05-21
### Critical Upgrades
- **Real-Time Data:** Integrated \`MarketService\` connecting to CoinGecko API. Agents can now see live prices.
- **Portfolio Engine:** \`PortfolioWindow\` now auto-syncs asset values with live market data. PnL is real.
- **Research Module:** Added \`RESEARCH.md\` containing industry insights (Numerai, Two Sigma) to ground agent behavior.
- **Risk Governance:** Enforced stricter "Risk Daemon" protocols based on user audit.

## [4.1.0] - 2025-05-20
### Added
- **AI Nanggroe OS:** Complete UI refactor to a Desktop Environment.
- **Window Manager:** Drag, resize, minimize, maximize support for all modules.
- **Taskbar:** Mac-style dock with system tray and window toggles.
- **Audit Protocol:** Dedicated Audit Log tab in Swarm Monitor to track `evt-` events.
- **System Info:** Start Menu functionality showing developer credits.
- **Documentation:** Added `README.md` and `CHANGELOG.md`.

### Changed
- **Core Engine:** Set `gpt-4.1-nano-2025-04-14` (LLM7) as the immutable default model.
- **Scaling:** Expanded Swarm from 4 to 7 agents (Added Crypto Oracle, Security Auditor, Evolution Engine).
- **HUD:** Migrated Agent HUD from a fixed overlay to a movable window.

## [3.5.0] - 2025-05-15
### Added
- **Self-Evolution:** Agents can now propose code patches via `propose_system_patch` tool.
- **Patch Viewer:** UI to review generated code diffs.

## [3.0.0] - 2025-05-10
### Added
- **LLM Router:** Intelligent failover system (Google -> Groq -> OpenAI).
- **Multi-Provider:** Support for Groq and LLM7 APIs.

## [2.0.0] - 2025-04-01
### Added
- **Swarm Intelligence:** Introduction of `AutonomousAgent` class.
- **Visual Graph:** SVG-based visualization of agent nodes.

## [1.0.0] - 2025-01-01
### Initial Release
- Basic Chat Interface.
- Google Gemini Integration.

---
**Developer:** Mulky Malikul Dhaher <mulkymalikuldhr@mail.com>
