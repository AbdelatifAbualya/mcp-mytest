/**
 * Vision, File System and Sound Processing for Chain of Draft
 * Integrates multimedia capabilities with Fireworks AI
 */

import { fireworks } from "@ai-sdk/fireworks";
import { generateText, CoreMessage } from "ai";

export interface MediaInput {
  type: "image" | "audio" | "file";
  data: string; // base64 or URL
  mimeType: string;
  filename?: string;
  size?: number;
}

interface ProcessedMedia {
  description: string;
  metadata: {
    type: string;
    format: string;
    size?: number;
    dimensions?: { width: number; height: number };
    duration?: number;
  };
  extractedText?: string;
  analysis?: string;
}

/**
 * Process image inputs for vision analysis using Fireworks vision models
 */
export async function processImageInput(
  imageInput: MediaInput,
): Promise<ProcessedMedia> {
  if (imageInput.type !== "image") {
    throw new Error("Input must be an image");
  }

  try {
    // Use Fireworks vision model for actual image analysis
    const messages: CoreMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image in detail. Describe what you see, including objects, people, text, colors, composition, and any relevant details that would be useful for further reasoning or analysis.",
          },
          {
            type: "image",
            image: imageInput.data.startsWith("data:")
              ? imageInput.data
              : `data:${imageInput.mimeType};base64,${imageInput.data}`,
          },
        ],
      },
    ];

    const result = await generateText({
      model: fireworks("accounts/fireworks/models/qwen2p5-vl-32b-instruct"),
      messages,
      temperature: 0.3,
      maxTokens: 1000,
    });

    return {
      description: `Image file: ${imageInput.filename || "untitled"} (${imageInput.mimeType})`,
      metadata: {
        type: "image",
        format: imageInput.mimeType,
        size: imageInput.size,
      },
      analysis: result.text,
      extractedText: result.text, // Vision analysis serves as extracted content
    };
  } catch (error) {
    console.error("Vision analysis failed:", error);
    return {
      description: `Image file: ${imageInput.filename || "untitled"} (${imageInput.mimeType})`,
      metadata: {
        type: "image",
        format: imageInput.mimeType,
        size: imageInput.size,
      },
      analysis:
        "Vision analysis temporarily unavailable. Image uploaded but not analyzed.",
      extractedText: `[Image: ${imageInput.filename || "untitled"}]`,
    };
  }
}

/**
 * Process audio inputs for sound analysis
 */
export async function processAudioInput(
  audioInput: MediaInput,
): Promise<ProcessedMedia> {
  if (audioInput.type !== "audio") {
    throw new Error("Input must be audio");
  }

  return {
    description: `Audio file: ${audioInput.filename || "untitled"} (${audioInput.mimeType})`,
    metadata: {
      type: "audio",
      format: audioInput.mimeType,
      size: audioInput.size,
    },
    extractedText: "Audio transcription would be performed here",
    analysis:
      "Audio analysis including speech recognition and sound classification",
  };
}

/**
 * Process file inputs for document analysis
 */
export async function processFileInput(
  fileInput: MediaInput,
): Promise<ProcessedMedia> {
  if (fileInput.type !== "file") {
    throw new Error("Input must be a file");
  }

  let extractedText = "";
  let analysis = "";

  // Basic file type detection and processing
  if (fileInput.mimeType.includes("text/")) {
    // Text file processing
    try {
      const decodedContent = atob(fileInput.data);
      extractedText = decodedContent;
      analysis = "Text content extracted and ready for Chain of Draft analysis";
    } catch {
      analysis = "Error processing text file";
    }
  } else if (fileInput.mimeType.includes("application/json")) {
    // JSON file processing
    try {
      const decodedContent = atob(fileInput.data);
      const jsonData = JSON.parse(decodedContent);
      extractedText = JSON.stringify(jsonData, null, 2);
      analysis = "JSON structure parsed and formatted for analysis";
    } catch {
      analysis = "Error parsing JSON file";
    }
  } else if (fileInput.mimeType.includes("application/pdf")) {
    // PDF processing (placeholder)
    analysis =
      "PDF processing would require additional libraries like pdf-parse";
    extractedText = "PDF content extraction not implemented in this demo";
  } else {
    analysis = `File type ${fileInput.mimeType} detected. Specialized processing may be required.`;
  }

  return {
    description: `File: ${fileInput.filename || "untitled"} (${fileInput.mimeType})`,
    metadata: {
      type: "file",
      format: fileInput.mimeType,
      size: fileInput.size,
    },
    extractedText,
    analysis,
  };
}

/**
 * Process multiple media inputs for Chain of Draft
 */
export async function processMultipleMediaInputs(
  mediaInputs: MediaInput[],
): Promise<ProcessedMedia[]> {
  const processed: ProcessedMedia[] = [];

  for (const input of mediaInputs) {
    try {
      let processedMedia: ProcessedMedia;

      switch (input.type) {
        case "image":
          processedMedia = await processImageInput(input);
          break;
        case "audio":
          processedMedia = await processAudioInput(input);
          break;
        case "file":
          processedMedia = await processFileInput(input);
          break;
        default:
          throw new Error(`Unsupported media type: ${input.type}`);
      }

      processed.push(processedMedia);
    } catch (error) {
      console.error(`Error processing ${input.type}:`, error);
      processed.push({
        description: `Error processing ${input.type}: ${input.filename || "untitled"}`,
        metadata: {
          type: input.type,
          format: input.mimeType,
          size: input.size,
        },
        analysis: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  return processed;
}

/**
 * Create enhanced prompt with media context for Chain of Draft
 */
export function createMediaEnhancedPrompt(
  originalPrompt: string,
  processedMedia: ProcessedMedia[],
): string {
  if (processedMedia.length === 0) {
    return originalPrompt;
  }

  let mediaContext = "\n\n=== MULTIMEDIA CONTEXT ===\n";

  processedMedia.forEach((media, index) => {
    mediaContext += `\n${index + 1}. ${media.description}\n`;
    mediaContext += `   Format: ${media.metadata.format}\n`;

    if (media.extractedText) {
      mediaContext += `   Content: ${media.extractedText.substring(0, 500)}${media.extractedText.length > 500 ? "..." : ""}\n`;
    }

    if (media.analysis) {
      mediaContext += `   Analysis: ${media.analysis}\n`;
    }
  });

  mediaContext += "\n=== END MULTIMEDIA CONTEXT ===\n\n";
  mediaContext +=
    "Please consider the above multimedia context when performing your Chain of Draft analysis.\n\n";

  return mediaContext + originalPrompt;
}

/**
 * Fireworks model capabilities checker
 */
export function getModelCapabilities(modelPath: string) {
  // Vision models
  const visionModels = [
    "accounts/fireworks/models/llava-v1.5-7b-fireworks",
    "accounts/fireworks/models/llava-v1.5-13b-fireworks",
  ];

  // Function calling models
  const functionModels = [
    "accounts/fireworks/models/firefunction-v1",
    "accounts/fireworks/models/firefunction-v2",
    "accounts/fireworks/models/deepseek-v3",
    "accounts/fireworks/models/deepseek-v3-0324",
  ];

  return {
    supportsVision: visionModels.includes(modelPath),
    supportsTools: functionModels.includes(modelPath),
    supportsStreaming: true, // Most Fireworks models support streaming
    contextLength: modelPath.includes("deepseek") ? 64000 : 4096,
  };
}

export type { ProcessedMedia };
