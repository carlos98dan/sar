import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';

export interface LoginRequest {
  email: string;
  password: string;
  rememberSession: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresInSeconds: number;
}

interface StoredSession {
  accessToken: string;
  expiresAt: number;
}

const SESSION_KEY = 'reservehub.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(request: LoginRequest): Observable<LoginResponse> {
    // BACKEND: return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request);
    return of<LoginResponse>({
      "accessToken": "eyJhbGciOiJIUzI1NiJ9.demo.placeholder",
      "expiresInSeconds": 3600
    }).pipe(tap((response) => this.saveSession(response, request.rememberSession)));
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    // BACKEND: return this.http.post<{ message: string }>(`${this.baseUrl}/auth/password-reset`, { email });
    return of<{ message: string }>({
      "message": "Si el correo está registrado, recibirás las instrucciones en unos minutos."
    });
  }

  /** Hay sesión vigente si existe un token no expirado en el almacenamiento. */
  isAuthenticated(): boolean {
    const session = this.readSession();
    if (!session) {
      return false;
    }
    if (session.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  /** "Mantener sesión" usa localStorage; si no, la sesión dura solo mientras la pestaña esté abierta. */
  private saveSession(response: LoginResponse, remember: boolean): void {
    const session: StoredSession = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1000,
    };
    this.logout();
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  }

  private readSession(): StoredSession | null {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  }
}
