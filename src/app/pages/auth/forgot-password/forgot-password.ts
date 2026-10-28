import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly submitting = signal(false);
  /** Mensaje genérico: nunca revela si el correo está registrado. */
  readonly confirmation = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.requestPasswordReset(this.form.getRawValue().email).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.confirmation.set(response.message);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('No pudimos procesar la solicitud. Intenta nuevamente en unos minutos.');
      },
    });
  }
}
