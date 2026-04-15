export type ThemeMode = 'light' | 'dark'

// Naive UI 主题引擎会在运行时做 rgba 计算，必须使用可解析的纯色值（不能是 CSS var）。
export const BRAND_PRIMARY_COLOR = '#E64D37'

export const NAIVE_THEME_OVERRIDES = {
  common: {
    primaryColor: BRAND_PRIMARY_COLOR,
    primaryColorHover: '#F06A57',
    primaryColorPressed: '#CC3F2B',
    primaryColorSuppl: BRAND_PRIMARY_COLOR,
  },
}

export function getThemeColors(mode: ThemeMode) {
  if (mode === 'dark') {
      return {
          main: '#020617',      // 更深一点的整体背景
          component: '#0b1120', // 稍微亮一点的卡片
          text: '#e5e7eb',
          textSecondary: '#9ca3af',
          sidebar: '#020617',
          sidebarBorder: '#1f2937',
          primary: BRAND_PRIMARY_COLOR,
          hover: 'rgba(255,255,255,0.06)',
          pressColor: 'rgba(230, 77, 55, 0.18)',
      }

  }

  return {
    main: '#f8fafc',
    component: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    sidebar: '#ffffffcc',
    sidebarBorder: '#e5e7eb',
    primary: BRAND_PRIMARY_COLOR,
    hover: 'rgba(15, 23, 42, 0.04)',
    pressColor: 'rgba(230, 77, 55, 0.12)',
  }
}

