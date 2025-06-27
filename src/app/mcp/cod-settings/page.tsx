"use client";

import React, { useState } from "react";

const initialConfig = {
  reasoningMethod: "enhanced_cod",
  codWordLimit: 5,
  reasoningEnhancement: "adaptive_complexity",
  temperature: 0.7,
  topP: 1,
  maxTokens: 1024,
  reflectionEnabled: true,
  verificationDepth: "standard",
  summarizationMode: "brief",
};

export default function CoDSettingsPage() {
  const [activeTab, setActiveTab] = useState("cod");
  const [config, setConfig] = useState(initialConfig);

  const handleSettingChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "cod", label: "CoD Settings" },
    { id: "parameters", label: "Parameters" },
    { id: "reflection", label: "Reflection" },
  ];

  return (
    <div className="bg-gray-800 text-gray-200 font-sans w-full max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Enhanced AI Configuration
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 text-sm sm:text-base font-semibold transition-colors duration-200 ease-in-out focus:outline-none ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-opacity duration-500 ease-in-out">
        {activeTab === "cod" && (
          <CodSettingsPanel config={config} onChange={handleSettingChange} />
        )}
        {activeTab === "parameters" && (
          <ParametersPanel config={config} onChange={handleSettingChange} />
        )}
        {activeTab === "reflection" && (
          <ReflectionPanel config={config} onChange={handleSettingChange} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-8 pt-4 border-t border-gray-700">
        <button className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 ml-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function CodSettingsPanel({ config, onChange }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">
        Enhanced Chain of Draft Configuration
      </h2>

      <SettingsGroup title="Reasoning Method">
        <RadioOption
          name="reasoningMethod"
          value="standard"
          label="Standard (No special reasoning)"
          description="Direct model responses without Chain of Draft methodology."
          checked={config.reasoningMethod === "standard"}
          onChange={(e) => onChange("reasoningMethod", e.target.value)}
        />
        <RadioOption
          name="reasoningMethod"
          value="enhanced_cod"
          label="Enhanced Chain of Draft with Dual-Stage Verification"
          description="Advanced CoD with two-stage API calls: Draft + Reflection → Final Verification & Answer."
          checked={config.reasoningMethod === "enhanced_cod"}
          onChange={(e) => onChange("reasoningMethod", e.target.value)}
        />
      </SettingsGroup>

      <SettingsGroup title="CoD Word Limits (Research-Optimized)">
        {[5, 8, 12, 15].map((words) => (
          <RadioOption
            key={words}
            name="codWordLimit"
            value={words}
            label={`${words} words per step`}
            description={getWordLimitDescription(words)}
            checked={config.codWordLimit === words}
            onChange={(e) => onChange("codWordLimit", parseInt(e.target.value))}
          />
        ))}
      </SettingsGroup>

      <SettingsGroup title="Adaptive Reasoning Enhancement">
        <div className="inline-flex items-center ml-2 bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">
          AI-POWERED
        </div>
        <RadioOption
          name="reasoningEnhancement"
          value="adaptive_complexity"
          label="Adaptive Complexity Detection"
          description="Automatically adjusts reasoning depth and word limits based on problem complexity analysis."
          checked={config.reasoningEnhancement === "adaptive_complexity"}
          onChange={(e) => onChange("reasoningEnhancement", e.target.value)}
        />
        <RadioOption
          name="reasoningEnhancement"
          value="fixed_depth"
          label="Fixed Reasoning Depth"
          description="Uses consistent reasoning approach and word limits for all problems."
          checked={config.reasoningEnhancement === "fixed_depth"}
          onChange={(e) => onChange("reasoningEnhancement", e.target.value)}
        />
      </SettingsGroup>
    </div>
  );
}

function getWordLimitDescription(words) {
  switch (words) {
    case 5:
      return "Original paper recommendation - maximum efficiency (7.6% of CoT tokens).";
    case 8:
      return "Enhanced clarity while maintaining efficiency - optimal for research.";
    case 12:
      return "Balanced approach for complex scientific reasoning.";
    case 15:
      return "Detailed steps for mathematical and analytical tasks.";
    default:
      return "";
  }
}

function ParametersPanel({ config, onChange }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">Model Parameters</h2>
      <Slider
        label="Temperature"
        value={config.temperature}
        min={0}
        max={1}
        step={0.1}
        onChange={(e) => onChange("temperature", parseFloat(e.target.value))}
        description="Controls randomness. Lower is more deterministic."
      />
      <Slider
        label="Top P"
        value={config.topP}
        min={0}
        max={1}
        step={0.1}
        onChange={(e) => onChange("topP", parseFloat(e.target.value))}
        description="Nucleus sampling. Considers tokens with top P probability mass."
      />
      <Slider
        label="Maximum Tokens"
        value={config.maxTokens}
        min={256}
        max={4096}
        step={64}
        onChange={(e) => onChange("maxTokens", parseInt(e.target.value))}
        description="The maximum number of tokens to generate in the response."
      />
    </div>
  );
}

function ReflectionPanel({ config, onChange }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white">
        Reflection & Verification
      </h2>

      <SettingsGroup title="Reflection Engine">
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
          <span className="text-gray-300">Enable Deep Verification</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.reflectionEnabled}
              onChange={(e) => onChange("reflectionEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </SettingsGroup>

      {config.reflectionEnabled && (
        <>
          <SettingsGroup title="Verification Depth">
            <RadioOption
              name="verificationDepth"
              value="basic"
              label="Basic Verification"
              description="A quick check for logical consistency and coherence."
              checked={config.verificationDepth === "basic"}
              onChange={(e) => onChange("verificationDepth", e.target.value)}
            />
            <RadioOption
              name="verificationDepth"
              value="standard"
              label="Standard Verification"
              description="A detailed review of the draft, checking for errors and gaps."
              checked={config.verificationDepth === "standard"}
              onChange={(e) => onChange("verificationDepth", e.target.value)}
            />
            <RadioOption
              name="verificationDepth"
              value="deep"
              label="Deep Verification"
              description="Critically examines each reasoning step and explores alternatives."
              checked={config.verificationDepth === "deep"}
              onChange={(e) => onChange("verificationDepth", e.target.value)}
            />
            <RadioOption
              name="verificationDepth"
              value="research"
              label="Research Grade"
              description="Exhaustive verification suitable for academic or scientific claims."
              checked={config.verificationDepth === "research"}
              onChange={(e) => onChange("verificationDepth", e.target.value)}
            />
          </SettingsGroup>

          <SettingsGroup title="Summarization Mode">
            <RadioOption
              name="summarizationMode"
              value="brief"
              label="Brief Summary"
              description="Concisely state the final conclusion."
              checked={config.summarizationMode === "brief"}
              onChange={(e) => onChange("summarizationMode", e.target.value)}
            />
            <RadioOption
              name="summarizationMode"
              value="detailed"
              label="Detailed Explanation"
              description="Provide a full breakdown of the reasoning process."
              checked={config.summarizationMode === "detailed"}
              onChange={(e) => onChange("summarizationMode", e.target.value)}
            />
          </SettingsGroup>
        </>
      )}
    </div>
  );
}

const SettingsGroup = ({ title, children }) => (
  <div className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg">
    <h3 className="font-semibold text-gray-100 mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const RadioOption = ({
  name,
  value,
  label,
  description,
  checked,
  onChange,
}) => (
  <label className="flex items-start p-3 bg-gray-800/60 rounded-lg cursor-pointer hover:bg-gray-700/80 transition-colors border border-transparent has-[:checked]:border-blue-500 has-[:checked]:bg-blue-900/30">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 mt-1 bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2"
    />
    <div className="ml-3 text-sm">
      <p className="font-medium text-gray-200">{label}</p>
      <p className="text-gray-400">{description}</p>
    </div>
  </label>
);

const Slider = ({ label, value, min, max, step, onChange, description }) => (
  <div className="p-4 bg-gray-900 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <label className="font-medium text-gray-200">{label}</label>
      <span className="text-sm font-mono px-2 py-1 bg-gray-700 rounded-md text-white">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
    <p className="text-sm text-gray-400 mt-2">{description}</p>
  </div>
);
