import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { ExportacionAdmin } from "@/components/dashboard/ExportacionAdmin";
import { ListaMock } from "@/components/ui/ListaMock";

export default async function SolicitudesAdminPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value ?? "";
  return (
    <ListaMock
      titulo="Solicitudes"
      descripcion="Solicitudes de adopción y tránsito de toda la plataforma."
      columnas={[
        "Mascota",
        "Solicitante",
        "Refugio",
        "Tipo",
        "Estado",
        "Fecha",
      ]}
      accion={<ExportacionAdmin entidad="solicitudes" token={token} />}
      filas={[
        [
          "Firulais",
          "Lucía Pérez",
          "Refugio Huellitas",
          "Adopción",
          "Pendiente",
          "03/09/2026",
        ],
        [
          "Michi",
          "Ana Gómez",
          "Refugio Patitas",
          "Adopción",
          "Aprobada",
          "25/08/2026",
        ],
        [
          "Nala",
          "Juan Díaz",
          "Refugio Huellitas",
          "Tránsito",
          "En revisión",
          "30/08/2026",
        ],
        [
          "Luna",
          "Sofía Molina",
          "Refugio Patitas",
          "Adopción",
          "Rechazada",
          "12/08/2026",
        ],
      ]}
    />
  );
}
