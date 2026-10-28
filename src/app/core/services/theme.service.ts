import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/** Clave de localStorage. Debe coincidir con el script de index.html que aplica el tema antes de pintar. */
const STORAGE_KEY = 'SAR-theme';

/**
 * Modo claro u oscuro. La elección se guarda en el navegador; sin elección guardada se usa la preferencia del sistema.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sin acceso a localStorage (modo privado o datos bloqueados) el tema dura solo esta sesión.
    }
  }

  private apply(theme: Theme): void {
    this.document.documentElement.dataset['theme'] = theme;
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Sin acceso a localStorage se usa la preferencia del sistema.
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
