/**
 * Enhanced Chain of Draft Chat Component
 * Integrates the exact CoD methodology from HTML into React
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Send,
  Brain,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  Target,
  FileText,
  Eye,
  Zap,
} from "lucide-react";
import { CoreMessage } from "ai";

interface CoDComplexity {
  level: string;
  score: number;
  recommendedWordLimit: number;
  recommendedVerification: string;
}

interface CoDConfig {
  reasoningMethod: "standard" | "enhanced_cod";
  codWordLimit: number;
  reasoningEnhancement: "fixed" | "adaptive";
  reflectionSettings: {
    enableSelfVerification: boolean;
    enableErrorDetection: boolean;
    enableAlternativeSearch: boolean;
    enableConfidenceAssessment: boolean;
    verificationDepth: "basic" | "standard" | "deep" | "research";
  };
}

interface CoDMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codResult?: {
    stage1Html: string;
    stage2Html: string;
    complexity: CoDComplexity;
    processingTime: number;
    adaptiveSettings: any;
  };
}

export default function EnhancedCoDChat() {
  const [messages, setMessages] = useState<CoDMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    "idle" | "stage1" | "stage2"
  >("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [enableStreaming, setEnableStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [codConfig, setCoDConfig] = useState<CoDConfig>({
    reasoningMethod: "enhanced_cod",
    codWordLimit: 5,
    reasoningEnhancement: "fixed",
    reflectionSettings: {
      enableSelfVerification: true,
      enableErrorDetection: true,
      enableAlternativeSearch: true,
      enableConfidenceAssessment: true,
      verificationDepth: "standard",
    },
  });

  const [fireworksConfig, setFireworksConfig] = useState({
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxTokens: 8192,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: CoDMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory: CoreMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      if (enableStreaming) {
        await handleStreamingResponse(input, conversationHistory);
      } else {
        await handleNonStreamingResponse(input, conversationHistory);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: CoDMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStage("idle");
    }
  };

  const handleStreamingResponse = async (
    message: string,
    conversationHistory: CoreMessage[],
  ) => {
    const response = await fetch("/api/cod", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        enableStreaming: true,
        codConfig,
        fireworksConfig,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const assistantMessage: CoDMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      codResult: {
        stage1Html: "",
        stage2Html: "",
        complexity: {
          level: "",
          score: 0,
          recommendedWordLimit: 0,
          recommendedVerification: "",
        },
        processingTime: 0,
        adaptiveSettings: {},
      },
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case "stage1_complete":
                  setCurrentStage("stage1");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            codResult: {
                              ...msg.codResult!,
                              stage1Html: data.data.stage1Html,
                              complexity: data.data.complexity,
                            },
                          }
                        : msg,
                    ),
                  );
                  break;

                case "stage2_chunk":
                  setCurrentStage("stage2");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: msg.content + data.data.chunk,
                          }
                        : msg,
                    ),
                  );
                  break;

                case "complete":
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            codResult: {
                              ...msg.codResult!,
                              stage2Html: data.data.stage2Html,
                              processingTime: data.data.totalTime,
                            },
                          }
                        : msg,
                    ),
                  );
                  break;

                case "error":
                  throw new Error(data.data.error);
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleNonStreamingResponse = async (
    message: string,
    conversationHistory: CoreMessage[],
  ) => {
    setCurrentStage("stage1");

    const response = await fetch("/api/cod", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        enableStreaming: false,
        codConfig,
        fireworksConfig,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    setCurrentStage("stage2");

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    const assistantMessage: CoDMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: result.data.stage2.content,
      timestamp: new Date(),
      codResult: {
        stage1Html: result.data.stage1Html,
        stage2Html: result.data.stage2Html,
        complexity: result.data.complexity,
        processingTime: result.data.processingTime,
        adaptiveSettings: result.data.adaptiveSettings,
      },
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "research_grade":
        return "bg-red-600";
      case "highly_complex":
        return "bg-orange-600";
      case "complex":
        return "bg-yellow-600";
      case "moderate":
        return "bg-blue-600";
      case "simple":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStageIcon = (stage: "idle" | "stage1" | "stage2") => {
    switch (stage) {
      case "stage1":
        return <Brain className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "stage2":
        return <Search className="w-4 h-4 text-red-400 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Settings Sidebar */}
      {showSettings && (
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                🧠 Chain of Draft Settings
              </h3>

              {/* Reasoning Method */}
              <div className="space-y-2">
                <Label>Reasoning Method</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      codConfig.reasoningMethod === "enhanced_cod"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setCoDConfig((prev) => ({
                        ...prev,
                        reasoningMethod: "enhanced_cod",
                      }))
                    }
                  >
                    Enhanced CoD
                  </Badge>
                  <Badge
                    variant={
                      codConfig.reasoningMethod === "standard"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setCoDConfig((prev) => ({
                        ...prev,
                        reasoningMethod: "standard",
                      }))
                    }
                  >
                    Standard
                  </Badge>
                </div>
              </div>

              {/* Word Limit */}
              <div className="space-y-2">
                <Label>CoD Word Limit: {codConfig.codWordLimit}</Label>
                <Slider
                  value={[codConfig.codWordLimit]}
                  onValueChange={([value]) =>
                    setCoDConfig((prev) => ({ ...prev, codWordLimit: value }))
                  }
                  min={5}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Reasoning Enhancement */}
              <div className="space-y-2">
                <Label>Complexity Analysis</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      codConfig.reasoningEnhancement === "adaptive"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setCoDConfig((prev) => ({
                        ...prev,
                        reasoningEnhancement: "adaptive",
                      }))
                    }
                  >
                    Adaptive
                  </Badge>
                  <Badge
                    variant={
                      codConfig.reasoningEnhancement === "fixed"
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setCoDConfig((prev) => ({
                        ...prev,
                        reasoningEnhancement: "fixed",
                      }))
                    }
                  >
                    Fixed
                  </Badge>
                </div>
              </div>

              {/* Reflection Settings */}
              <div className="space-y-3">
                <Label>Reflection Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Self Verification</span>
                    <Switch
                      checked={
                        codConfig.reflectionSettings.enableSelfVerification
                      }
                      onCheckedChange={(checked) =>
                        setCoDConfig((prev) => ({
                          ...prev,
                          reflectionSettings: {
                            ...prev.reflectionSettings,
                            enableSelfVerification: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Detection</span>
                    <Switch
                      checked={
                        codConfig.reflectionSettings.enableErrorDetection
                      }
                      onCheckedChange={(checked) =>
                        setCoDConfig((prev) => ({
                          ...prev,
                          reflectionSettings: {
                            ...prev.reflectionSettings,
                            enableErrorDetection: checked,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alternative Search</span>
                    <Switch
                      checked={
                        codConfig.reflectionSettings.enableAlternativeSearch
                      }
                      onCheckedChange={(checked) =>
                        setCoDConfig((prev) => ({
                          ...prev,
                          reflectionSettings: {
                            ...prev.reflectionSettings,
                            enableAlternativeSearch: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fireworks Configuration */}
            <div className="space-y-3">
              <Label>🔥 Fireworks Settings</Label>

              <div className="space-y-2">
                <Label>Temperature: {fireworksConfig.temperature}</Label>
                <Slider
                  value={[fireworksConfig.temperature]}
                  onValueChange={([value]) =>
                    setFireworksConfig((prev) => ({
                      ...prev,
                      temperature: value,
                    }))
                  }
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Tokens: {fireworksConfig.maxTokens}</Label>
                <Slider
                  value={[fireworksConfig.maxTokens]}
                  onValueChange={([value]) =>
                    setFireworksConfig((prev) => ({
                      ...prev,
                      maxTokens: value,
                    }))
                  }
                  min={1000}
                  max={16000}
                  step={1000}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Streaming</span>
                <Switch
                  checked={enableStreaming}
                  onCheckedChange={setEnableStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-lg font-semibold">
                Enhanced Chain of Draft Studio
              </h1>
              <p className="text-sm text-gray-400">
                DeepSeek V3 via Fireworks AI
              </p>
            </div>
            {getStageIcon(currentStage)}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-4xl ${message.role === "user" ? "bg-blue-900/30" : "bg-gray-800"}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {message.role === "user" ? (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                          U
                        </div>
                      ) : (
                        <Brain className="w-6 h-6 text-purple-400" />
                      )}
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "DeepSeek V3"}
                      </span>
                    </div>

                    {message.codResult && (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getComplexityColor(
                            message.codResult.complexity.level,
                          )}
                        >
                          {message.codResult.complexity.level}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {message.codResult.processingTime}ms
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {message.role === "user" ? (
                    <p className="text-gray-100">{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Stage 1 Results */}
                      {message.codResult?.stage1Html && (
                        <div
                          className="cod-results prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: message.codResult.stage1Html,
                          }}
                        />
                      )}

                      {/* Stage 2 Results */}
                      {message.codResult?.stage2Html && (
                        <div
                          className="cod-results prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: message.codResult.stage2Html,
                          }}
                        />
                      )}

                      {/* Streaming content */}
                      {message.content && !message.codResult?.stage2Html && (
                        <div className="text-gray-100 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-gray-300">
                      {currentStage === "stage1"
                        ? "Analyzing problem & generating CoD steps..."
                        : currentStage === "stage2"
                          ? "Performing deep verification..."
                          : "Processing..."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything for enhanced Chain of Draft reasoning..."
                className="min-h-[60px] resize-none bg-gray-800 border-gray-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
