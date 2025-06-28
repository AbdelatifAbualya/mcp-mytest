/**
 * Enhanced Chain of Draft (CoD) Reasoning System
 * Exact port from the HTML version with two-stage API calls
 */

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

export interface CoDConfig {
  reasoningMethod: "standard" | "enhanced_cod";
  codWordLimit: number;
  reasoningEnhancement: "fixed" | "adaptive";
  enableTwoStageAPI: boolean;
  stage1_analysis: boolean;
  stage2_verification: boolean;
  reflectionSettings: {
    enableSelfVerification: boolean;
    enableErrorDetection: boolean;
    enableAlternativeSearch: boolean;
    enableConfidenceAssessment: boolean;
    verificationDepth: "basic" | "standard" | "deep" | "research";
  };
}

export const DEFAULT_COD_CONFIG: CoDConfig = {
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
};

/**
 * ENHANCED PROMPTS FOR DEEPSEEK V3-0324 - EXACT MATCH FROM HTML
 */
export const ENHANCED_PROMPTS = {
  // Stage 1: Analysis + Initial CoD
  stage1_analysis_cod: (
    wordLimit: number,
  ) => `You are DeepSeek V3-0324, an advanced reasoning model. This is STAGE 1 of a two-stage enhanced reasoning process.

CRITICAL INSTRUCTIONS:
1. First, analyze the problem complexity and structure, make sure to think of every single aspect of that task, you must analysis that is 100% covers of all aspect of how the user prompt will be done the steps, and what are possible issues, and how to solve them.
2. Then apply Chain of Draft (CoD) methodology with EXACTLY ${wordLimit} words per step except if you need to think with more steps and words to get the 100%.
4. End with a draft solution, point the steps and what issues could arrise and how you can sovle them.

FORMAT:
#### PROBLEM ANALYSIS
[Analyze complexity, identify key components, determine approach]

#### CHAIN OF DRAFT STEPS
CoD Step 1: [${wordLimit} words maximum]
CoD Step 2: [${wordLimit} words maximum]
CoD Step 3: [${wordLimit} words maximum]
[Continue as needed...]

#### INITIAL REFLECTION
[Reflect on reasoning quality, identify potential issues, assess confidence, find if any part no matter how small its, any edge cases that the first reasoning missed to acheive 100% of what the user asked, anything the full 100% is a fail, dig deep and think if inything was missed or impmented in the wrong way or any possible case.]

#### DRAFT SOLUTION
[Provide initial solution based on CoD analysis]

Remember: This is STAGE 1. Be thorough but prepare for STAGE 2 verification.`,

  // Stage 2: Deep Verification + Final Answer
  stage2_verification:
    () => `You are DeepSeek V3-0324 in STAGE 2 of enhanced reasoning. You will now perform deep verification, you must think of the full understandng of question inclding any small edge case that might have been missed, if you are not 100% sure about any point think as long as you wany until yopu make sure that the soluation that was mentioned with achevieve 100%, if not add why then prvide a solution and provide the final comprehensive answer that is perfect, flawless,that takes all what was mentioned into consideration, then write a full code that will fulfill every single part of the user prompt and every signle assue that could happend, the goal if 100% regardless of how many lines it takes, if it takes 1000 line to get from competing 99% of user prompt and it takes 3000 lines to have 100% then anything less than 100% is complete fail.

Your task:
1. CRITICALLY EXAMINE the Stage 1 analysis and CoD steps, your goal is to have an examine that does miss anything, no minor or unliky it's, and if you need to use more than the CD word to make sure you 00% don't miss anything then if takes 1000 line to get from competing 99% of user prompt and it takes 3000 lines to have 100% then anything less than 100% is complete fail.
2. VERIFY each reasoning step for accuracy and logical consistency, could any errors that could arise that it missed, think in depth of any edge cases that they might have missed or implemented in a way that might complacate things in later steps casuing issues, if takes 1000 line to complete 99% of user prompt and 3000 lines to have 100% then anything less than 100% is complete fail.
3. CHECK for mathematical errors, logical fallacies, or incomplete reasoning
4. EXPLORE alternative approaches if needed%
6. PROVIDE a comprehensive final answer, you are not limteed but COD here, your limit is anything less than a a code that is flawless, perfect, takes all what was mentioned in the dssatio then implment them perfect way regardless of how many lines it takes , if your code comepetes 99% and it takes 2000 more lines to compete every single part or subpart of the user prompt you must do it, 99% is a fail without errors .
VERIFICATION CHECKLIST:
□ Are all CoD steps logically sound?
□ Are there any mathematical or computational errors?
□ Are assumptions clearly stated and reasonable?
□ Have alternative approaches been considered?
□ Is the reasoning complete and comprehensive?
□ Are there any gaps or weaknesses in the logic?

FORMAT:
#### STAGE 2 VERIFICATION
[Critical analysis of Stage 1 reasoning]

#### ERROR DETECTION & CORRECTION
[Identify and correct any errors found]

#### ALTERNATIVE APPROACH ANALYSIS
[Consider alternative solution paths]

#### CONFIDENCE ASSESSMENT
[Evaluate confidence levels and identify uncertainties]

#### FINAL COMPREHENSIVE ANSWER
[Definitive, well-reasoned solution with full explanation]

#### REFLECTION SUMMARY
[Key insights, lessons learned, and reasoning quality assessment]`,
};

/**
 * ADAPTIVE COMPLEXITY DETECTION (Enhanced) - EXACT MATCH FROM HTML
 */
export function analyzeEnhancedComplexity(message: string): CoDComplexity {
  const complexity: Partial<CoDComplexity> = {
    // Basic indicators
    hasMath: /[\d\+\-\*\/\=\(\)\^\%√∫∑∏]/.test(message),
    hasLogic:
      /\b(if|then|else|because|therefore|since|implies|prove|logic|reasoning|analyze|compare|evaluate|assess)\b/i.test(
        message,
      ),
    multiStep:
      /\b(first|next|then|after|finally|step|calculate|find|determine|process|stages?|phases?)\b/i.test(
        message,
      ),

    // Research indicators
    hasResearch:
      /\b(research|study|investigate|explore|examine|review|analysis|synthesis|comprehensive|methodology)\b/i.test(
        message,
      ),
    hasScientific:
      /\b(hypothesis|theory|experiment|data|statistical|scientific|empirical|peer.review|literature)\b/i.test(
        message,
      ),

    // Technical indicators
    hasCoding:
      /\b(code|programming|algorithm|function|class|variable|debug|implement|develop|software)\b/i.test(
        message,
      ),
    hasEngineering:
      /\b(design|optimization|system|architecture|performance|efficiency|scalability)\b/i.test(
        message,
      ),

    // Advanced indicators
    hasPhilosophy:
      /\b(ethics|moral|philosophical|ontology|epistemology|metaphysics|consciousness)\b/i.test(
        message,
      ),
    hasEconomics:
      /\b(economic|financial|market|trade|investment|fiscal|monetary|GDP|inflation)\b/i.test(
        message,
      ),
    hasMedicine:
      /\b(medical|clinical|diagnosis|treatment|patient|therapy|pharmaceutical|biological)\b/i.test(
        message,
      ),

    // Complexity metrics
    wordCount: countWords(message),
    sentenceCount: (message.match(/[.!?]+/g) || []).length,
    questionWords: (
      message.match(/\b(what|how|why|when|where|which|who)\b/gi) || []
    ).length,
    isLong: message.length > 300,
    hasMultipleQuestions: (message.match(/\?/g) || []).length > 1,
  };

  // Enhanced scoring system
  let score = 0;
  if (complexity.hasMath) score += 2;
  if (complexity.hasLogic) score += 1;
  if (complexity.multiStep) score += 1;
  if (complexity.hasResearch) score += 3;
  if (complexity.hasScientific) score += 2;
  if (complexity.hasCoding) score += 1;
  if (complexity.hasEngineering) score += 1;
  if (complexity.hasPhilosophy) score += 2;
  if (complexity.hasEconomics) score += 1;
  if (complexity.hasMedicine) score += 2;
  if (complexity.isLong) score += 1;
  if (complexity.hasMultipleQuestions) score += 1;
  if (complexity.questionWords! > 3) score += 1;
  if (complexity.sentenceCount! > 10) score += 1;

  // Determine complexity level with enhanced categories
  if (score >= 8) {
    complexity.level = "research_grade";
    complexity.recommendedWordLimit = 15;
    complexity.recommendedVerification = "research";
  } else if (score >= 6) {
    complexity.level = "highly_complex";
    complexity.recommendedWordLimit = 12;
    complexity.recommendedVerification = "deep";
  } else if (score >= 4) {
    complexity.level = "complex";
    complexity.recommendedWordLimit = 8;
    complexity.recommendedVerification = "standard";
  } else if (score >= 2) {
    complexity.level = "moderate";
    complexity.recommendedWordLimit = 5;
    complexity.recommendedVerification = "standard";
  } else {
    complexity.level = "simple";
    complexity.recommendedWordLimit = 5;
    complexity.recommendedVerification = "basic";
  }

  complexity.score = score;
  return complexity as CoDComplexity;
}

