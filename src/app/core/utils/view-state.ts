import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith } from 'rxjs';

import { ViewState } from '../models/common.model';

/** Convierte un Observable de datos en estados loading / ready / error. */
export function toViewState<T>(source: Observable<T>): Observable<ViewState<T>> {
  return source.pipe(
    map((data): ViewState<T> => ({ status: 'ready', data })),
    startWith<ViewState<T>>({ status: 'loading' }),
    catchError(() =>
      of<ViewState<T>>({
        status: 'error',
        message: 'No se pudo cargar la información. Intenta nuevamente.',
      }),
    ),
  );
}

/** Signal de ViewState. Debe llamarse en un contexto de inyección (campo de clase). */
export function viewStateSignal<T>(source: Observable<T>) {
  return toSignal(toViewState(source), { initialValue: { status: 'loading' } as ViewState<T> });
}
