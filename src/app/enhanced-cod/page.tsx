/**
 * Enhanced Chain of Draft Page - Integrating HTML reasoning with Next.js
 * Bridges your existing HTML CoD system with the Fireworks-powered chatbot
 */

import { Metadata } from "next";
import EnhancedCoDChat from "@/components/enhanced-cod-chat";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  Target,
  Search,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  FileText,
  Eye,
  Settings,
  Code,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enhanced Chain of Draft Studio - DeepSeek V3 via Fireworks",
  description:
    "Advanced reasoning with two-stage Chain of Draft methodology powered by DeepSeek V3 and Fireworks AI",
};

export default function EnhancedCoDPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Brain className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold">
                Enhanced Chain of Draft Studio
              </h1>
              <Zap className="w-12 h-12 text-orange-400" />
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced reasoning system with two-stage Chain of Draft
              methodology, powered by DeepSeek V3 and Fireworks AI
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className="bg-blue-900/30 border-blue-500"
              >
                <Brain className="w-3 h-3 mr-1" />
                DeepSeek V3-0324
              </Badge>
              <Badge
                variant="outline"
                className="bg-orange-900/30 border-orange-500"
              >
                <Zap className="w-3 h-3 mr-1" />
                Fireworks AI
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-900/30 border-purple-500"
              >
                <Target className="w-3 h-3 mr-1" />
                Two-Stage CoD
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-900/30 border-green-500"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Adaptive Complexity
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Chain of Draft Methodology
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stage 1 */}
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Brain className="w-5 h-5" />
                  Stage 1: Analysis & Draft
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Problem complexity analysis with structured Chain of Draft
                  steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Problem complexity detection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Structured CoD steps (5-15 words/step)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span>Initial reflection & draft solution</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Adaptive word limits based on complexity</span>
                </div>
              </CardContent>
            </Card>

            {/* Stage 2 */}
            <Card className="bg-red-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-300">
                  <Search className="w-5 h-5" />
                  Stage 2: Verification & Answer
                </CardTitle>
                <CardDescription className="text-red-100">
                  Deep verification with comprehensive final answer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-red-400" />
                  <span>Critical analysis of Stage 1 reasoning</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-red-400" />
                  <span>Error detection & correction</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-red-400" />
                  <span>Alternative approach analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Code className="w-4 h-4 text-red-400" />
                  <span>100% complete code solutions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Complexity Levels */}
      <div className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-bold text-center mb-6">
            Adaptive Complexity Detection
          </h3>
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-green-900/20 border-green-500/30 text-center">
              <CardContent className="p-4">
                <Badge className="bg-green-600 mb-2">Simple</Badge>
                <p className="text-xs text-green-200">5 words/step</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/20 border-blue-500/30 text-center">
              <CardContent className="p-4">
                <Badge className="bg-blue-600 mb-2">Moderate</Badge>
                <p className="text-xs text-blue-200">5 words/step</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-900/20 border-yellow-500/30 text-center">
              <CardContent className="p-4">
                <Badge className="bg-yellow-600 mb-2">Complex</Badge>
                <p className="text-xs text-yellow-200">8 words/step</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-900/20 border-orange-500/30 text-center">
              <CardContent className="p-4">
                <Badge className="bg-orange-600 mb-2">Highly Complex</Badge>
                <p className="text-xs text-orange-200">12 words/step</p>
              </CardContent>
            </Card>
            <Card className="bg-red-900/20 border-red-500/30 text-center">
              <CardContent className="p-4">
                <Badge className="bg-red-600 mb-2">Research Grade</Badge>
                <p className="text-xs text-red-200">15 words/step</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-6 bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/fireworks-reasoning">
              <Button
                variant="outline"
                className="bg-orange-900/30 border-orange-500 hover:bg-orange-900/50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Fireworks Reasoning Page
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="outline"
                className="bg-blue-900/30 border-blue-500 hover:bg-blue-900/50"
              >
                <Brain className="w-4 h-4 mr-2" />
                Standard Chat
              </Button>
            </Link>
            <Button variant="outline" className="bg-gray-700 border-gray-500">
              <FileText className="w-4 h-4 mr-2" />
              View HTML Original
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1">
        <EnhancedCoDChat />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 py-4 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-400">
            <p>
              Enhanced Chain of Draft Studio - Exact port from HTML version with
              DeepSeek V3 via Fireworks AI
            </p>
            <p className="mt-1">
              Features: Two-stage reasoning • Adaptive complexity • Streaming
              responses • 100% solution guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
