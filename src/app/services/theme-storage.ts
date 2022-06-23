import { Injectable } from '@angular/core';
import { Theme } from '../interfaces/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeStorage {
  static storageKey = 'ledevoir-theme';

  storeTheme(theme: Theme) {
    try {
      window.localStorage[ThemeStorage.storageKey] = theme.name;
    } catch {
      console.error('Unable to set theme in local storage');
    }
  }

  getStoredThemeName(): string | null {
    try {
      return window.localStorage[ThemeStorage.storageKey] || null;
    } catch {
      return null;
    }
  }

  clearStorage() {
    try {
      window.localStorage.removeItem(ThemeStorage.storageKey);
    } catch {
      console.error('Unable to remove theme from local storage');
    }
  }
}
