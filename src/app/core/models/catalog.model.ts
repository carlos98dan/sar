import { Site } from './organization.model';

/** Categoría de recurso, por ejemplo "Salas de reuniones". Los recursos la referencian por nombre. */
export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

/** Tipo dentro de una categoría, por ejemplo "Sala de juntas" dentro de "Salas de reuniones". */
export interface ResourceType {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  active: boolean;
}

/** Sede con estado de activación. Extiende Site sin cambiar el modelo de la organización. */
export interface ManagedSite extends Site {
  active: boolean;
}

/** Ubicación dentro de una sede, por ejemplo "Piso 1, zona A". */
export interface SiteLocation {
  id: string;
  siteId: string;
  name: string;
  description: string;
  active: boolean;
}
