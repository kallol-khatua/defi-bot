import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const TrendingTokens = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState("ETH");
  const { toast } = useToast();

  // Mock volume and price change data as they're not included in the API response
  const tokenMetadata = {
    "Lido Staked Ether": { symbol: "stETH", change: "+5.2%", positive: true, volume: "$14.5B", icon: "🔷" },
    "Chainlink": { symbol: "LINK", change: "+8.7%", positive: true, volume: "$5.2B", icon: "⛓️" },
    "Wrapped stETH": { symbol: "wstETH", change: "+4.8%", positive: true, volume: "$3.7B", icon: "🔷" },
    "Hyperliquid": { symbol: "HLQ", change: "+12.3%", positive: true, volume: "$2.1B", icon: "💧" },
    "Uniswap": { symbol: "UNI", change: "+3.5%", positive: true, volume: "$4.2B", icon: "🦄" },
    "Dai": { symbol: "DAI", change: "+0.1%", positive: true, volume: "$1.8B", icon: "⚖️" },
    "Ondo": { symbol: "ONDO", change: "-2.1%", positive: false, volume: "$567M", icon: "🔹" },
    "Ethereum Classic": { symbol: "ETC", change: "-3.5%", positive: false, volume: "$982M", icon: "🔷" },
    "Aave": { symbol: "AAVE", change: "+6.2%", positive: true, volume: "$1.2B", icon: "👻" },
    "Ethena": { symbol: "ENA", change: "+9.7%", positive: true, volume: "$458M", icon: "🏛️" }
  };

  // Function to fetch market insights
  const fetchMarketInsights = async (token = "ETH") => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/market-insights?token=${token}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error("Error fetching market insights:", error);
      toast({
        title: "Error fetching market data",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      // Load fallback data if API fails
      setMarketData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data in case API fails
  const getFallbackData = () => {
    return {
      timestamp: new Date().toISOString(),
      price: {
        token: "ETH",
        price: 1819.89
      },
      defi_trends: {
        top_defi_tokens: [
          "Lido Staked Ether",
          "Chainlink",
          "Wrapped stETH",
          "Hyperliquid",
          "Uniswap",
          "Dai",
          "Ondo",
          "Ethereum Classic",
          "Aave",
          "Ethena"
        ]
      }
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMarketInsights(selectedToken);
  }, [selectedToken]);

  // Function to refresh data
  const handleRefresh = () => {
    fetchMarketInsights(selectedToken);
  };

  // Function to change selected token
  const handleTokenChange = (token) => {
    setSelectedToken(token);
  };

  // Get the top 5 tokens to display
  const getDisplayTokens = () => {
    if (!marketData || !marketData.defi_trends || !marketData.defi_trends.top_defi_tokens) {
      return [];
    }
    
    return marketData.defi_trends.top_defi_tokens.slice(0, 5).map((token, index) => {
      const metadata = tokenMetadata[token] || {
        symbol: token.substring(0, 4).toUpperCase(),
        change: (Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)).toFixed(1) + "%",
        positive: Math.random() > 0.5,
        volume: "$" + (Math.random() * 10).toFixed(1) + "B",
        icon: "🔹"
      };
      
      return {
        id: index + 1,
        name: token,
        ...metadata
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Trending Tokens</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? <Loader size={16} className="animate-spin" /> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path>
                  <path d="M21 22v-6h-6"></path>
                </svg>
              }
            </button>
            <button className="text-sm text-brand-purple hover:underline">View all</button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marketData && (
          <div className="mb-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Current {marketData.price.token} Price:</span>
              <span className="font-medium ml-2">${marketData.price.price.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500">
              Updated: {new Date(marketData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 px-1 text-gray-500 font-medium text-sm">Asset</th>
                <th className="pb-3 px-1 text-gray-500 font-medium text-sm">Price</th>
                <th className="pb-3 px-1 text-gray-500 font-medium text-sm">Change (24h)</th>
                <th className="pb-3 px-1 text-gray-500 font-medium text-sm">Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {loading && !marketData ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    <Loader size={24} className="mx-auto mb-2 animate-spin" />
                    <p>Loading market data...</p>
                  </td>
                </tr>
              ) : (
                getDisplayTokens().map((token) => (
                  <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-1">
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex-shrink-0 mr-3 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <span className="text-xl">{token.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-gray-500">{token.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-1 font-medium">
                      {token.name === "Lido Staked Ether" && marketData?.price?.token === "ETH" 
                        ? `$${marketData.price.price.toLocaleString()}`
                        : `$${(Math.random() * 100 + 10).toFixed(2)}`}
                    </td>
                    <td className="py-4 px-1">
                      <div
                        className={`flex items-center ${
                          token.positive ? "text-brand-green" : "text-brand-red"
                        }`}
                      >
                        {token.positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span className="ml-1">{token.change}</span>
                      </div>
                    </td>
                    <td className="py-4 px-1 text-gray-600 dark:text-gray-400">
                      {token.volume}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTokens;