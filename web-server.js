import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/crypto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currency = 'usd' } = req.query;
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `API error: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    
    if (!data[id]) {
      return res.status(404).json({ 
        error: `Cryptocurrency '${id}' not found` 
      });
    }
    
    const price = data[id][currency];
    res.json({
      id,
      currency: currency.toUpperCase(),
      price,
      formatted: `${id}: ${price} ${currency.toUpperCase()}`
    });
  } catch (error) {
    res.status(500).json({ 
      error: `Error fetching price: ${error.message}` 
    });
  }
});

app.get('/api/top-cryptos', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `API error: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: "No cryptocurrency data available" 
      });
    }
    
    const cryptoList = data.map(crypto => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toUpperCase(),
      price: crypto.current_price,
      market_cap: crypto.market_cap,
      price_change_24h: crypto.price_change_percentage_24h,
      formatted: `${crypto.name} (${crypto.symbol.toUpperCase()}): $${crypto.current_price}`
    }));
    
    res.json({
      cryptos: cryptoList,
      count: cryptoList.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: `Error fetching top cryptocurrencies: ${error.message}` 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    server: 'CryptoPrice MCP Web Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CryptoPrice MCP Web Server running at http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/crypto/:id?currency=usd`);
  console.log(`   GET /api/top-cryptos?limit=10`);
  console.log(`   GET /api/health`);
});