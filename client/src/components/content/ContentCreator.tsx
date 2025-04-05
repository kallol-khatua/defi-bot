import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Twitter, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ContentCreator = () => {
  const [prompt, setPrompt] = useState({ content: "", type: "", tone: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    // Validate form input
    if (!prompt.content || !prompt.type) {
      toast({
        title: "Missing information",
        description:
          "Please provide both a topic and select a content type.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set loading state
      setIsGenerating(true);
      
      // Make API call to backend
      const response = await fetch("http://localhost:8000/generate-content/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: prompt.content,
          format: prompt.type
        })
      });
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Parse response data
      const data = await response.json();
      
      // Extract the content from the gemini field
      if (data && data.gemini) {
        setGeneratedContent(data.gemini);
        toast({
          title: "Content generated!",
          description: "Your AI-powered content is ready to review and publish.",
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error generating content",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  const renderIcon = () => {
    switch (prompt.type) {
      case "twitter":
        return <Twitter className="h-5 w-5 text-[#1DA1F2]" />;
      case "blog":
        return <FileText className="h-5 w-5 text-brand-purple" />;
      case "telegram":
        return <MessageSquare className="h-5 w-5 text-[#0088cc]" />;
      default:
        return <Twitter className="h-5 w-5 text-[#1DA1F2]" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Posts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Content Type
                    </label>
                    
                    <Select value={prompt.type} onValueChange={(value) => setPrompt({ ...prompt, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter Thread</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="telegram">
                          Telegram Update
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Content Tone
                    </label>
                    <Select 
                      value={prompt.tone === "" ? undefined : prompt.tone}
                      onValueChange={(value) => setPrompt({ ...prompt, tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informative">Informative</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                        <SelectItem value="enthusiastic">
                          Enthusiastic
                        </SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What should the AI write about?
                  </label>
                  <Textarea
                    placeholder="E.g., Write about the rising TVL in DeFi protocols and what it means for investors..."
                    value={prompt.content}
                    onChange={(e) =>
                      setPrompt({ ...prompt, content: e.target.value })
                    }
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.content || !prompt.type}
                  className="w-full bg-brand-purple hover:bg-brand-purple/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Content"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {renderIcon()}
                    <h3 className="font-medium">
                      Generated{" "}
                      {prompt.type.charAt(0).toUpperCase() +
                        prompt.type.slice(1)}{" "}
                      Content
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="bg-brand-purple hover:bg-brand-purple/90"
                    >
                      Publish Now
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 whitespace-pre-wrap font-mono text-sm">
                  {generatedContent}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent
          value="schedule"
          className="min-h-[300px] flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <p className="mb-2">Scheduling feature coming soon</p>
            <p className="text-sm">
              Automatically schedule your AI-generated content across platforms
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="analytics"
          className="min-h-[300px] flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <p className="mb-2">Content analytics coming soon</p>
            <p className="text-sm">
              Track performance of your AI-generated content
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentCreator;