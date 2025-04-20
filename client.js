import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // Create a transport to connect to the server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"]
  });

  // Create a client
  const client = new Client({
    name: "crypto-price-client",
    version: "1.0.0"
  });

  // Connect to the server
  await client.connect(transport);
  
  try {
    console.log("Connected to CryptoPrice MCP server\n");

    // Call the getCryptoPrice tool for Bitcoin
    console.log("Fetching Bitcoin price:");
    const bitcoinPrice = await client.callTool({
      name: "getCryptoPrice",
      arguments: {
        id: "bitcoin",
        currency: "usd"
      }
    });
    console.log(bitcoinPrice.content[0].text);
    console.log();

    // Call the getCryptoPrice tool for Ethereum in EUR
    console.log("Fetching Ethereum price in EUR:");
    const ethPrice = await client.callTool({
      name: "getCryptoPrice",
      arguments: {
        id: "ethereum",
        currency: "eur"
      }
    });
    console.log(ethPrice.content[0].text);
    console.log();

    // Call the listTopCryptos tool
    console.log("Fetching top 5 cryptocurrencies:");
    const topCryptos = await client.callTool({
      name: "listTopCryptos",
      arguments: {
        limit: 5
      }
    });
    console.log(topCryptos.content[0].text);
    
    console.log("\nAll operations completed successfully");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch(console.error); 