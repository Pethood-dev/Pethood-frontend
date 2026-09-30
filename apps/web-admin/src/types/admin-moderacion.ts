// Contrato: backend/docs/api-admin-moderacion.md
export interface Lista<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Duenio {
  tipo: "REFUGIO" | "ADOPTANTE";
  id: number;
  nombre: string;
}

export interface PublicacionAdmin {
  id: number;
  titulo: string;
  imagenUrl: string | null;
  estado: { id: number; nombre: string };
  mascota: { id: number; nombre: string; especie: string };
  publicador: Duenio;
  cantidadSolicitudes: number;
  cantidadReportes: number;
  fechaAlta: string;
  fechaBaja: string | null;
}

export type AccionPublicacion = "PAUSAR" | "REACTIVAR" | "FINALIZAR";

export interface MascotaAdmin {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  estado: { id: number; nombre: string };
  duenio: Duenio;
  tienePublicacionActiva: boolean;
  fechaAlta: string;
  fechaBaja: string | null;
}

export interface SolicitudAdmin {
  id: number;
  mascota: { id: number; nombre: string };
  solicitante: { id: number; nombre: string };
  refugio: { id: number; nombre: string } | null;
  tipo: string;
  estado: { id: number; nombre: string };
  fechaAlta: string;
}

export interface FiltrosModeracion {
  page?: number;
  limit?: number;
  q?: string;
  incluirBajas?: "true";
  tipo?: string;
  desde?: string;
  hasta?: string;
}
