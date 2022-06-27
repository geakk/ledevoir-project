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

export const firstWaveStartDate = new Date('2020-02-23');
export const firstWaveEndDate = new Date('2020-07-11');

export const secondWaveStartDate = new Date('2020-08-23');
export const secondWaveEndDate = new Date('2021-03-20');

export const thirdWaveStartDate = new Date('2021-03-21');
export const thirdWaveEndDate = new Date('2021-07-17');

export const fourthWaveStartDate = new Date('2021-07-18');
export const fourthWaveEndDate = new Date('2021-12-04');

export const fivethWaveStartDate = new Date('2021-12-05');
export const fivethWaveEndDate = new Date('2022-03-12');

export const sixthWaveStartDate = new Date('2020-03-13');
export const sixthWaveEndDate = new Date('2020-07-11');
