import { Theme } from '../interfaces/theme';

export const THEMES: Theme[] = [
  {
    primary: '#673AB7',
    accent: '#FFC107',
    displayName: 'Deep Purple & Amber',
    name: 'deeppurple-amber',
    cssSelector: 'deeppurple-amber-theme',
    isDark: false,
  },
  {
    primary: '#3F51B5',
    accent: '#E91E63',
    displayName: 'Indigo & Pink',
    name: 'indigo-pink',
    cssSelector: 'indigo-pink-theme',
    isDark: false,
    isDefault: true,
  },
  {
    primary: '#E91E63',
    accent: '#607D8B',
    displayName: 'Pink & Blue-grey',
    name: 'pink-bluegrey',
    cssSelector: 'pink-bluegrey-theme',
    isDark: true,
  },
  {
    primary: '#9C27B0',
    accent: '#4CAF50',
    displayName: 'Purple & Green',
    name: 'purple-green',
    cssSelector: 'purple-green-theme',
    isDark: true,
  },
];
