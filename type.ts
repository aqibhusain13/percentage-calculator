
export type CalcType = 'BASIC_OF' | 'IS_WHAT' | 'CHANGE' | 'ADD_SUB';

export interface CalculationResult {
  value: number;
  formula: string;
  explanation: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: CalcType;
  inputs: number[];
  result: number;
  label: string;
}

export interface AIAnalysis {
  type: CalcType;
  inputs: number[];
  explanation: string;
  suggestedAction: string;
}
