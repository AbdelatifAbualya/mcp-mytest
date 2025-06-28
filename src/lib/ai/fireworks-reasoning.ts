import { fireworks } from "@ai-sdk/fireworks";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

/**
 * Enhanced Fireworks models with reasoning capabilities
 * Specifically configured for DeepSeek R1 and other reasoning models
 */
export const createFireworksReasoningModel = (modelId: string) => {
  const baseModel = fireworks(modelId);

  // Check if this is a reasoning model that supports <think> tags
  const isReasoningModel = modelId.includes("deepseek-r1");

  if (isReasoningModel) {
    return wrapLanguageModel({
      model: baseModel,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });
  }

  return baseModel;
};

/**
 * Enhanced Chain of Draft configuration for Fireworks models
 */
export const FIREWORKS_REASONING_CONFIG = {
  // Standard reasoning approach
  standard: {
    temperature: 0.7,
    maxTokens: 4000,
  },

  // Enhanced Chain of Draft with dual-stage verification
  enhanced_cod: {
    // First stage: Draft + Reflection
    draft: {
      temperature: 0.8,
      maxTokens: 2000,
      systemPrompt: `You are an expert reasoning assistant. Follow these steps:
1. **Draft Response**: Provide your initial answer
2. **Critical Reflection**: Analyze your draft for potential issues, missing information, or logical flaws
3. **Revision**: Based on your reflection, provide an improved response

Use <think> tags for your reasoning process.`,
    },

    // Second stage: Final Verification & Answer
    verification: {
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: `You are a verification specialist. Review the provided draft and reflection:
1. **Verification**: Check the accuracy and completeness
2. **Final Answer**: Provide the definitive, verified response

Be concise but thorough in your final answer.`,
    },
  },

  // Model-specific configurations
  models: {
    "deepseek-r1": {
      maxTokens: 8000,
      temperature: 0.7,
      supportsReasoning: true,
    },
    "deepseek-v3": {
      maxTokens: 4000,
      temperature: 0.7,
      supportsReasoning: false,
    },
    "llama-3.1-405b": {
      maxTokens: 4000,
      temperature: 0.7,
      supportsReasoning: false,
    },
    "firefunction-v1": {
      maxTokens: 4000,
      temperature: 0.7,
      supportsReasoning: false,
      optimizedForTools: true,
    },
  },
};

/**
 * Get model configuration for enhanced reasoning
 */
export const getFireworksModelConfig = (modelName: string) => {
  return (
    FIREWORKS_REASONING_CONFIG.models[modelName] || {
      maxTokens: 4000,
      temperature: 0.7,
      supportsReasoning: false,
    }
  );
};
