
import { Instrument } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // Forex Majors
  { id: 'EURUSD', name: 'EUR/USD', category: 'major' },
  { id: 'GBPUSD', name: 'GBP/USD', category: 'major' },
  { id: 'USDJPY', name: 'USD/JPY', category: 'major' },
  { id: 'AUDUSD', name: 'AUD/USD', category: 'major' },
  { id: 'USDCAD', name: 'USD/CAD', category: 'major' },
  { id: 'USDCHF', name: 'USD/CHF', category: 'major' },
  { id: 'NZDUSD', name: 'NZD/USD', category: 'major' },
  
  // Forex Minors & Crosses
  { id: 'EURJPY', name: 'EUR/JPY', category: 'minor' },
  { id: 'GBPJPY', name: 'GBP/JPY', category: 'minor' },
  { id: 'AUDJPY', name: 'AUD/JPY', category: 'minor' },
  { id: 'EURGBP', name: 'EUR/GBP', category: 'minor' },
  { id: 'EURAUD', name: 'EUR/AUD', category: 'minor' },
  { id: 'GBPAUD', name: 'GBP/AUD', category: 'minor' },
  { id: 'EURCAD', name: 'EUR/CAD', category: 'minor' },
  { id: 'GBPCAD', name: 'GBP/CAD', category: 'minor' },
  { id: 'AUDCAD', name: 'AUD/CAD', category: 'minor' },
  { id: 'EURNZD', name: 'EUR/NZD', category: 'minor' },
  { id: 'GBPNZD', name: 'GBP/NZD', category: 'minor' },
  { id: 'AUDNZD', name: 'AUD/NZD', category: 'minor' },

  // Forex Exotics
  { id: 'USDMXN', name: 'USD/MXN', category: 'exotic' },
  { id: 'USDZAR', name: 'USD/ZAR', category: 'exotic' },
  { id: 'USDTRY', name: 'USD/TRY', category: 'exotic' },
  { id: 'USDSGD', name: 'USD/SGD', category: 'exotic' },
  { id: 'USDHKD', name: 'USD/HKD', category: 'exotic' },

  // Global Indices
  { id: 'US500', name: 'S&P 500', category: 'index' },
  { id: 'NAS100', name: 'Nasdaq 100', category: 'index' },
  { id: 'DJI', name: 'Dow Jones 30', category: 'index' },
  { id: 'GER40', name: 'DAX 40', category: 'index' },
  { id: 'UK100', name: 'FTSE 100', category: 'index' },
  { id: 'JP225', name: 'Nikkei 225', category: 'index' },
  { id: 'FRA40', name: 'CAC 40', category: 'index' },
  { id: 'HK50', name: 'Hang Seng', category: 'index' },

  // Commodities
  { id: 'XAUUSD', name: 'Gold Spot', category: 'commodity' },
  { id: 'XAGUSD', name: 'Silver Spot', category: 'commodity' },
  { id: 'WTI', name: 'WTI Oil', category: 'commodity' },
  { id: 'BRENT', name: 'Brent Oil', category: 'commodity' },
  { id: 'NATGAS', name: 'Natural Gas', category: 'commodity' },
  { id: 'COPPER', name: 'Copper', category: 'commodity' },
  { id: 'PLATINUM', name: 'Platinum', category: 'commodity' },

  // Global Equities
  { id: 'AAPL', name: 'Apple Inc.', category: 'stock' },
  { id: 'NVDA', name: 'NVIDIA Corp.', category: 'stock' },
  { id: 'TSLA', name: 'Tesla Inc.', category: 'stock' },
  { id: 'MSFT', name: 'Microsoft', category: 'stock' },
  { id: 'GOOGL', name: 'Alphabet', category: 'stock' },
  { id: 'AMZN', name: 'Amazon', category: 'stock' },
  { id: 'META', name: 'Meta Platforms', category: 'stock' },
  { id: 'BRK.B', name: 'Berkshire Hathaway', category: 'stock' },
  { id: 'UNH', name: 'UnitedHealth', category: 'stock' },
  { id: 'JNJ', name: 'Johnson & Johnson', category: 'stock' },

  // Crypto
  { id: 'BTCUSD', name: 'Bitcoin', category: 'crypto' },
  { id: 'ETHUSD', name: 'Ethereum', category: 'crypto' },
  { id: 'SOLUSD', name: 'Solana', category: 'crypto' },
  { id: 'BNBUSD', name: 'BNB', category: 'crypto' },
  { id: 'XRPUSD', name: 'Ripple', category: 'crypto' },
  { id: 'ADAUSD', name: 'Cardano', category: 'crypto' },
  { id: 'AVAXUSD', name: 'Avalanche', category: 'crypto' },
  { id: 'DOTUSD', name: 'Polkadot', category: 'crypto' },
  { id: 'LINKUSD', name: 'Chainlink', category: 'crypto' },
  { id: 'MATICUSD', name: 'Polygon', category: 'crypto' },

];
