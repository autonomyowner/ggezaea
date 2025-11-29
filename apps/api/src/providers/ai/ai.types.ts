export interface CognitiveBias {
  name: string;
  intensity: number; // 0-100
  description: string;
}

export interface ThinkingPattern {
  name: string;
  percentage: number; // 0-100
}

export interface EmotionalState {
  primary: string;
  secondary?: string;
  intensity: 'low' | 'moderate' | 'high';
}

export interface AnalysisResult {
  biases: CognitiveBias[];
  patterns: ThinkingPattern[];
  insights: string[];
  emotionalState: EmotionalState;
}

export interface AIProvider {
  analyze(inputText: string): Promise<AnalysisResult>;
}
