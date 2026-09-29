import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { ExportacionAdmin } from "@/components/dashboard/ExportacionAdmin";
import { ListaMock } from "@/components/ui/ListaMock";

export default async function PublicacionesAdminPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value ?? "";
  return (
    <ListaMock
      titulo="Publicaciones"
      descripcion="Avisos de adopción de refugios y adoptantes."
      columnas={[
        "Título",
        "Mascota",
        "Publica",
        "Estado",
        "Solicitudes",
        "Fecha",
      ]}
      accion={<ExportacionAdmin entidad="publicaciones" token={token} />}
      filas={[
        [
          "Firulais busca hogar",
          "Firulais",
          "Refugio Huellitas",
          "Activa",
          "4",
          "01/09/2026",
        ],
        [
          "Gatita cariñosa",
          "Nala",
          "Refugio Huellitas",
          "Pausada",
          "1",
          "20/08/2026",
        ],
        [
          "Dar en adopción a Toby",
          "Toby",
          "Carlos Ruiz",
          "Activa",
          "0",
          "10/08/2026",
        ],
        [
          "Luna necesita familia",
          "Luna",
          "Refugio Patitas",
          "Finalizada",
          "6",
          "01/07/2026",
        ],
      ]}
    />
  );
}
