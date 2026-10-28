/** Reemplaza el elemento con el mismo id o agrega el elemento al final si no existe. */
export function upsert<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [...items, item];
}
