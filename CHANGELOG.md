# CHANGELOG - Quant Nanggroe OS

## [v10.0.0] - 2026-01-06 (Neural Swarm Edition)
### Added
- **Neural Swarm Parallelism**: Agents now work simultaneously via `runSwarmParallel` logic, synthesizing multi-node intelligence into a single verdict.
- **Binance Institutional Data**: Replaced all simulated/unreliable crypto sources with direct Binance API integration (Klines/Tickers).
- **Institutional Math Suite**: Added Stochastic, ADX, CCI, and Volume Profile analysis to the core Math Engine.
- **Nanggroe macOS UX**: Finalized the Macintosh-inspired ecosystem with custom Traffic-Light buttons and Floating Crystal Dock.
- **Autonomous Execution Parser**: Agents can now trigger system actions like `OPEN_WINDOW` and `NAVIGATE_BROWSER` directly from neural output.

### Fixed
- Fixed CORS issues with CoinGecko by migrating to Binance and CoinCap.
- Improved window management and top-bar atomic sync.

## [v9.1.0] - 2026-01-06 (Glass Edition)
### Added
- **True macOS-Style UI**: Implemented a floating glassmorphism Dock with magnification effect and status indicators.
- **Top Menu Bar**: Added a global system bar with an Apple-like menu, command shortcuts, and real-time status indicators.
- **macOS Window Management**: Redesigned Window Frame with traffic-light buttons (red, yellow, green) and institutional glass styling.
- **Multi-Agent Memory System**: New `MemoryManager` service allows agents to save and load state across sessions.
- **Desktop Awareness (v2)**: Agents can now perceive all active windows and system snapshots for coordinated task execution.
- **Adaptive OS Layout**: Optimized the responsive engine to handle diverse screen resolutions and mobile views dynamically.

### Fixed
- Improved glassmorphism saturation and backdrop-blur levels for better accessibility.
- Synchronized window z-index management across the entire ecosystem.
