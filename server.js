import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Create an MCP server
const server = new McpServer({
  name: "CryptoPrice",
  version: "1.0.0"
});

// Add a tool to get crypto price
server.tool("getCryptoPrice",
  { 
    id: z.string().describe("Cryptocurrency ID (e.g., bitcoin, ethereum)"),
    currency: z.string().default("usd").describe("Currency to display the price in (e.g., usd, eur)")
  },
  async ({ id, currency }) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`);
      
      if (!response.ok) {
        return {
          content: [{ type: "text", text: `API error: ${response.status} ${response.statusText}` }]
        };
      }
      
      const data = await response.json();
      
      if (!data[id]) {
        return {
          content: [{ type: "text", text: `Cryptocurrency '${id}' not found.` }]
        };
      }
      
      const price = data[id][currency];
      return {
        content: [{ type: "text", text: `${id}: ${price} ${currency.toUpperCase()}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching price: ${error.message}` }]
      };
    }
  }
);

// Add a tool to list top cryptocurrencies
server.tool("listTopCryptos",
  { 
    limit: z.number().default(10).describe("Number of top cryptocurrencies to return")
  },
  async ({ limit }) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`);
      
      if (!response.ok) {
        return {
          content: [{ type: "text", text: `API error: ${response.status} ${response.statusText}` }]
        };
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return {
          content: [{ type: "text", text: "No cryptocurrency data available." }]
        };
      }
      
      const cryptoList = data.map(crypto => `${crypto.name} (${crypto.symbol}): $${crypto.current_price}`).join('\n');
      return {
        content: [{ type: "text", text: cryptoList }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching top cryptocurrencies: ${error.message}` }]
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
console.log("Starting CryptoPrice MCP server...");
await server.connect(transport);
console.log("CryptoPrice MCP server running");