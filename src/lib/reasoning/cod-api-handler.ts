/**
 * Two-Stage Chain of Draft API Handler for Fireworks
 * Implements the exact same two-stage API methodology as the HTML version
 * Enhanced with vision, file system, and sound capabilities
 */

import { fireworks } from "@ai-sdk/fireworks";
import { generateText, streamText, CoreMessage } from "ai";
import {
  ENHANCED_PROMPTS,
  analyzeEnhancedComplexity,
  getAdaptiveEnhancedSettings,
  CoDConfig,
  CoDStageResult,
  CoDSessionResult,
  DEFAULT_COD_CONFIG,
} from "./chain-of-draft";
import { MediaInput } from "./media-processor";

// Fireworks model configurations with capabilities
const FIREWORKS_MODELS = {
  "deepseek-v3-0324": {
    path: "accounts/fireworks/models/deepseek-v3-0324",
    supportsVision: false,
    supportsTools: true,
    contextLength: 64000,
  },
  "deepseek-v3": {
    path: "accounts/fireworks/models/deepseek-v3",
    supportsVision: false,
    supportsTools: true,
    contextLength: 64000,
  },
  "qwen2p5-vl-32b-instruct": {
    path: "accounts/fireworks/models/qwen2p5-vl-32b-instruct",
    supportsVision: true,
    supportsTools: true,
    contextLength: 32768,
  },
  "firellava-13b": {
    path: "accounts/fireworks/models/firellava-13b",
    supportsVision: true,
    supportsTools: false,
    contextLength: 4096,
  },
  "llava-v1.5-7b-fireworks": {
    path: "accounts/fireworks/models/llava-v1.5-7b-fireworks",
    supportsVision: true,
    supportsTools: false,
    contextLength: 4096,
  },
  "firefunction-v2": {
    path: "accounts/fireworks/models/firefunction-v2",
    supportsVision: false,
    supportsTools: true,
    contextLength: 8192,
  },
} as const;

interface EnhancedFireworksConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  enableStreaming: boolean;
  model: keyof typeof FIREWORKS_MODELS;
  enableVision?: boolean;
  enableFileSystem?: boolean;
  enableSound?: boolean;
}

/**
 * Enhanced Chain of Draft Message Handler
 * Exact port from the HTML sendEnhancedCoDMessage function
 * Enhanced with vision, file system, and sound capabilities
 */
