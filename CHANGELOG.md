# CHANGELOG - QUANT NANGGROE AI

## [v11.0.0] - 2026-01-06 (SEQUOIA GLASS EDITION)
### Added
- **macOS Sequoia Aesthetic**: Upgraded the entire UI to match macOS Sequoia's "Glass" design language.
- **Launchpad**: Implemented a full-screen application launcher for quick access to all modules.
- **Control Center**: Added a unified system controls hub for theme, network, and system toggles.
- **Sequoia Glassmorphism**: Increased backdrop blur (32px -> 50px) and refined glass textures for a deeper visual experience.
- **Magnetic Dock**: Optimized the taskbar with ultra-small icons, magnetic magnification, and active status indicators.

### Changed
- **Version Upgrade**: System-wide migration to v11.0.0 across all documentation and UI components.
- **Model Names**: Updated available models to "Nanggroe Flash 11.0" and "Nanggroe Pro 11.0".
- **Window Interaction**: Enhanced WindowFrame with authentic macOS traffic light interactions.

### Fixed
- **UI Consistency**: Standardized versioning and naming conventions across `App.tsx`, `penjelasan.txt`, and metadata files.
- **Documentation**: Synchronized technical specifications and core architecture descriptions in `penjelasan.txt`.

### Removed
- **Legacy References**: Removed mentions of "White Sur Edition" to maintain focus on the Sequoia evolution.

## [v10.0.0] - 2026-01-06 (WHITE SUR EDITION)
### Added
- **macOS White Sur Aesthetic**: Completely overhauled the UI with a brighter, cleaner "White Sur" look in Day Mode.
- **Dual Night and Day Mode**: Added a professional toggle switch in the Top Bar for instant theme switching.
- **Dynamic Glassmorphism**: High-intensity backdrop blur and grain effects for a premium "Apple-like" feel.
- **Robust Multi-Proxy Fallback**: New system in `MarketService` to handle Binance API data via multiple proxies (AllOrigins, CodeTabs, CorsProxy.io) to ensure zero downtime and fix CORS issues.
- **Neural Swarm Parallelism**: Integrated coordination of 5 specialized AI agents for market analysis.

### Changed
- **Smaller Icons**: Reduced icon sizes in the Dock (Taskbar) for a more elegant and professional appearance.
- **Enhanced Top Bar**: Redesigned the Top Bar with improved layout, system notifications, and active swarm status.
- **Optimized Backgrounds**: New dynamic gradients and grain textures for both Light and Dark modes.
- **Dock Refinement**: Improved magnification logic and button containers for the smaller icon set.

### Fixed
- **CORS Bug**: Fixed issues with fetching Binance data by implementing a robust fallback mechanism.
- **Icon Rendering**: Fixed minor bug in `IconMoon` and ensured all icons scale correctly in the Dock.
- **Window Scaling**: Improved window frame responsiveness for different screen sizes.

### Removed
- **Legacy Files**: Cleaned up outdated "Dhaher Quant" and backup directories to optimize project structure.
- **keterangan.txt**: Consolidated documentation into `penjelasan.txt` and `README.md`.

---
*Developed by Orchids for Quant Nanggroe Ecosystem.*
