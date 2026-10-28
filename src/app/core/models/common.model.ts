/** Estado de una petición para la vista: carga, error o datos listos. */
export type ViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };
