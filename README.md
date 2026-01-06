# 🦅 QUANT NANGGROE AI
### **Multi-Agent Quant Research & Decision Intelligence OS**
*(Powered by ORCHID AI – Deterministic Agent Executor)*

![Version](https://img.shields.io/badge/Version-15.1.0-gold?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Operational_Full-green?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Deterministic_Multi--Agent-blue?style=for-the-badge)

---

## 🏛️ OVERVIEW & POSITIONING

**QUANT NANGGROE AI** adalah Sistem Operasi Riset Kuantitatif tingkat lanjut yang dirancang untuk mengeliminasi bias psikologis dan naratif AI dalam pengambilan keputusan pasar modal. 

Sistem ini bukan sekadar antarmuka LLM, melainkan ekosistem **Deterministic Decision Intelligence** di mana AI (LLM) bekerja di bawah kontrak logika yang sangat kaku, berfungsi sebagai mesin penalaran (*reasoning engine*) terhadap data numerik mentah.

### **Core Identity:**
- ✅ **Quant Research OS**: Lingkungan terpadu untuk analisis kuantitatif lintas aset (Crypto, Stocks, Forex, Commodities).
- ✅ **Decision Intelligence Platform**: Mengompresi ribuan data point menjadi keputusan yang dapat dieksekusi.
- ✅ **Assisted Trading Workbench**: Meja kerja digital profesional dengan simulasi realitas eksekusi (Slippage, Spread, Latency).

---

## 🏗️ ARSITEKTUR CORE v15.1.0

Sistem beroperasi menggunakan hirarki **Top-Down** yang kaku:

### **1. Layer 0: Contextual Neural Grounding**
Sebelum proses penalaran dimulai, sistem memanen data real-time (L1/L2 data) dan snapshot sistem. LLM dilarang berhalusinasi; semua argumen wajib berbasis fakta grounding yang tervalidasi.

### **2. Layer 1: Market Regime Engine (The Gatekeeper)**
Menentukan kondisi pasar global (Trending, Range, Risk-Off, Panic). Jika regime dinyatakan `NO_TRADE` (misal: likuiditas terlalu tipis atau volatilitas ekstrem), seluruh sistem akan berhenti untuk melindungi modal.

### **3. Layer 2: Multi-Agent Sensors (The Eyes)**
Agen tidak memberikan opini subjektif. Mereka bertindak sebagai sensor numerik:
- **QuantScanner**: Analisis momentum, kekuatan tren (ADX), dan volatilitas teknikal.
- **SMCAgent**: Deteksi Market Structure (BOS, CHoCH), Order Blocks, dan Liquidity Sweeps.
- **NewsSentinel**: Impact scoring berita makro dengan *Logarithmic Time Decay*.
- **FlowAgent**: Analisis aliran dana institusional (Whale Flow) dan posisi COT.

### **4. Layer 3: Pressure Normalization Engine (The Compiler)**
Mengonversi seluruh output sensor mentah menjadi variabel tekanan tunggal: `BUY_PRESSURE` dan `SELL_PRESSURE` (0.0 - 1.0).

### **5. Layer 4: Decision Synthesis Engine (The Judge)**
Satu-satunya entitas dengan otoritas eksekusi. Menggunakan **Decision Table** untuk menghasilkan output terkompresi: `1 Entry`, `1 Stop Loss`, dan `1-3 Take Profit`.

---

## 🛡️ RISK GUARDIAN (CONSTITUTIONAL LAW)

Keamanan sistem tidak berbasis AI, melainkan logika deterministik keras (Hard-coded):
1. **Kill-Switch**: Penguncian otomatis jika *daily drawdown* > 4%.
2. **Correlation Monitor**: Memblokir eksekusi jika korelasi antar aset aktif > 0.70.
3. **Execution Reality**: Simulasi backtesting mencakup variabel dunia nyata: Dynamic Spread, Slippage, dan Latency.

---

## 🛠️ TECH STACK

- **Frontend**: React 18 + TypeScript + Tailwind CSS (Terminal-Style UI).
- **Intelligence**: Multi-LLM Routing (Gemini 2.0, Groq, OpenAI).
- **Data Pipeline**: Proxy Rotator Institutional Data Service.
- **Storage**: Hybrid-Ready Engine (LocalStorage + Local JSON File Backup/Restore).

---

## 💾 HYBRID-READY STORAGE ARCHITECTURE (v1.0)

Sistem kini menggunakan `StorageManager` dengan pola *Adapter Pattern* untuk fleksibilitas penyimpanan data:
1. **Local Storage (Primary)**: Menggunakan Browser LocalStorage dengan sinkronisasi asinkron.
2. **Local File Backup**: Fitur ekspor/impor seluruh state sistem ke file `.json` lokal via *Control Center*.
3. **Hybrid Roadmap**: Arsitektur siap untuk integrasi Cloud (Supabase/PostgreSQL) sebagai adapter tambahan.

---

## 🚀 GETTING STARTED

1. **Install**: `npm install`
2. **Configure**: Masukkan API Keys (Gemini, Finnhub, AlphaVantage, Polygon) di `.env.local` atau UI Settings.
3. **Launch**: `npm run dev`

---
**© 2026 Quant Nanggroe AI | Final Architecture Document v15.1.0**
