// Iconos SVG en línea, todos con el mismo trazo (2px) para que sean coherentes.
const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
});

export const IconoCorona = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z" />
  </svg>
);

export const IconoCalendario = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4" />
  </svg>
);

export const IconoCamara = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M4 8.5h3l1.5-2.5h7L17 8.5h3V19H4z" />
    <circle cx="12" cy="13.5" r="3.2" />
  </svg>
);

export const IconoPlato = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 14h18a8 8 0 0 1-8 6h-2a8 8 0 0 1-8-6z" />
    <path d="M8 10c0-2 2-2 2-4M12 10c0-2 2-2 2-4M16 10c0-2 2-2 2-4" />
  </svg>
);

export const IconoTrofeo = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
  </svg>
);

export const IconoCarpeta = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5H10l2 2h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  </svg>
);

export const IconoAlerta = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </svg>
);

export const IconoCheck = ({ size = 22 }) => (
  <svg {...base(size)} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconoInfo = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </svg>
);

export const IconoFlechaIzq = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconoPapelera = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </svg>
);

export const IconoRefrescar = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
  </svg>
);

export const IconoUbicacion = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export const IconoReloj = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconoX = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// Aviso en pantalla reutilizable: tipo = "exito" | "error" | "info"
export const Aviso = ({ tipo = "info", children }) => {
  const Icono = tipo === "exito" ? IconoCheck : tipo === "error" ? IconoAlerta : IconoInfo;
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === "error" ? "alert" : "status"}>
      <Icono size={18} />
      <div>{children}</div>
    </div>
  );
};

// Quita el emoji inicial (✅ ❌ ℹ️) de los mensajes antiguos para mostrarlos con icono
export const limpiarMensaje = (texto = "") =>
  texto.replace(/^(✅|❌|ℹ️|ℹ)\s*/u, "");

export const tipoMensaje = (texto = "") =>
  texto.includes("✅") ? "exito" : texto.includes("❌") ? "error" : "info";
