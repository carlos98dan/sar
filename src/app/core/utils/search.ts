/** Indica si el texto buscado aparece en alguno de los valores. Una búsqueda vacía coincide con todo. */
export function matchesQuery(query: string, values: string[]): boolean {
  const term = query.trim().toLowerCase();
  return !term || values.some((value) => value.toLowerCase().includes(term));
}
