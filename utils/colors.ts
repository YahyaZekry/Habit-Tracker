export interface Theme {
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  divider: string;
}

export type PaletteColor = {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
};

export const COLORS = {
  primary: {
    light: '#9FA5FA',
    main: '#6366F1',
    dark: '#4338CA',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light: '#BAE6FD',
    main: '#38BDF8',
    dark: '#0EA5E9',
    contrastText: '#FFFFFF',
  },
  success: {
    light: '#86EFAC',
    main: '#22C55E',
    dark: '#16A34A',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#FED7AA',
    main: '#F97316',
    dark: '#EA580C',
    contrastText: '#FFFFFF',
  },
  error: {
    light: '#FCA5A5',
    main: '#EF4444',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  grey: {
    100: '#F8FAFC',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

export const LIGHT_THEME = {
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
  },
  divider: '#E2E8F0',
};

export const DARK_THEME = {
  background: {
    default: '#0F172A',
    paper: '#1E293B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    disabled: '#64748B',
  },
  divider: '#334155',
};

export const HABIT_COLORS = [
  '#6366F1', // Indigo
  '#38BDF8', // Sky
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Violet
];

export const getColorWithOpacity = (color: string, opacity: number): string => {
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be between 0 and 1');
  }

  // Convert opacity to a hex value
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');

  // If color is in hex format
  if (color.startsWith('#')) {
    return `${color}${alpha}`;
  }

  // If color is in rgba format
  if (color.startsWith('rgb')) {
    return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  }

  return color;
};
