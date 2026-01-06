# CHANGELOG - QUANT NANGGROE AI

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
