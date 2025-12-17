import { KPIKey } from '@/types';

export const COLORS = {
  bg: '#0E1014',
  panel: '#151922',
  panel2: '#1A1F2B',
  text: '#E9ECF1',
  muted: '#8A90A2',
  accentA: '#7C5CFF',
  accentB: '#00C1D4',
  accentC: '#2EE59D',
  accentD: '#FF6FAE',
  warn: '#F9C74F',
  error: '#F94144',
} as const;

export const KPI_COLORS: Record<KPIKey, string> = {
  emp_office: COLORS.accentB,
  cont_office: COLORS.muted,
  emp_remote: COLORS.accentA,
  cont_remote: COLORS.accentD,
};

export const COMPLIANCE_COLORS = {
  compliant: COLORS.accentC,
  exceptions: COLORS.warn,
  non_compliant: COLORS.error,
};

export const TIMESERIES_COLORS = {
  security_incidents: COLORS.error,
  office_access: COLORS.accentB,
  remote_access: COLORS.accentA,
};

export function getColorForKPI(key: KPIKey): string {
  return KPI_COLORS[key];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

