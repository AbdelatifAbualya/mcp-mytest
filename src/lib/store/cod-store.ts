/**
 * Chain of Draft Configuration Store
 * Manages settings persistence across the application
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CoDComplexity {
  level:
    | "simple"
    | "moderate"
    | "complex"
    | "highly_complex"
    | "research_grade";
  score: number;
  recommendedWordLimit: number;
  recommendedVerification: "basic" | "standard" | "deep" | "research";
  hasMath: boolean;
  hasLogic: boolean;
  multiStep: boolean;
  hasResearch: boolean;
  hasScientific: boolean;
  hasCoding: boolean;
  hasEngineering: boolean;
  hasPhilosophy: boolean;
  hasEconomics: boolean;
  hasMedicine: boolean;
  wordCount: number;
  sentenceCount: number;
  questionWords: number;
  isLong: boolean;
  hasMultipleQuestions: boolean;
}

export interface CoDReflectionSettings {
  enableSelfVerification: boolean;
  enableErrorDetection: boolean;
  enableAlternativeSearch: boolean;
  enableConfidenceAssessment: boolean;
  verificationDepth: "basic" | "standard" | "deep" | "research";
}

export interface CoDConfig {
  // Core reasoning settings
  reasoningMethod: "standard" | "enhanced_cod";
  codWordLimit: number;
  reasoningEnhancement: "fixed" | "adaptive";

  // API Configuration
  enableTwoStageAPI: boolean;
  stage1_analysis: boolean;
  stage2_verification: boolean;

  // Reflection settings
  reflectionSettings: CoDReflectionSettings;

  // Memory configuration
  memoryCategories: {
    personalInfo: boolean;
    projectDetails: boolean;
    technicalKnowledge: boolean;
    reflectionHistory: boolean;
  };

  // UI preferences
  enableStreaming: boolean;
  showComplexityBadges: boolean;
  showProcessingTime: boolean;
  darkMode: boolean;
}

export interface FireworksConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  selectedModel: string;
  apiKey?: string;
}

interface CoDStore {
  // Configuration
  codConfig: CoDConfig;
  fireworksConfig: FireworksConfig;

  // State
  isInitialized: boolean;
  lastComplexityAnalysis?: CoDComplexity;

  // Actions
  updateCoDConfig: (updates: Partial<CoDConfig>) => void;
  updateFireworksConfig: (updates: Partial<FireworksConfig>) => void;
  updateReflectionSettings: (updates: Partial<CoDReflectionSettings>) => void;
  resetToDefaults: () => void;
  getComplexityColor: (level: string) => string;
  getComplexityDescription: (level: string) => string;
}

const DEFAULT_COD_CONFIG: CoDConfig = {
  reasoningMethod: "enhanced_cod",
  codWordLimit: 5,
  reasoningEnhancement: "fixed",
  enableTwoStageAPI: true,
  stage1_analysis: true,
  stage2_verification: true,
  reflectionSettings: {
    enableSelfVerification: true,
    enableErrorDetection: true,
    enableAlternativeSearch: true,
    enableConfidenceAssessment: true,
    verificationDepth: "standard",
  },
  memoryCategories: {
    personalInfo: true,
    projectDetails: true,
    technicalKnowledge: true,
    reflectionHistory: true,
  },
  enableStreaming: true,
  showComplexityBadges: true,
  showProcessingTime: true,
  darkMode: true,
};

const DEFAULT_FIREWORKS_CONFIG: FireworksConfig = {
  temperature: 0.3,
  topP: 0.9,
  topK: 40,
  maxTokens: 8192,
  selectedModel: "deepseek-v3",
};

export const useCoDStore = create<CoDStore>()(
  persist(
    (set) => ({
      // Initial state
      codConfig: DEFAULT_COD_CONFIG,
      fireworksConfig: DEFAULT_FIREWORKS_CONFIG,
      isInitialized: false,

      // Actions
      updateCoDConfig: (updates) => {
        set((state) => ({
          codConfig: { ...state.codConfig, ...updates },
        }));
      },

      updateFireworksConfig: (updates) => {
        set((state) => ({
          fireworksConfig: { ...state.fireworksConfig, ...updates },
        }));
      },

      updateReflectionSettings: (updates) => {
        set((state) => ({
          codConfig: {
            ...state.codConfig,
            reflectionSettings: {
              ...state.codConfig.reflectionSettings,
              ...updates,
            },
          },
        }));
      },

      resetToDefaults: () => {
        set({
          codConfig: DEFAULT_COD_CONFIG,
          fireworksConfig: DEFAULT_FIREWORKS_CONFIG,
        });
      },

      getComplexityColor: (level: string) => {
        switch (level) {
          case "research_grade":
            return "bg-red-600 text-white";
          case "highly_complex":
            return "bg-orange-600 text-white";
          case "complex":
            return "bg-yellow-600 text-white";
          case "moderate":
            return "bg-blue-600 text-white";
          case "simple":
            return "bg-green-600 text-white";
          default:
            return "bg-gray-600 text-white";
        }
      },

      getComplexityDescription: (level: string) => {
        switch (level) {
          case "research_grade":
            return "Requires extensive research-level analysis with 15 words per CoD step";
          case "highly_complex":
            return "Complex multi-faceted problem requiring 12 words per CoD step";
          case "complex":
            return "Multi-step problem requiring 8 words per CoD step";
          case "moderate":
            return "Standard complexity with 5 words per CoD step";
          case "simple":
            return "Simple problem with 5 words per CoD step";
          default:
            return "Unknown complexity level";
        }
      },
    }),
    {
      name: "enhanced-cod-store",
      version: 1,
      partialize: (state) => ({
        codConfig: state.codConfig,
        fireworksConfig: state.fireworksConfig,
        isInitialized: true,
      }),
    },
  ),
);

// Hooks for specific config sections
export const useCoDConfig = () => {
  const { codConfig, updateCoDConfig } = useCoDStore();
  return { codConfig, updateCoDConfig };
};

export const useFireworksConfig = () => {
  const { fireworksConfig, updateFireworksConfig } = useCoDStore();
  return { fireworksConfig, updateFireworksConfig };
};

export const useReflectionSettings = () => {
  const { codConfig, updateReflectionSettings } = useCoDStore();
  return {
    reflectionSettings: codConfig.reflectionSettings,
    updateReflectionSettings,
  };
};

// Utility functions
export const exportCoDConfig = () => {
  const state = useCoDStore.getState();
  return {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    config: {
      codConfig: state.codConfig,
      fireworksConfig: state.fireworksConfig,
    },
  };
};

export const importCoDConfig = (configData: any) => {
  try {
    const { updateCoDConfig, updateFireworksConfig } = useCoDStore.getState();

    if (configData.config?.codConfig) {
      updateCoDConfig(configData.config.codConfig);
    }

    if (configData.config?.fireworksConfig) {
      updateFireworksConfig(configData.config.fireworksConfig);
    }

    return true;
  } catch (error) {
    console.error("Failed to import CoD config:", error);
    return false;
  }
};

// Analytics and usage tracking
export const trackCoDUsage = (event: string, data?: any) => {
  if (typeof window !== "undefined") {
    console.log("CoD Analytics:", {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
    // Here you could integrate with analytics services
  }
};

export default useCoDStore;