export function getAdaptiveEnhancedSettings(
  message: string,
  config: CoDConfig,
) {
  if (config.reasoningEnhancement !== "adaptive") {
    return {
      method: config.reasoningMethod,
      wordLimit: config.codWordLimit,
      verificationDepth: config.reflectionSettings.verificationDepth,
      adapted: false,
    };
  }

  const complexity = analyzeEnhancedComplexity(message);
  const adaptedWordLimit = complexity.recommendedWordLimit;
  const adaptedVerification = complexity.recommendedVerification;
  let reasoning = "";

  switch (complexity.level) {
    case "research_grade":
      reasoning =
        "Research-grade complexity detected - using extensive CoD steps with deep verification";
      break;
    case "highly_complex":
      reasoning =
        "Highly complex problem detected - using expanded CoD with comprehensive verification";
      break;
    case "complex":
      reasoning =
        "Complex problem detected - using moderate CoD expansion with standard verification";
      break;
    case "moderate":
      reasoning = "Moderate complexity detected - using balanced CoD approach";
      break;
    case "simple":
      reasoning = "Simple problem detected - using concise CoD steps";
      break;
  }

  return {
    method: config.reasoningMethod,
    wordLimit: adaptedWordLimit,
    verificationDepth: adaptedVerification,
    complexity: complexity,
    adapted:
      adaptedWordLimit !== config.codWordLimit ||
      adaptedVerification !== config.reflectionSettings.verificationDepth,
    reasoning: reasoning,
  };
}

function countWords(text: string): number {
  if (!text) return 0;
  const textWithoutCode = text.replace(/```[\s\S]*?```/g, "");
  const processedText = textWithoutCode
    .replace(/\b\w+\s*=\s*[\d\w+\-*/()]+/g, "EQUATION")
    .replace(/\b\d+\/\d+\b/g, "FRACTION")
    .replace(/[+\-*/=<>]+/g, " ");
  return processedText.split(/\s+/).filter((word) => word.length > 0).length;
}

export interface CoDStageResult {
  stage: 1 | 2;
  content: string;
  wordLimit?: number;
  complexity?: CoDComplexity;
  reasoning?: string;
  timestamp: string;
}

export interface CoDSessionResult {
  stage1: CoDStageResult;
  stage2?: CoDStageResult;
  totalTokens?: number;
  totalTime?: number;
  settings: ReturnType<typeof getAdaptiveEnhancedSettings>;
}
