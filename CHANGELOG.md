# CHANGELOG - Quant Nanggroe OS

## [v10.0.0] - 2026-01-06 (White Sur & Neural Swarm Edition)
### Added
- **macOS White Sur UI**: Estetika premium dengan mode Cerah (Day) dan Gelap (Night) yang dapat dipindah secara instan melalui switch di Top Bar.
- **Neural Swarm Parallelism**: Koordinasi simultan 5 agen spesialis (Alpha Prime, Quant-Scanner, News-Sentinel, Risk-Guardian, Strategy-Weaver).
- **Day/Night Switch**: Tombol Matahari/Bulan di Top Bar untuk transisi visual instan dengan efek glassmorphism yang dioptimalkan.
- **Robust Market Proxy (v10)**: Sistem pengambilan data pasar yang lebih tangguh dengan multi-proxy fallback untuk mengatasi limitasi CORS pada data Binance.
- **Institutional Quant Suite**: Analisis teknikal canggih (RSI, EMA, Bollinger Bands, dll) yang langsung terintegrasi ke dalam feed harga.
- **Dynamic Backdrop Blur**: Efek blur 32px pada Top Bar dan Window Frame untuk kedalaman visual yang nyata.

### Removed
- Menghapus direktori legacy: "Dhaher Quant 01" dan "Quant Nanggroe Back Up".
- Menghapus file `keterangan.txt` (konten digabungkan ke `penjelasan.txt`).

### Fixed
- Memperbaiki `SyntaxError` pada export `IconMoon` di `components/Icons.tsx`.
- Optimasi performa rendering jendela pada layar resolusi tinggi.

## [v9.1.0] - 2026-01-06 (Glass Edition)
### Added
- **True macOS-Style UI**: Implemented a floating glassmorphism Dock with magnification effect.
- **Top Menu Bar**: Added a global system bar with an Apple-like menu.
- **macOS Window Management**: Redesigned Window Frame with traffic-light buttons.
