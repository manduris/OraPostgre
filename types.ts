
export enum ConversionType {
  MYBATIS = 'MYBATIS',
  FUNCTION = 'FUNCTION',
  SQL = 'SQL'
}

export interface ConversionResult {
  original: string;
  converted: string;
  timestamp: number;
  fileName?: string;
}

export interface AppState {
  activeTab: ConversionType;
  isConverting: boolean;
  error: string | null;
  history: ConversionResult[];
}
