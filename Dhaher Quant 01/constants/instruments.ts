
import { Instrument } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // Forex Majors
  { id: 'EURUSD', name: 'EUR/USD', category: 'major' },
  { id: 'GBPUSD', name: 'GBP/USD', category: 'major' },
  { id: 'USDJPY', name: 'USD/JPY', category: 'major' },
  { id: 'AUDUSD', name: 'AUD/USD', category: 'major' },
  { id: 'USDCAD', name: 'USD/CAD', category: 'major' },
  { id: 'USDCHF', name: 'USD/CHF', category: 'major' },
  
  // Forex Minors & Crosses
  { id: 'EURJPY', name: 'EUR/JPY', category: 'minor' },
  { id: 'GBPJPY', name: 'GBP/JPY', category: 'minor' },
  { id: 'AUDJPY', name: 'AUD/JPY', category: 'minor' },
  { id: 'EURGBP', name: 'EUR/GBP', category: 'minor' },
  { id: 'EURAUD', name: 'EUR/AUD', category: 'minor' },
  { id: 'GBPAUD', name: 'GBP/AUD', category: 'minor' },
  { id: 'NZDUSD', name: 'NZD/USD', category: 'minor' },

  // Global Indices
  { id: 'US500', name: 'S&P 500', category: 'index' },
  { id: 'NAS100', name: 'Nasdaq 100', category: 'index' },
  { id: 'DJI', name: 'Dow Jones 30', category: 'index' },
  { id: 'GER40', name: 'DAX 40', category: 'index' },
  { id: 'UK100', name: 'FTSE 100', category: 'index' },
  { id: 'JP225', name: 'Nikkei 225', category: 'index' },

  // Commodities
  { id: 'XAUUSD', name: 'Gold Spot', category: 'commodity' },
  { id: 'XAGUSD', name: 'Silver Spot', category: 'commodity' },
  { id: 'WTI', name: 'WTI Oil', category: 'commodity' },
  { id: 'BRENT', name: 'Brent Oil', category: 'commodity' },
  { id: 'NATGAS', name: 'Natural Gas', category: 'commodity' },

  // Global Equities
  { id: 'AAPL', name: 'Apple Inc.', category: 'stock' },
  { id: 'NVDA', name: 'NVIDIA Corp.', category: 'stock' },
  { id: 'TSLA', name: 'Tesla Inc.', category: 'stock' },
  { id: 'MSFT', name: 'Microsoft', category: 'stock' },
  { id: 'GOOGL', name: 'Alphabet', category: 'stock' },
  { id: 'AMZN', name: 'Amazon', category: 'stock' },

  // Leading Crypto
  { id: 'BTCUSD', name: 'Bitcoin', category: 'crypto' },
  { id: 'ETHUSD', name: 'Ethereum', category: 'crypto' },
  { id: 'SOLUSD', name: 'Solana', category: 'crypto' },
  { id: 'BNBUSD', name: 'BNB', category: 'crypto' },
  { id: 'XRPUSD', name: 'Ripple', category: 'crypto' },
  { id: 'LINKUSD', name: 'Chainlink', category: 'crypto' },
];
