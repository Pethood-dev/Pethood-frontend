import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { ExportacionAdmin } from "@/components/dashboard/ExportacionAdmin";
import { ListaMock } from "@/components/ui/ListaMock";

export default async function MascotasAdminPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value ?? "";
  return (
    <ListaMock
      titulo="Mascotas"
      descripcion="Todas las mascotas registradas en la plataforma."
      columnas={["Nombre", "Especie", "Estado", "Dueño", "Alta"]}
      accion={<ExportacionAdmin entidad="mascotas" token={token} />}
      filas={[
        ["Firulais", "Perro", "Disponible", "Refugio Huellitas", "01/09/2026"],
        ["Michi", "Gato", "Adoptado", "Ana Gómez", "28/08/2026"],
        ["Luna", "Perro", "En tratamiento", "Refugio Patitas", "15/08/2026"],
        ["Nala", "Gato", "Disponible", "Refugio Huellitas", "02/08/2026"],
      ]}
    />
  );
}
