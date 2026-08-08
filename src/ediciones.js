// Config central de todas las ediciones del concurso.
// Cada año nuevo: añadir una entrada al objeto EDICIONES, marcar la
// edición anterior como archivada: true, y cambiar EDICION_ACTIVA.

export const EDICION_ACTIVA = "2027";

export const EDICIONES = {
  "2026": {
    titulo: "Concurso de Tapas Reyes 2026",
    fechaEvento: "5 de Enero de 2026 (Noche de Reyes)",
    horaEvento: "A partir de las 18",
    lugarEvento: "Calle Palencia 13 2º B",
    plazoConfirmacion: "02/01/2026",
    aforoEsperado: 20,
    archivada: true,
  },
  "2027": {
    titulo: "Concurso de Tapas Reyes 2027",
    fechaEvento: "5 de Enero de 2027 (Noche de Reyes)",
    horaEvento: "A partir de las 18",
    lugarEvento: "Calle Palencia 13 2º B",
    plazoConfirmacion: "02/01/2027",
    aforoEsperado: 20,
    archivada: false,
  },
};

// Lista de ediciones archivadas, para el selector de la sección "Archivo"
export const EDICIONES_ARCHIVADAS = Object.keys(EDICIONES).filter(
  (key) => EDICIONES[key].archivada
);
