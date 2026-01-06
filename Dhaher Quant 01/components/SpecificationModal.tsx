
import React, { useMemo } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRADING_PLAN_CONTENT = `# TRADING PLAN ULTIMATE 3.0 - AUTONOMOUS AI AGENT
## Rencana Trading Otomatis Cerdas dengan AI & Machine Learning

**Author:** Dhaher Terminal
**Version:** 3.0 - Autonomous Agent & Clarity Upgrade
**Date:** 20 Juni 2025

---

## 📋 EXECUTIVE SUMMARY

Trading Plan ini dirancang khusus untuk 'Dhaher Terminal' sebagai AI trading agent otonom. Tujuannya adalah untuk mensimulasikan proses pengambilan keputusan tingkat institusional dengan transparansi maksimum, mengintegrasikan:
- **Smart Money Concept (SMC)** + **Inner Circle Trader (ICT)** methodology
- **Analisis Multi-Timeframe (MTA)** dengan mode spesifik untuk gaya trading berbeda.
- **Analisis Fibonacci** untuk konfluens dan penentuan target.
- **Manajemen Risiko Profesional**

---

## 🎯 1. METODOLOGI TRADING & GAYA

### 1.1 Core Methodology: ICT + SMC
Bot menggunakan konsep likuiditas, struktur pasar, dan ketidakefisienan harga (POI) sebagai dasar analisis.

### 1.2 Trading Styles (Gaya Trading)
Bot akan memilih salah satu gaya berikut untuk setiap sinyal, berdasarkan kondisi pasar.

\`\`\`
SCALPING:
├── Timeframe: M1-M15
├── Holding Time: Beberapa menit hingga satu jam
├── Target: Profit cepat dari pergerakan kecil (10-30 pips)
└── Kondisi: Volatilitas tinggi di dalam Killzone.

INTRADAY:
├── Timeframe: M15-H4
├── Holding Time: Beberapa jam dalam satu sesi trading
├── Target: Menangkap pergerakan utama harian (30-100+ pips)
└── Kondisi: Bias arah yang jelas untuk hari itu.

SWING TRADING:
├── Timeframe: H4-W1
├── Holding Time: Beberapa hari hingga minggu
├── Target: Menangkap pergerakan tren yang lebih besar (100-500+ pips)
└── Kondisi: Struktur pasar HTF yang kuat dan selaras.
\`\`\`

---

## 🔍 2. PROSES ANALISIS & ENTRY MODEL

### 2.1 Alur Analisis Multi-Layer
AI akan mengikuti alur hierarkis ini untuk setiap keputusan:
1.  **Analisis Kontekstual:** Intermarket (DXY, US10Y), Fundamental (Berita), dan Sentimen Institusional (COT).
2.  **Analisis Teknikal Inti (MTA):** Pemilihan mode Multi-Timeframe berdasarkan gaya trading.
3.  **Konfluens & Presisi:** Penggunaan alat Fibonacci dan model setup (SMC/ICT) untuk validasi.
4.  **Perumusan Rencana:** Kalkulasi risiko dan pembuatan perintah final.

### 2.2 Mode Analisis Multi-Timeframe (MTA)
AI akan memilih salah satu mode berikut berdasarkan gaya trading yang paling sesuai.

\`\`\`
MODE 1: SWING / INTRADAY
├── H4 (Bias Arah): Menentukan tren dan struktur pasar jangka menengah.
├── H1 (Zona POI): Mengidentifikasi zona Support/Resistance, OB, atau FVG presisi.
└── M5 (Model Entri): Mencari konfirmasi pembalikan (CHOCH, Liquidity Sweep) untuk entri.

MODE 2: SCALPING
├── H1 (Bias Arah): Menentukan tren dan struktur pasar jangka pendek.
├── M15 (Zona POI): Mengidentifikasi zona OB atau FVG yang baru terbentuk.
└── M5 (Model Entri): Mencari konfirmasi dan eksekusi cepat di dalam POI M15.
\`\`\`

### 2.3 Setup Models & Fibonacci
AI akan mengidentifikasi dan menyatakan model setup yang digunakan, mencari konfluens dengan Fibonacci.

\`\`\`
ORDER BLOCK (OB):
├── Bullish OB: Lilin turun terakhir sebelum pergerakan naik yang kuat (BOS).
├── Bearish OB: Lilin naik terakhir sebelum pergerakan turun yang kuat (BOS).
└── AI Action: Mencari entri saat harga kembali ke OB.

FAIR VALUE GAP (FVG) / IMBALANCE:
├── Bullish FVG: Celah harga ke atas yang menandakan pembelian agresif.
├── Bearish FVG: Celah harga ke bawah yang menandakan penjualan agresif.
└── AI Action: Mencari entri saat harga memitigasi (mengisi sebagian) FVG.

BREAKER BLOCK (BB):
├── Bullish BB: Order block bearish yang gagal dan ditembus ke atas, kini menjadi support.
├── Bearish BB: Order block bullish yang gagal dan ditembus ke bawah, kini menjadi resistance.
└── AI Action: Menggunakan Breaker Block sebagai zona entri presisi.

LIQUIDITY SWEEP (LS) / STOP HUNT:
├── Definisi: Harga secara singkat menembus level high/low sebelumnya untuk mengambil likuiditas, lalu berbalik arah dengan cepat.
└── AI Action: Masuk setelah konfirmasi pembalikan pasca-sweep.

FIBONACCI RETRACEMENT & EXTENSION:
├── Retracement: Digunakan untuk mengukur kedalaman koreksi harga. Entri sering dicari di "Golden Zone" (level 0.618 - 0.786).
├── Extension: Digunakan untuk memproyeksikan target profit potensial yang logis (level -0.272, -0.618).
└── AI Action: Mencari POI yang bertepatan dengan level Fibonacci kunci untuk konfluens.
\`\`\`

### 2.4 Entry Types: Market vs Limit
\`\`\`
MARKET EXECUTION (Entry Now):
├── Kapan Digunakan: Momentum tinggi, konfirmasi breakout yang baru saja terjadi, atau setelah Liquidity Sweep yang agresif.
├── Logika: Masuk segera pada harga pasar untuk menangkap pergerakan cepat.
└── Kelemahan: Potensi slippage dan harga entri yang kurang optimal.

LIMIT ORDER (Entry Limit):
├── Kapan Digunakan: Menargetkan POI (OB, FVG, BB) presisi yang belum dimitigasi.
├── Logika: Menempatkan order beli (buy limit) di bawah harga atau order jual (sell limit) di atas harga.
└── Kelemahan: Order mungkin tidak terisi jika harga tidak kembali ke level POI.
\`\`\`

---

## ⚖️ 3. MANAJEMEN RISIKO & PARAMETER

### 3.1 Parameter Per Sinyal
\`\`\`
RISK-REWARD RATIO (RRR):
├── Minimum: 1:2
├── Target: 1:3 atau lebih tinggi
└── Kalkulasi: (Take Profit - Entry) / (Entry - Stop Loss)

CONFIDENCE SCORE:
├── Basis: Jumlah konfluens (keselarasan) dari berbagai faktor (struktur, POI, waktu, dll.).
├── Skala: 0% - 100%
└── Tujuan: Memberikan transparansi pada keyakinan AI terhadap setup.
\`\`\`

### 3.2 Aturan Risiko Utama
- **Risk Per Trade:** Dinamis antara 0.5% - 2% dari modal.
- **Stop Loss:** Selalu ditempatkan sebelum entri.
- **Korelasi:** Menghindari eksposur berlebihan pada pasangan mata uang yang berkorelasi tinggi secara bersamaan.

---

## 🤖 4. FORMAT FINAL COMMAND

Setiap sinyal yang dihasilkan akan dirangkum dalam format ketat berikut untuk kejelasan maksimum:

**EXECUTE: [BUY/SELL] [PAIR] | TYPE: [MARKET/LIMIT] | STYLE: [TRADING_STYLE] | SETUP: [SETUP_MODEL] | ENTRY: [HARGA] | SL: [HARGA] | TP: [HARGA] | RRR: [RASIO] | CONFIDENCE: [PERSENTASE]**

Contoh:
EXECUTE: BUY EURUSD | TYPE: LIMIT | STYLE: INTRADAY | SETUP: H4 Bullish OB + Fibo 0.618 | ENTRY: 1.08500 | SL: 1.08200 | TP: 1.09400 | RRR: 1:3 | CONFIDENCE: 85%

---

## 💡 5. PANDUAN PRAKTIS & CHECKLIST

Bagian ini merinci langkah-langkah praktis, checklist, dan alur kerja untuk setiap mode trading yang digunakan oleh AI.

### 📌 Mode 1: Swing / Intraday
**Timeframe:** H4 → H1 → M5

**Langkah-langkah:**
- **H4 – Bias:**
  - Lihat struktur pasar terakhir (tren naik/turun).
  - Tandai swing high & swing low yang signifikan.
  - Tentukan arah utama (bullish/bearish).
- **H1 – POI:**
  - Cari zona yang selaras dengan bias: Order Block (OB), Fair Value Gap (FVG), Breaker Block (BB), atau kombinasi.
  - Pastikan zona tersebut masih 'fresh' (belum di-retest).
- **M5 – Entry:**
  - Tunggu harga memasuki Zona POI.
  - Cari pemicu entri: liquidity sweep, candle reversal (mis. engulfing), atau rejection wick yang kuat.
  - Tempatkan SL di luar POI, dengan target TP minimal 1:2.

**Kelebihan:**
- Sinyal cenderung lebih akurat.
- Potensi Risk-Reward Ratio (RRR) besar (1:3 hingga 1:5).
- Cocok untuk target harian atau dua harian.

**Kekurangan:**
- Frekuensi setup bisa lebih jarang.
- Membutuhkan kesabaran untuk menunggu setup ideal.

---

### ⚡ Mode 2: Scalping
**Timeframe:** H1 → M15 → M5

**Langkah-langkah:**
- **H1 – Bias:**
  - Lihat arah tren untuk sesi trading saat ini (misal: London/NY).
  - Gunakan swing high/low terakhir sebagai acuan arah.
- **M15 – POI:**
  - Cari OB atau FVG yang selaras dengan bias.
  - Zona bisa lebih kecil dan tidak harus sempurna.
- **M5 – Entry:**
  - Lakukan entri cepat setelah ada pemicu kecil (misal: minor sweep, engulfing candle).
  - Gunakan SL yang ketat, dengan target TP 1:1.5 hingga 1:2.

**Kelebihan:**
- Frekuensi entri lebih sering (bisa 2-5 kali per sesi).
- Potensi profit cepat dari pergerakan kecil.

**Kekurangan:**
- 'Noise' pasar lebih tinggi, meningkatkan risiko sinyal palsu.
- Risiko overtrade lebih besar.

---

### ✅ Checklist & Flowchart Eksekusi

#### Checklist Mode 1: Swing / Intraday (H4 → H1 → M5)
**1. H4 – Bias:**
  - Tandai swing high & low terakhir.
  - Tentukan arah: bullish (HH & HL) / bearish (LH & LL).
  - Catat area discount/premium.
**2. H1 – POI:**
  - Cari OB / FVG / BB sesuai bias.
  - Pastikan zona 'fresh' (belum di-retest).
  - Pasang alert di harga masuk zona.
**3. M5 – Entry:**
  - Tunggu harga masuk POI H1.
  - Tunggu trigger: liquidity sweep / rejection wick / engulfing.
  - Entry, SL di luar zona, TP minimal 1:2–1:3.

\`\`\`text
FLOWCHART MODE 1 (SWING/INTRADAY)
H4 → Apakah trend jelas? → YA → Cari POI H1 searah → Tunggu harga masuk → Entry M5 saat trigger → SL & TP → Selesai
\`\`\`

#### Checklist Mode 2: Scalping (H1 → M15 → M5)
**1. H1 – Bias:**
  - Lihat tren untuk sesi berjalan (London/NY).
  - Tentukan bullish/bearish dari swing terakhir.
**2. M15 – POI:**
  - Cari OB / FVG segaris bias.
  - Zona boleh kecil.
  - Pasang alert di zona.
**3. M5 – Entry:**
  - Tunggu harga sentuh POI M15.
  - Tunggu trigger cepat (minor sweep / engulfing).
  - Entry, SL tipis, TP 1:1.5 – 1:2.

\`\`\`text
FLOWCHART MODE 2 (SCALPING)
H1 → Tentukan trend sesi → Cari POI M15 searah → Tunggu harga masuk → Entry M5 trigger cepat → SL & TP → Exit
\`\`\`

---
**© 2025 Dhaher Terminal**
**Version 3.0 - Autonomous Agent & Clarity Upgrade**
`;

const renderLine = (line: string, index: number) => {
  if (line.trim().startsWith('# ')) {
    return <h1 key={index} className="text-3xl font-bold text-[var(--color-text)] mb-2">{line.substring(2)}</h1>;
  }
  if (line.trim().startsWith('## ')) {
    return <h2 key={index} className="text-2xl font-bold text-sky-500 mt-8 mb-4 pb-2 border-b border-[var(--color-border)]">{line.substring(3)}</h2>;
  }
  if (line.trim().startsWith('### ')) {
    return <h3 key={index} className="text-xl font-semibold text-sky-600 dark:text-sky-400 mt-6 mb-3">{line.substring(4)}</h3>;
  }
  if (line.trim() === '---') {
    return <hr key={index} className="border-t border-[var(--color-border)] my-8" />;
  }
  if (line.trim().startsWith('**©')) {
    return <p key={index} className="text-center mt-8 text-sm text-[var(--color-text-tertiary)] font-semibold">{line.replace(/\*\*/g, '')}</p>
  }
  if (line.trim().startsWith('**')) {
     return <p key={index} className="text-sm text-[var(--color-text-secondary)] font-semibold">{line.replace(/\*\*/g, '')}</p>
  }
   if (line.trim().startsWith('*"')) {
    return <p key={index} className="text-center italic text-[var(--color-text-secondary)] mt-4 text-sm">{line.replace(/\*/g, '')}</p>
  }

  const parts = line.split(/(\*\*.*?\*\*)/g);
  const formattedLine = parts.map((part, partIndex) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={partIndex} className="font-bold text-[var(--color-text)]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });

  if(line.trim().startsWith('☐') || line.trim().startsWith('├──') || line.trim().startsWith('└──')) {
      return <p key={index} className="font-mono text-[var(--color-text-secondary)] my-0.5 whitespace-pre">{formattedLine}</p>
  }

  return <p key={index} className="my-2 leading-relaxed text-[var(--color-text-secondary)]">{formattedLine}</p>;
};

const SpecificationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

  const renderedContent = useMemo(() => {
    if (!isOpen) return null;

    const lines = TRADING_PLAN_CONTENT.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    lines.forEach((line, index) => {
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                elements.push(
                    <div key={`code-block-${index}`} className="relative bg-black/30 dark:bg-black/30 rounded-lg my-4 font-mono text-sm text-cyan-600 dark:text-cyan-300">
                        {codeBlockLang && <span className="absolute top-2 right-3 text-xs text-gray-500">{codeBlockLang}</span>}
                        <pre className="p-4 overflow-x-auto whitespace-pre">{codeBlockContent.join('\n')}</pre>
                    </div>
                );
                codeBlockContent = [];
                inCodeBlock = false;
                codeBlockLang = '';
            } else {
                // Start of code block
                inCodeBlock = true;
                codeBlockLang = line.trim().substring(3);
            }
        } else if (inCodeBlock) {
            codeBlockContent.push(line);
        } else {
            if(line.trim() === '') {
                elements.push(<div key={index} className="h-2"></div>);
            } else {
                elements.push(renderLine(line, index));
            }
        }
    });

    return elements;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="bg-[var(--color-bg)]/70 backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text)] tracking-wide flex items-center gap-3">
            <span role="img" aria-label="tools">⚙️</span>
            TRADING PLAN ULTIMATE 3.0
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--color-text-secondary)] transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto text-[var(--color-text-secondary)] text-sm">
            {renderedContent}
        </main>
      </div>
       <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default SpecificationModal;