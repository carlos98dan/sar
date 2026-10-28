import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Alert } from '../../../components/ui/alert/alert';
import { AuthLayout } from '../../../components/ui/auth-layout/auth-layout';
import { Button } from '../../../components/ui/button/button';
import { FormField } from '../../../components/ui/form-field/form-field';
import { SectionCard } from '../../../components/ui/section-card/section-card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthLayout, Button, FormField, SectionCard],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl());
    }
  }

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberSession: [false],
  });

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Destino tras iniciar sesión. Solo rutas internas para evitar redirecciones a otros sitios. */
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    return url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl()),
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
      },
    });
  }
}
