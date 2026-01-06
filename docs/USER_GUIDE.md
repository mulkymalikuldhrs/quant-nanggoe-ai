# 📖 USER GUIDE: QUANT NANGGROE AI

Welcome to **Quant Nanggroe AI**, your professional workspace for quantitative market research and decision intelligence.

---

## 🚦 GETTING STARTED

### 1. API Configuration
To use the full power of the AI agents, you need to provide API keys for data providers and AI models:
- Go to **Settings** (Gear icon).
- Enter your keys for:
  - **Gemini AI** (Core reasoning)
  - **Finnhub / AlphaVantage / Polygon** (Market data)
- These keys are stored **locally** on your device and are never sent to our servers.

### 2. Monitoring the Market
The main dashboard shows the **Market Regime**. 
- **GREEN**: Safe to research and execute.
- **RED/GREY**: Market is unstable or closed. The system will block execution to protect you.

---

## 🧠 WORKING WITH AGENTS

You don't talk to these agents like a regular chatbot. They work for you in the background:
- **QuantScanner**: Watches technical indicators.
- **SMCAgent**: Finds "Smart Money" levels.
- **NewsSentinel**: Reads the latest news and gives a "Sentiment Score".
- **FlowAgent**: Monitors where the big money (Whales) is moving.

You can see their individual "Pressure" scores in the **Intelligence Panel**.

---

## 🛡️ SAFETY & RISK

The system has a built-in **Constitution** that you cannot override:
- **Daily Stop Loss**: If you lose too much in one day, the system locks itself.
- **Asset Correlation**: You cannot open two trades on assets that move too similarly (e.g., BTC and ETH) to avoid double risk.
- **Reality Check**: Every signal includes a "Slippage" estimate. If the price is moving too fast, the entry will be canceled.

---

## 💾 MANAGING YOUR DATA

Your research is your property.
- All data is stored in your **Browser's Database (IndexedDB)**.
- To move your data to another computer:
  1. Go to **Control Center**.
  2. Click **Export Backup**. A `.json` file will download.
  3. On the other computer, click **Import Backup** and select that file.

---

© 2026 Quant Nanggroe AI | User Guide v15.2.0
