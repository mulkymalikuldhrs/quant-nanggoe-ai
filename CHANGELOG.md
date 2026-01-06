# CHANGELOG - QUANT NANGGROE AI

## [v15.0.0] - 2026-01-06 (FINAL MVP: OPERATIONAL READINESS)
### Added
- **Risk Guardian (Constitutional Law)**: Implemented a deterministic risk enforcement layer with a daily drawdown Kill-switch and multi-asset Correlation Monitor.
- **Execution Reality Engine**: Integrated realistic trading simulation in `BacktestEngine` including dynamic spreads, slippage, partial fills, and network latency.
- **Strategy Lifecycle Manager**: Added Darwinian strategy management that automatically kills non-performing strategies based on expectancy and drawdown thresholds.
- **Evolution Monitor**: Implemented a reporting service to track and analyze the performance evolution of all active strategy variants.
- **Audit Traceability**: Full integration of `AuditLogger` across all layers (Market, Sensor, Pressure, Decision, Risk, Execution).

### Changed
- **Backtest Fidelity**: Upgraded the backtesting engine to use the `ExecutionReality` model, ensuring performance results are grounded in real-market conditions.
- **Risk Refactoring**: Migrated `RiskManagement` from a simple heuristic model to a "Constitutional" hard-coded enforcement model.

### Completed
- **Full MVP Lifecycle**: Successfully completed all 6 weeks of the build order as specified in the `BUILD_PLAN.md` and `BLUEPRINT.md`.

## [v12.0.0] - 2026-01-06 (PROFESSIONAL TRADING EDITION)
### Added
- **Institutional Logic (SMC)**: Implemented Smart Money Concepts including Order Blocks, Fair Value Gaps (FVG), and Market Structure Breaks.
- **Support & Resistance Engine**: Added automated identification of high-probability Supply/Demand zones and Pivot points.
- **MT4/MT5 Terminal Portfolio**: Completely redesigned Portfolio Management into a professional trading terminal style (Equity, Margin, Free Margin, real-time PnL).
- **Resizable & Draggable Windows**: System-wide support for window resizing and dragging for custom workspace management.
- **Neural Browser Reader**: Integrated Jina AI "Neural Reader" for deep content extraction from complex financial websites.
- **Persistent Agent Memory**: Implemented a long-term context storage system for inter-agent collaboration across sessions.
- **Institutional Data Pipeline**: Replaced generic public API fetches with a robust proxy-rotator pipeline for Binance and institutional sources.

### Changed
- **Branding Realism**: Renamed "Neural Chart" to "Market Analysis" and "Quantum Nexus" components to more professional terminology.
- **UI Optimization**: Cleaned up excessive symbols (`_`) and optimized layout for desktop/PC monitors.
- **Autonomous Research**: Upgraded the Research Agent from simulation-mode to real data harvesting and synthesis.

### Fixed
- **`/scan` Command**: Fixed the command execution to provide actual technical analysis and SMC signal outputs for symbols like BTCUSD.
- **CORS Issues**: Resolved persistent CORS errors via a centralized proxy rotator service.

## [v11.5.0] - 2026-01-06 (QUANTUM NEXUS EDITION)
### Added
- **Quantum Nexus Engine**: Introduced a new simulation core that utilizes probabilistic quantum state modeling for market forecasting.
- **Nexus Command Center**: A unified intelligence window that aggregates all real-time feeds (Market, News, Sentiment, and Research) into a high-density "War Room" interface.
- **Holographic Glass Accents**: Refined the Sequoia Glass UI with crystalline shimmer effects and enhanced transparency for the new Nexus components.
- **Synaptic Signal Logs**: Added visual "firing" indicators in the Research Agent to represent active data processing nodes.

### Changed
- **Version Upgrade**: Migrated entire ecosystem to v11.5.0.
- **Intelligence Synergy**: Deep integration between the Research Agent and the new Quantum Engine for predictive intelligence.

## [v11.4.0] - 2026-01-06 (AUTONOMOUS INTELLIGENCE CORE)
### Added
- **Hyper-Autonomous Intelligence**: Research Agent now runs with enhanced logic, harvesting intelligence from broader sources including Institutional Flows, Social Sentiment, and Geopolitical Data.
- **Intelligence Swarm Integration**: Added 'researchAutomation' tool capability to Alpha Prime, allowing the swarm to direct the research agent's focus.
- **Deep Knowledge Connection**: Virtual Disk C: now acts as a primary intelligence bridge, synchronizing external data with Long Term Memory.

### Fixed
- **Missing Icons**: Added `IconDatabase`, `IconActivity`, and `IconZap` to `Icons.tsx`.
- **Import Conflicts**: Fixed `ResearchAgent` capitalization and `ThemeContext` imports.
- **Service Methods**: Added `getLogs()` to `ResearchAgent` service.

## [v11.3.0] - 2026-01-06 (KNOWLEDGE DISK EDITION)
### Added
- **Autonomous Research Agent**: A new background intelligence gathering system that automatically scans public APIs (News, Market, Geo, Sentiment, Institutional, AI) and stores data.
- **Knowledge Disk (C:)**: Implemented a virtual file system structure for organizing research data into folders like `/MARKET`, `/NEWS`, `/GEO`, etc.
- **Disk Explorer UI**: A new window for browsing the Knowledge Base, reading research reports, and managing saved intelligence.
- **Research Monitor**: Dedicated UI for real-time monitoring of the Research Agent's logs and data acquisition activities.

... (previous versions truncated for brevity)
