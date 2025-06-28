/**
 * Enhanced Chain of Draft API Route
 * Integrates the exact CoD methodology from HTML into Next.js API
 */

import { NextRequest, NextResponse } from "next/server";
import { CoreMessage } from "ai";
import {
  sendEnhancedCoDMessage,
  sendEnhancedCoDMessageStream,
  formatEnhancedCoDResponse,
} from "@/lib/reasoning/cod-api-handler";
import {
  analyzeEnhancedComplexity,
  DEFAULT_COD_CONFIG,
} from "@/lib/reasoning/chain-of-draft";

interface CoDRequestBody {
  message: string;
  conversationHistory?: CoreMessage[];
  enableStreaming?: boolean;
  codConfig?: {
    reasoningMethod?: "standard" | "enhanced_cod";
    codWordLimit?: number;
    reasoningEnhancement?: "fixed" | "adaptive";
    reflectionSettings?: {
      enableSelfVerification?: boolean;
      enableErrorDetection?: boolean;
      enableAlternativeSearch?: boolean;
      enableConfidenceAssessment?: boolean;
      verificationDepth?: "basic" | "standard" | "deep" | "research";
    };
  };
  fireworksConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CoDRequestBody = await request.json();
    const {
      message,
      conversationHistory = [],
      enableStreaming = false,
      codConfig = {},
      fireworksConfig = {},
    } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Merge with defaults
    const config = {
      ...DEFAULT_COD_CONFIG,
      ...codConfig,
      reflectionSettings: {
        ...DEFAULT_COD_CONFIG.reflectionSettings,
        ...codConfig.reflectionSettings,
      },
    };

    const fireworksSettings = {
      temperature: 0.3,
      topP: 0.9,
      topK: 40,
      maxTokens: 8192,
      enableStreaming: false,
      model: "deepseek-v3-0324" as const,
      enableVision: false,
      enableFileSystem: true,
      enableSound: false,
      ...fireworksConfig,
    };

    // Analyze complexity for adaptive settings
    const complexity = analyzeEnhancedComplexity(message);

    console.log(
      `🧠 Processing CoD request with complexity: ${complexity.level} (score: ${complexity.score})`,
    );

    if (enableStreaming) {
      // Return streaming response
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await sendEnhancedCoDMessageStream(
              message,
              conversationHistory,
              config,
              { ...fireworksSettings, enableStreaming: true },
              // Stage 1 complete callback
              (stage1) => {
                const data = JSON.stringify({
                  type: "stage1_complete",
                  data: {
                    stage1Html: formatStage1Content(stage1),
                    complexity: stage1.complexity,
                    wordLimit: stage1.wordLimit,
                  },
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              },
              // Stage 2 update callback
              (chunk) => {
                const data = JSON.stringify({
                  type: "stage2_chunk",
                  data: { chunk },
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              },
            );

            // Send final result
            const formatted = formatEnhancedCoDResponse(result);
            const finalData = JSON.stringify({
              type: "complete",
              data: {
                ...formatted,
                complexity: complexity,
                totalTime: result.totalTime,
              },
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            controller.close();
          } catch (error) {
            const errorData = JSON.stringify({
              type: "error",
              data: {
                error: error instanceof Error ? error.message : "Unknown error",
              },
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const startTime = Date.now();

      const result = await sendEnhancedCoDMessage(
        message,
        conversationHistory,
        config,
        { ...fireworksSettings, enableStreaming: false },
      );

      const formatted = formatEnhancedCoDResponse(result);
      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: {
          ...formatted,
          complexity: complexity,
          processingTime,
          adaptiveSettings: result.settings,
          stage1: {
            content: result.stage1.content,
            wordLimit: result.stage1.wordLimit,
            timestamp: result.stage1.timestamp,
          },
          stage2: {
            content: result.stage2?.content,
            timestamp: result.stage2?.timestamp,
          },
        },
      });
    }
  } catch (error) {
    console.error("❌ CoD API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function for formatting stage 1 content (matching HTML version)
function formatStage1Content(stage1: any): string {
  let html = '<div class="cod-stage-1 border-l-4 border-blue-500 pl-4 mb-6">';
  html += '<div class="flex items-center gap-2 mb-3">';
  html +=
    '<span class="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">STAGE 1</span>';
  html +=
    '<span class="text-blue-300 font-medium">Problem Analysis & Chain of Draft</span>';
  html += `<span class="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded-full ml-auto">${stage1.wordLimit} words/step</span>`;
  html += "</div>";

  const sections = stage1.content.split("####");

  // Problem Analysis
  if (sections[1]) {
    html +=
      '<div class="problem-analysis bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-blue-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>📊</span><span>Problem Analysis</span>";
    html += "</div>";
    html +=
      '<div class="text-blue-100 text-sm prose prose-invert max-w-none">' +
      formatContent(sections[1].replace("PROBLEM ANALYSIS", "").trim()) +
      "</div>";
    html += "</div>";
  }

  // CoD Steps
  if (sections[2]) {
    html +=
      '<div class="cod-steps bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-purple-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🔗</span><span>Chain of Draft Steps</span>";
    html += "</div>";
    html +=
      '<div class="text-purple-100 text-sm prose prose-invert max-w-none">' +
      formatContent(sections[2].replace("CHAIN OF DRAFT STEPS", "").trim()) +
      "</div>";
    html += "</div>";
  }

  // Initial Reflection
  if (sections[3]) {
    html +=
      '<div class="initial-reflection bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-yellow-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🤔</span><span>Initial Reflection</span>";
    html += "</div>";
    html +=
      '<div class="text-yellow-100 text-sm prose prose-invert max-w-none">' +
      formatContent(sections[3].replace("INITIAL REFLECTION", "").trim()) +
      "</div>";
    html += "</div>";
  }

  // Draft Solution
  if (sections[4]) {
    html +=
      '<div class="draft-solution bg-green-900/20 border border-green-500/30 rounded-lg p-4">';
    html +=
      '<div class="text-green-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>📝</span><span>Draft Solution</span>";
    html += "</div>";
    html +=
      '<div class="text-green-100 text-sm prose prose-invert max-w-none">' +
      formatContent(sections[4].replace("DRAFT SOLUTION", "").trim()) +
      "</div>";
    html += "</div>";
  }

  html += "</div>";
  return html;
}

function formatContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>',
    )
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-800 p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>',
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
