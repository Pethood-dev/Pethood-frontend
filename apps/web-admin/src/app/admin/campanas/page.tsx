import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { ExportacionAdmin } from "@/components/dashboard/ExportacionAdmin";
import { ListaMock } from "@/components/ui/ListaMock";

export default async function CampanasAdminPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value ?? "";
  return (
    <ListaMock
      titulo="Campañas"
      descripcion="Campañas de donación de los refugios."
      columnas={[
        "Campaña",
        "Refugio",
        "Estado",
        "Objetivo",
        "Recaudado",
        "Vence",
      ]}
      accion={<ExportacionAdmin entidad="campanias" token={token} />}
      filas={[
        [
          "Alimento para invierno",
          "Refugio Huellitas",
          "Activa",
          "$150.000",
          "$92.000",
          "30/10/2026",
        ],
        [
          "Cirugía de Luna",
          "Refugio Patitas",
          "Activa",
          "$80.000",
          "$80.000",
          "15/10/2026",
        ],
        [
          "Techo nuevo",
          "Refugio Huellitas",
          "Inactiva",
          "$300.000",
          "$0",
          "01/11/2026",
        ],
        [
          "Vacunación anual",
          "Refugio Patitas",
          "Finalizada",
          "$60.000",
          "$60.000",
          "01/09/2026",
        ],
      ]}
    />
  );
}
