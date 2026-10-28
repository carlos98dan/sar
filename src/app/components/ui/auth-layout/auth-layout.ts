import { Component, input } from '@angular/core';

/** Estructura común de las pantallas de acceso: logo, título, descripción y contenido. */
@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
