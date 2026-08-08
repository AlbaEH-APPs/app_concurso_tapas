← [Volver al README principal](../README.md)

# Documentación técnica — [Nombre de la app]

> Plantilla genérica extraída de `app_concurso_tapas` (donde la documentación técnica vive en `DOCUMENTACION.md`, en la raíz del repo). Copiar como `DOCUMENTACION.md` (o `docs/README.md`, según el convenio que uses en ese repo) y rellenar las secciones que apliquen — no todas las apps tendrán las 8 secciones (p. ej. una app sin backend propio no necesita la sección de API, una app no desplegada no necesita la sección de despliegue).

[Una o dos frases: qué es la app, a quién sirve.]

- Repo: `nombre-del-repo`
- Publicada en: [URL en vivo, o "no desplegada / uso local", o "privada, autoalojada en ___"]
- Backend: [Firebase / API propia / ninguno — persistencia en localStorage, Google Drive, etc.]

---

## 1. Stack técnico

| Pieza | Detalle |
|---|---|
| Frontend | |
| Backend / datos | |
| Otros servicios | |
| Hosting | |
| Autenticación | |

---

## 2. Estructura de carpetas relevante

```
[árbol de carpetas con una línea de comentario por archivo/carpeta clave]
```

---

## 3. Flujo de la aplicación

[Cómo arranca, pantallas/secciones principales, navegación, roles si los hay.]

---

## 4. Modelo de datos

[Colecciones/tablas principales, campos clave, relaciones. Solo si aplica.]

---

## 5. Detalle por componente / módulo

[Una entrada por componente o módulo no trivial: qué hace, de dónde lee, a dónde escribe.]

---

## 6. Runbook — tareas de mantenimiento habituales

[P. ej. "cómo preparar una nueva edición/temporada", "cómo añadir un nuevo tipo de gasto", etc. — lo que se repite periódicamente y conviene no tener que redescubrir cada vez.]

---

## 7. Variables de entorno / secrets

| Variable | Para qué sirve | Dónde se configura |
|---|---|---|
| | | |

---

## 8. Despliegue

[Guía paso a paso de cómo se despliega. Si usa GitHub Actions + GitHub Pages, ver la guía replicable completa en `app_concurso_tapas/DOCUMENTACION.md` sección 8 — se puede copiar tal cual ajustando nombres.]

---

## 9. Notas / comportamientos a tener en cuenta

[Decisiones deliberadas que podrían parecer bugs, limitaciones conocidas, deuda técnica asumida a propósito.]
