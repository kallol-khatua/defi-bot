import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Newspaper, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NewsSummary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categories = ["all", "DeFi", "NFT", "Layer 1", "Layer 2", "Regulation"];
  
  // Mock news data as fallback
  const mockNews = [
    {
      id: 1,
      title: "Ethereum Layer 2 Solutions See Surge in Activity as Gas Fees Spike",
      source: "CoinDesk",
      time: "2 hours ago",
      summary: "Ethereum Layer 2 solutions Arbitrum and Optimism have seen a significant increase in total value locked (TVL) and user activity as Ethereum gas fees have risen to an average of 25-30 Gwei. This migration comes as users seek more cost-effective alternatives for DeFi activities.",
      url: "#",
      topics: ["Ethereum", "Layer 2", "Gas Fees"]
    },
    {
      id: 2,
      title: "Major Protocol Unveils New Governance Framework to Increase Decentralization",
      source: "The Block",
      time: "5 hours ago",
      summary: "A leading DeFi protocol has introduced a revamped governance structure aimed at increasing decentralization and community participation. The changes include a new voting mechanism, delegation features, and on-chain execution of approved proposals.",
      url: "#",
      topics: ["Governance", "DAO", "Decentralization"]
    },
    {
      id: 3,
      title: "Regulators Signal Openness to DeFi Innovation While Emphasizing Consumer Protection",
      source: "Bloomberg",
      time: "12 hours ago",
      summary: "Financial regulators from several major economies have issued a joint statement acknowledging the innovative potential of decentralized finance while emphasizing the need for consumer protection measures. The statement suggests a possible path forward for regulatory clarity in the DeFi space.",
      url: "#",
      topics: ["Regulation", "Policy", "Compliance"]
    },
    {
      id: 4,
      title: "New Cross-Chain Bridge Protocol Addresses Security Concerns with Novel Approach",
      source: "DeFi Pulse",
      time: "1 day ago",
      summary: "A new cross-chain bridge protocol has launched with an innovative security architecture designed to address vulnerabilities that have led to exploits in other bridges. The solution uses a combination of trusted execution environments, multi-signature schemes, and automated security monitoring.",
      url: "#",
      topics: ["Security", "Cross-Chain", "Bridges"]
    }
  ];

  // Function to fetch news data from API
  const fetchNewsData = async (source = "coindesk") => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/summarize-news?source=${source}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news data");
      }
      const data = await response.json();
      
      // Process API data and map to required format
      const processedData = processApiData(data);
      setNewsData(processedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Using fallback data.");
      setNewsData(mockNews); // Use mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  // Process API data and handle missing data with fallbacks
  const processApiData = (apiData) => {
    const { source, headlines = [], summaries = [] } = apiData;
    
    // Generate processed news items from API data
    return headlines.map((headline, index) => {
      // Check if summary is available or shows the quota exceeded message
      const summary = summaries[index] && !summaries[index].includes("API quota exceeded") 
        ? summaries[index] 
        : "This article discusses important developments in the cryptocurrency and blockchain space with potential impact on market dynamics and regulatory landscape.";
      
      // Generate random topics based on headline content
      const topics = generateTopicsFromHeadline(headline);
      
      return {
        id: index + 1,
        title: headline,
        source: source || "CoinDesk",
        time: generateRandomTime(),
        summary: summary,
        url: "#",
        topics: topics
      };
    });
  };

  // Helper function to generate random topics based on headline
  const generateTopicsFromHeadline = (headline) => {
    const allTopics = ["Ethereum", "Bitcoin", "Layer 2", "DeFi", "Regulation", "NFT", "Security", "DAO", "Stablecoin", "Governance"];
    const possibleTopics = [];
    
    // Check for keywords in headline and add relevant topics
    if (headline.toLowerCase().includes("ethereum") || headline.toLowerCase().includes("eth")) {
      possibleTopics.push("Ethereum");
    }
    if (headline.toLowerCase().includes("bitcoin") || headline.toLowerCase().includes("btc")) {
      possibleTopics.push("Bitcoin");
    }
    if (headline.toLowerCase().includes("layer 2") || headline.toLowerCase().includes("l2") || headline.toLowerCase().includes("scaling")) {
      possibleTopics.push("Layer 2");
    }
    if (headline.toLowerCase().includes("defi") || headline.toLowerCase().includes("finance")) {
      possibleTopics.push("DeFi");
    }
    if (headline.toLowerCase().includes("regulation") || headline.toLowerCase().includes("sec") || headline.toLowerCase().includes("regulatory")) {
      possibleTopics.push("Regulation");
    }
    if (headline.toLowerCase().includes("nft") || headline.toLowerCase().includes("token")) {
      possibleTopics.push("NFT");
    }
    if (headline.toLowerCase().includes("security") || headline.toLowerCase().includes("hack")) {
      possibleTopics.push("Security");
    }
    
    // If no specific topics found, add random ones
    if (possibleTopics.length === 0) {
      // Shuffle and take 2-3 random topics
      const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
      possibleTopics.push(...shuffled.slice(0, 2 + Math.floor(Math.random() * 2)));
    }
    
    return possibleTopics;
  };

  // Generate random time for articles
  const generateRandomTime = () => {
    const times = ["1 hour ago", "2 hours ago", "5 hours ago", "12 hours ago", "1 day ago"];
    return times[Math.floor(Math.random() * times.length)];
  };

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchNewsData();
  }, []);

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category !== "all" && category.toLowerCase() === "coindesk") {
      fetchNewsData("coindesk");
    }
  };

  // Filter news based on search query and active category
  const filteredNews = newsData.filter(news => {
    const matchesSearch = searchQuery === "" || 
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || 
      news.topics.some(topic => topic.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for news..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className={activeCategory === category ? "bg-brand-purple hover:bg-brand-purple/90" : ""}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading news...</div>
      ) : (
        <div className="space-y-4">
          {filteredNews.length > 0 ? (
            filteredNews.map(news => (
              <Card key={news.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Newspaper className="h-4 w-4" />
                        <span>{news.source}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{news.time}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium">{news.title}</h3>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {news.summary}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {news.topics.map(topic => (
                        <Badge key={topic} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                    
                    <a 
                      href={news.url} 
                      className="text-sm font-medium text-brand-purple hover:text-brand-purple/90 flex items-center gap-1"
                    >
                      Read full article
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">No news articles found matching your criteria.</div>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={() => fetchNewsData()} variant="outline" size="sm">
          Refresh News
        </Button>
      </div>
    </div>
  );
};

export default NewsSummary;