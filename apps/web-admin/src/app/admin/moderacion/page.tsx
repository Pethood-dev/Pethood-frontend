import { ListaMock } from "@/components/ui/ListaMock";

// HU-3.1 a HU-3.7 — falta resolver/suspender/eliminar; ReporteProblema aún sin módulo en el backend.
export default function ModeracionAdminPage() {
  return (
    <ListaMock
      titulo="Moderación"
      descripcion="Reportes de publicaciones, usuarios y reseñas pendientes de revisión."
      columnas={["Tipo", "Reportado", "Motivo", "Estado", "Fecha"]}
      filas={[
        ["Publicación", "Dar en adopción a Toby", "Contenido engañoso", "Pendiente", "02/09/2026"],
        ["Usuario", "Carlos Ruiz", "Maltrato animal", "Pendiente", "31/08/2026"],
        ["Reseña", "Reseña #48", "Lenguaje ofensivo", "Resuelto", "20/08/2026"],
      ]}
    />
  );
}
