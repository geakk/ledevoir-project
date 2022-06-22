export interface Theme {
  name: string;
  cssSelector: string;
  displayName?: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
}
