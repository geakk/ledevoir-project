import { EventEmitter, Injectable } from '@angular/core';
import { THEMES } from '../constants/themes';
import { Theme } from '../interfaces/theme';
import { ThemeStorage } from './theme-storage';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly themes: Theme[] = THEMES;
  currentTheme: Theme | undefined;

  themeChange$ = new EventEmitter<Theme>();

  constructor(
    // eslint-disable-next-line no-unused-vars
    private readonly themeStorage: ThemeStorage
  ) {
    this.handleTheme();
  }

  private handleTheme(): void {
    const themeName = this.themeStorage.getStoredThemeName();
    if (themeName) {
      this.selectTheme(themeName);
    } else {
      this.themes.find((themes) => {
        if (themes.isDefault === true) {
          this.selectTheme(themes.name);
        }
      });
    }
  }

  selectTheme(themeName: string) {
    const theme = this.themes.find(
      (currentTheme) => currentTheme.name === themeName
    );

    if (!theme) {
      return;
    }

    this.currentTheme = theme;

    if (this.currentTheme) {
      this.themeStorage.storeTheme(this.currentTheme);
    }

    this.themeChange$.emit(this.currentTheme);
  }
}
