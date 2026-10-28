/** Acciones que el sistema controla por rol. */
export type PermissionId =
  | 'reservas.ver'
  | 'reservas.crear'
  | 'reservas.aprobar'
  | 'reservas.cancelar'
  | 'control.registrar'
  | 'recursos.gestionar'
  | 'sedes.gestionar'
  | 'bloqueos.gestionar'
  | 'incidencias.gestionar'
  | 'reglas.gestionar'
  | 'tarifas.gestionar'
  | 'flujos.gestionar'
  | 'organizacion.gestionar'
  | 'usuarios.gestionar'
  | 'roles.gestionar'
  | 'reportes.ver'
  | 'auditoria.ver';

export interface PermissionDef {
  id: PermissionId;
  /** Módulo del menú al que pertenece el permiso. */
  module: string;
  label: string;
}