export async function sendEnhancedCoDMessage(
  message: string,
  conversationHistory: CoreMessage[] = [],
  config: CoDConfig = DEFAULT_COD_CONFIG,
  fireworksConfig: EnhancedFireworksConfig = {
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxTokens: 8192,
    enableStreaming: false,
    model: "deepseek-v3-0324",
    enableVision: false,
    enableFileSystem: true,
    enableSound: false,
  },
  mediaInputs: MediaInput[] = [],
): Promise<CoDSessionResult> {
  const startTime = performance.now();

  // Process media inputs if provided
  let processedMediaContext = "";
  if (mediaInputs.length > 0) {
    console.log(`📁 Processing ${mediaInputs.length} media input(s)...`);

    const { processImageInput, processAudioInput, processFileInput } =
      await import("./media-processor");

    for (const mediaInput of mediaInputs) {
      try {
        let processed;
        switch (mediaInput.type) {
          case "image":
            processed = await processImageInput(mediaInput);
            break;
          case "audio":
            processed = await processAudioInput(mediaInput);
            break;
          case "file":
            processed = await processFileInput(mediaInput);
            break;
          default:
            continue;
        }

        processedMediaContext += `\n\n[${processed.metadata.type.toUpperCase()}] ${processed.description}\n`;
        if (processed.analysis) {
          processedMediaContext += `Analysis: ${processed.analysis}\n`;
        }
        if (processed.extractedText) {
          processedMediaContext += `Content: ${processed.extractedText}\n`;
        }
      } catch (error) {
        console.error(`Failed to process ${mediaInput.type}:`, error);
        processedMediaContext += `\n\n[${mediaInput.type.toUpperCase()}] ${mediaInput.filename || "untitled"} - Processing failed\n`;
      }
    }
  }

  // Get adaptive settings if enabled
  const adaptiveSettings = getAdaptiveEnhancedSettings(message, config);

  // Combine original message with media context
  const enhancedMessage = processedMediaContext
    ? `${message}\n\n--- MEDIA CONTEXT ---${processedMediaContext}`
    : message;

  try {
    // Stage 1: Analysis + Initial CoD
    console.log("🧠 Starting Stage 1: Problem Analysis & Chain of Draft...");

    const stage1Result = await executeStage1Analysis(
      enhancedMessage,
      conversationHistory,
      adaptiveSettings.wordLimit,
      fireworksConfig,
    );

    console.log("✅ Stage 1 completed, starting Stage 2: Deep Verification...");

    // Stage 2: Deep Verification + Final Answer
    const stage2Result = await executeStage2Verification(
      enhancedMessage,
      stage1Result.content,
      conversationHistory,
      fireworksConfig,
    );

    const totalTime = performance.now() - startTime;

    console.log(`🎯 Chain of Draft completed in ${totalTime.toFixed(2)}ms`);

    return {
      stage1: stage1Result,
      stage2: stage2Result,
      totalTime,
      settings: adaptiveSettings,
    };
  } catch (error) {
    console.error("❌ Error in Chain of Draft processing:", error);
    throw new Error(
      `Chain of Draft failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Stage 1: Problem Analysis + Chain of Draft Steps
 * Exact implementation from HTML callDeepSeekAPI for stage 1
 */
async function executeStage1Analysis(
  userMessage: string,
  conversationHistory: CoreMessage[],
  wordLimit: number,
  fireworksConfig: EnhancedFireworksConfig,
): Promise<CoDStageResult> {
  const stage1Prompt = ENHANCED_PROMPTS.stage1_analysis_cod(wordLimit);
  const selectedModel = FIREWORKS_MODELS[fireworksConfig.model];

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: stage1Prompt,
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  // Use the correct Fireworks model path
  const result = await generateText({
    model: fireworks(selectedModel.path),
    messages,
    temperature: fireworksConfig.temperature,
    topP: fireworksConfig.topP,
    topK: fireworksConfig.topK,
    maxTokens: fireworksConfig.maxTokens,
  });

  return {
    stage: 1,
    content: result.text,
    wordLimit,
    complexity: analyzeEnhancedComplexity(userMessage),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Stage 2: Deep Verification + Final Answer
 * Exact implementation from HTML callDeepSeekAPI for stage 2
 */
async function executeStage2Verification(
  originalMessage: string,
  stage1Content: string,
  conversationHistory: CoreMessage[],
  fireworksConfig: EnhancedFireworksConfig,
): Promise<CoDStageResult> {
  const stage2Prompt = ENHANCED_PROMPTS.stage2_verification();
  const selectedModel = FIREWORKS_MODELS[fireworksConfig.model];

  // Build stage 2 messages with stage 1 results as context
  const messages: CoreMessage[] = [
    {
      role: "system",
      content: stage2Prompt,
    },
    ...conversationHistory,
    {
      role: "user",
      content: originalMessage,
    },
    {
      role: "assistant",
      content: stage1Content,
    },
    {
      role: "user",
      content:
        "Now proceed with STAGE 2 verification of the above analysis and provide the final comprehensive answer.",
    },
  ];

  // Use the correct Fireworks model path
  const result = await generateText({
    model: fireworks(selectedModel.path),
    messages,
    temperature: fireworksConfig.temperature,
    topP: fireworksConfig.topP,
    topK: fireworksConfig.topK,
    maxTokens: fireworksConfig.maxTokens,
  });

  return {
    stage: 2,
    content: result.text,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Streaming version for real-time updates
 * Matches the HTML streaming implementation
 */
export async function sendEnhancedCoDMessageStream(
  message: string,
  conversationHistory: CoreMessage[] = [],
  config: CoDConfig = DEFAULT_COD_CONFIG,
  fireworksConfig: EnhancedFireworksConfig = {
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxTokens: 8192,
    enableStreaming: true,
    model: "deepseek-v3-0324",
    enableVision: false,
    enableFileSystem: true,
    enableSound: false,
  },
  mediaInputs: MediaInput[] = [],
  onStage1Complete?: (result: CoDStageResult) => void,
  onStage2Update?: (chunk: string) => void,
): Promise<CoDSessionResult> {
  // Process media inputs if provided
  let processedMediaContext = "";
  if (mediaInputs.length > 0) {
    console.log(
      `📁 Processing ${mediaInputs.length} media input(s) for streaming...`,
    );

    const { processImageInput, processAudioInput, processFileInput } =
      await import("./media-processor");

    for (const mediaInput of mediaInputs) {
      try {
        let processed;
        switch (mediaInput.type) {
          case "image":
            processed = await processImageInput(mediaInput);
            break;
          case "audio":
            processed = await processAudioInput(mediaInput);
            break;
          case "file":
            processed = await processFileInput(mediaInput);
            break;
          default:
            continue;
        }

        processedMediaContext += `\n\n[${processed.metadata.type.toUpperCase()}] ${processed.description}\n`;
        if (processed.analysis) {
          processedMediaContext += `Analysis: ${processed.analysis}\n`;
        }
        if (processed.extractedText) {
          processedMediaContext += `Content: ${processed.extractedText}\n`;
        }
      } catch (error) {
        console.error(`Failed to process ${mediaInput.type}:`, error);
        processedMediaContext += `\n\n[${mediaInput.type.toUpperCase()}] ${mediaInput.filename || "untitled"} - Processing failed\n`;
      }
    }
  }

  const adaptiveSettings = getAdaptiveEnhancedSettings(message, config);
  const selectedModel = FIREWORKS_MODELS[fireworksConfig.model];

  // Combine original message with media context
  const enhancedMessage = processedMediaContext
    ? `${message}\n\n--- MEDIA CONTEXT ---${processedMediaContext}`
    : message;

  // Stage 1: Non-streaming for complete analysis
  const stage1Result = await executeStage1Analysis(
    enhancedMessage,
    conversationHistory,
    adaptiveSettings.wordLimit,
    fireworksConfig,
  );

  onStage1Complete?.(stage1Result);

  // Stage 2: Streaming for real-time verification
  const stage2Prompt = ENHANCED_PROMPTS.stage2_verification();

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: stage2Prompt,
    },
    ...conversationHistory,
    {
      role: "user",
      content: enhancedMessage,
    },
    {
      role: "assistant",
      content: stage1Result.content,
    },
    {
      role: "user",
      content:
        "Now proceed with STAGE 2 verification of the above analysis and provide the final comprehensive answer.",
    },
  ];

  // Use correct Fireworks model path for streaming
  const { textStream } = await streamText({
    model: fireworks(selectedModel.path),
    messages,
    temperature: fireworksConfig.temperature,
    topP: fireworksConfig.topP,
    topK: fireworksConfig.topK,
    maxTokens: fireworksConfig.maxTokens,
  });

  let stage2Content = "";
  for await (const chunk of textStream) {
    stage2Content += chunk;
    onStage2Update?.(chunk);
  }

  const stage2Result: CoDStageResult = {
    stage: 2,
    content: stage2Content,
    timestamp: new Date().toISOString(),
  };

  return {
    stage1: stage1Result,
    stage2: stage2Result,
    settings: adaptiveSettings,
  };
}

/**
 * Format Enhanced CoD Response for UI
 * Matches the HTML formatting functions
 */
export function formatEnhancedCoDResponse(result: CoDSessionResult): {
  stage1Html: string;
  stage2Html: string;
  metadata: any;
} {
  return {
    stage1Html: formatStage1Content(result.stage1),
    stage2Html: formatStage2Content(result.stage2!),
    metadata: {
      totalTime: result.totalTime,
      wordLimit: result.stage1.wordLimit,
      complexity: result.stage1.complexity,
      settings: result.settings,
    },
  };
}

function formatStage1Content(stage1: CoDStageResult): string {
  let html = '<div class="cod-stage-1 border-l-4 border-blue-500 pl-4 mb-6">';
  html += '<div class="flex items-center gap-2 mb-3">';
  html +=
    '<span class="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">STAGE 1</span>';
  html +=
    '<span class="text-blue-300 font-medium">Problem Analysis & Chain of Draft</span>';
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
      '<div class="text-blue-100 text-sm">' +
      formatMarkdown(sections[1].replace("PROBLEM ANALYSIS", "").trim()) +
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
    html += `<span class="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full ml-auto">${stage1.wordLimit} words/step</span>`;
    html += "</div>";
    html +=
      '<div class="text-purple-100 text-sm">' +
      formatMarkdown(sections[2].replace("CHAIN OF DRAFT STEPS", "").trim()) +
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
      '<div class="text-yellow-100 text-sm">' +
      formatMarkdown(sections[3].replace("INITIAL REFLECTION", "").trim()) +
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
      '<div class="text-green-100 text-sm">' +
      formatMarkdown(sections[4].replace("DRAFT SOLUTION", "").trim()) +
      "</div>";
    html += "</div>";
  }

  html += "</div>";
  return html;
}

function formatStage2Content(stage2: CoDStageResult): string {
  let html = '<div class="cod-stage-2 border-l-4 border-red-500 pl-4 mb-6">';
  html += '<div class="flex items-center gap-2 mb-3">';
  html +=
    '<span class="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">STAGE 2</span>';
  html +=
    '<span class="text-red-300 font-medium">Deep Verification & Final Answer</span>';
  html += "</div>";

  const sections = stage2.content.split("####");

  // Stage 2 Verification
  if (sections[1]) {
    html +=
      '<div class="verification bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-red-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🔍</span><span>Deep Verification</span>";
    html += "</div>";
    html +=
      '<div class="text-red-100 text-sm">' +
      formatMarkdown(sections[1].replace("STAGE 2 VERIFICATION", "").trim()) +
      "</div>";
    html += "</div>";
  }

  // Error Detection
  if (sections[2]) {
    html +=
      '<div class="error-detection bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-orange-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🐛</span><span>Error Detection & Correction</span>";
    html += "</div>";
    html +=
      '<div class="text-orange-100 text-sm">' +
      formatMarkdown(
        sections[2].replace("ERROR DETECTION & CORRECTION", "").trim(),
      ) +
      "</div>";
    html += "</div>";
  }

  // Alternative Approaches
  if (sections[3]) {
    html +=
      '<div class="alternatives bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-indigo-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🔄</span><span>Alternative Approaches</span>";
    html += "</div>";
    html +=
      '<div class="text-indigo-100 text-sm">' +
      formatMarkdown(
        sections[3].replace("ALTERNATIVE APPROACH ANALYSIS", "").trim(),
      ) +
      "</div>";
    html += "</div>";
  }

  // Confidence Assessment
  if (sections[4]) {
    html +=
      '<div class="confidence bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-cyan-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>📊</span><span>Confidence Assessment</span>";
    html += "</div>";
    html +=
      '<div class="text-cyan-100 text-sm">' +
      formatMarkdown(sections[4].replace("CONFIDENCE ASSESSMENT", "").trim()) +
      "</div>";
    html += "</div>";
  }

  // Final Answer
  if (sections[5]) {
    html +=
      '<div class="final-answer bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-4">';
    html +=
      '<div class="text-emerald-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>✨</span><span>Final Comprehensive Answer</span>";
    html += "</div>";
    html +=
      '<div class="text-emerald-100 text-sm">' +
      formatMarkdown(
        sections[5].replace("FINAL COMPREHENSIVE ANSWER", "").trim(),
      ) +
      "</div>";
    html += "</div>";
  }

  // Reflection Summary
  if (sections[6]) {
    html +=
      '<div class="reflection-summary bg-violet-900/20 border border-violet-500/30 rounded-lg p-4">';
    html +=
      '<div class="text-violet-300 font-semibold mb-2 flex items-center gap-2">';
    html += "<span>🎯</span><span>Reflection Summary</span>";
    html += "</div>";
    html +=
      '<div class="text-violet-100 text-sm">' +
      formatMarkdown(sections[6].replace("REFLECTION SUMMARY", "").trim()) +
      "</div>";
    html += "</div>";
  }

  html += "</div>";
  return html;
}

function formatMarkdown(content: string): string {
  // Basic markdown formatting - you can enhance this with a proper markdown parser
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>',
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}
