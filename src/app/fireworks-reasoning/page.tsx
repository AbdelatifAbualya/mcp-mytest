"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Brain,
  Zap,
  Settings,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface FireworksReasoningConfig {
  enabled: boolean;
  reasoningMethod: "standard" | "enhanced_cod";
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  customSystemPrompt?: string;
  dualStageVerification: boolean;
  autoOptimizeForTools: boolean;
}

const FIREWORKS_MODELS = [
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    supportsReasoning: true,
    category: "reasoning",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    supportsReasoning: false,
    category: "general",
  },
  {
    id: "llama-3.1-405b",
    name: "Llama 3.1 405B",
    supportsReasoning: false,
    category: "large",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    supportsReasoning: false,
    category: "balanced",
  },
  {
    id: "firefunction-v1",
    name: "FireFunction V1",
    supportsReasoning: false,
    category: "tools",
  },
  {
    id: "qwen2.5-coder-32b",
    name: "Qwen2.5 Coder 32B",
    supportsReasoning: false,
    category: "coding",
  },
];

export default function FireworksReasoningSettings() {
  const [config, setConfig] = useState<FireworksReasoningConfig>({
    enabled: true,
    reasoningMethod: "enhanced_cod",
    selectedModel: "deepseek-r1",
    temperature: 0.7,
    maxTokens: 4000,
    dualStageVerification: true,
    autoOptimizeForTools: true,
  });

  const selectedModelInfo = FIREWORKS_MODELS.find(
    (m) => m.id === config.selectedModel,
  );

  const handleConfigChange = (
    key: keyof FireworksReasoningConfig,
    value: any,
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfiguration = () => {
    // Save to localStorage or API
    localStorage.setItem("fireworks-reasoning-config", JSON.stringify(config));
    console.log("Fireworks Reasoning Configuration Saved:", config);
  };

  useEffect(() => {
    // Load saved configuration
    const saved = localStorage.getItem("fireworks-reasoning-config");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold">Fireworks AI Reasoning Studio</h1>
          <p className="text-muted-foreground">
            Configure enhanced reasoning with Fireworks AI models and Chain of
            Draft methodology
          </p>
        </div>
      </div>

      <Tabs defaultValue="reasoning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reasoning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Reasoning
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reasoning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Reasoning Method Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reasoning-enabled">
                    Enable Enhanced Reasoning
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Activate Fireworks AI reasoning capabilities with Chain of
                    Draft methodology
                  </p>
                </div>
                <Switch
                  id="reasoning-enabled"
                  checked={config.enabled}
                  onCheckedChange={(value) =>
                    handleConfigChange("enabled", value)
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Reasoning Approach</Label>
                <div className="grid gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.reasoningMethod === "standard"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() =>
                      handleConfigChange("reasoningMethod", "standard")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={config.reasoningMethod === "standard"}
                        onChange={() =>
                          handleConfigChange("reasoningMethod", "standard")
                        }
                        aria-label="Standard reasoning method"
                      />
                      <div>
                        <h4 className="font-medium">Standard Reasoning</h4>
                        <p className="text-sm text-muted-foreground">
                          Direct model responses without Chain of Draft
                          methodology
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.reasoningMethod === "enhanced_cod"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() =>
                      handleConfigChange("reasoningMethod", "enhanced_cod")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={config.reasoningMethod === "enhanced_cod"}
                        onChange={() =>
                          handleConfigChange("reasoningMethod", "enhanced_cod")
                        }
                        aria-label="Enhanced Chain of Draft reasoning method"
                      />
                      <div>
                        <h4 className="font-medium">Enhanced Chain of Draft</h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced CoD with two-stage API calls: Draft +
                          Reflection → Final Verification & Answer
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Recommended
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {config.reasoningMethod === "enhanced_cod" && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">
                        Enhanced Chain of Draft Process
                      </span>
                    </div>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>Initial draft response with reasoning</li>
                      <li>Critical reflection and analysis</li>
                      <li>Verification and final answer generation</li>
                    </ol>
                  </div>

                  {/* Enhanced CoD Studio Link */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-700 dark:text-purple-300">
                            Enhanced Chain of Draft Studio
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            Full Experience
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Experience the complete Chain of Draft methodology
                          with real-time two-stage reasoning, adaptive
                          complexity detection, and streaming responses.
                        </p>
                      </div>
                      <Link href="/enhanced-cod">
                        <Button className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white">
                          <Brain className="h-4 w-4 mr-2" />
                          Launch Studio
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Select Fireworks Model</Label>
                <Select
                  value={config.selectedModel}
                  onValueChange={(value) =>
                    handleConfigChange("selectedModel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a Fireworks model" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIREWORKS_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          {model.supportsReasoning && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              Reasoning
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {model.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedModelInfo && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Category:</strong> {selectedModelInfo.category} |
                      <strong> Reasoning Support:</strong>{" "}
                      {selectedModelInfo.supportsReasoning ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) =>
                      handleConfigChange(
                        "temperature",
                        parseFloat(e.target.value),
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness (0.0 - 2.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="8000"
                    value={config.maxTokens}
                    onChange={(e) =>
                      handleConfigChange("maxTokens", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum response length
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dual-Stage Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable two-stage reasoning: Draft+Reflection → Verification
                  </p>
                </div>
                <Switch
                  checked={config.dualStageVerification}
                  onCheckedChange={(value) =>
                    handleConfigChange("dualStageVerification", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Optimize for Tools</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize settings when using MCP tools
                  </p>
                </div>
                <Switch
                  checked={config.autoOptimizeForTools}
                  onCheckedChange={(value) =>
                    handleConfigChange("autoOptimizeForTools", value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom System Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Custom System Prompt</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Enter custom system prompt for enhanced reasoning..."
                  value={config.customSystemPrompt || ""}
                  onChange={(e) =>
                    handleConfigChange("customSystemPrompt", e.target.value)
                  }
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Override default reasoning prompts with your custom
                  instructions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setConfig((prev) => ({ ...prev }))}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={saveConfiguration}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
