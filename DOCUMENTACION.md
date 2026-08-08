# Documentación — App Concurso de Tapas

Aplicación web (React) para gestionar el concurso familiar de tapas de Reyes: inscripción de tapas, votación por estrellas, confirmación de asistencia, ranking y archivo histórico de ediciones anteriores.

- Repo: `app_concurso_tapas`
- Publicada en: GitHub Pages (`https://albaeh-apps.github.io/app_concurso_tapas`)
- Backend: Firebase (Firestore) + ImgBB (hosting de imágenes)

---

## 1. Stack técnico

| Pieza | Detalle |
|---|---|
| Frontend | React 19 (Create React App / `react-scripts`) |
| Base de datos | Firestore (proyecto Firebase `concurso-tapas-familiar`) |
| Imágenes | [ImgBB](https://imgbb.com) API (subida directa desde el navegador, sin backend propio) |
| Hosting | GitHub Pages, vía GitHub Actions (deploy automático al hacer push a `master`, ver sección 8) |
| Sesión | No hay autenticación real (sin Firebase Auth). El "login" es elegir un nombre de una lista y se guarda en `localStorage` |

No hay backend propio: todo el código corre en el navegador y habla directamente con Firestore e ImgBB. Las claves en `src/config.js` son públicas (claves de cliente), no credenciales secretas.

---

## 2. Estructura de carpetas relevante

```
src/
  App.js                  Layout principal, navegación por "secciones", cabecera/pie
  ediciones.js             ⭐ Config central de años del concurso (ver sección 4)
  config.js                Claves de Firebase e ImgBB
  firebase.js               Inicialización de Firebase (Firestore + Storage)
  components/
    Login.js                Selección de usuario / "login"
    ConfirmarAsistencia.js  Confirmar/cancelar asistencia al evento
    SubirFoto.js             Formulario de inscripción de una tapa
    TapaList.js               Listado de tapas concursantes (ordenado por media de voto)
    TapaCard.js                Tarjeta de una tapa: foto, estrellas, subir foto si falta
    VotarTapa.js                Widget de votar (1–5 estrellas) dentro de TapaCard
    Ranking.js                   Podio y clasificación completa
    Archivo.js                    Selector de ediciones archivadas + Tapas/Ranking en modo solo lectura
    RegistroAccesos.js            (admin) Historial de accesos a la app
    GestionarParticipantes.js     (admin) Alta/baja de participantes y permisos admin
  styles/                  Un .css por componente
```

---

## 3. Flujo de la aplicación

1. **Carga inicial** (`App.js`): comprueba si hay un usuario guardado en `localStorage` (`usuarioTapas`). Si no lo hay, muestra `Login`.
2. **Login** (`Login.js`): el usuario elige su nombre de una lista (cargada desde Firestore `configuracion/participantes`, o una lista por defecto si no existe). Al enviar:
   - Se registra un documento en la colección `accesos` (auditoría de quién entra y cuándo).
   - Se guarda `usuarioActivo` (nombre) en `localStorage` — lo usa `VotarTapa.js` para saber "quién vota".
   - Se guarda el objeto de usuario completo (`usuarioTapas`) en `localStorage` — controla la sesión.
3. **Navegación interna** (`App.js`): no usa `react-router`; es un estado `seccion` (`"inicio" | "asistencia" | "inscripciones" | "tapas" | "ranking" | "archivo" | "accesos" | "participantes"`) que decide qué componente pintar. Se sincroniza con `window.history` (pushState) y el hash de la URL para que el botón "atrás" del navegador/móvil funcione.
4. **Pantalla de inicio**: banner de "confirma tu asistencia" (si no lo ha hecho) y tarjetas de acceso a cada sección. Las tarjetas de administración (Registro de accesos, Gestionar participantes) solo aparecen si `usuario.esAdmin`. La tarjeta "Ediciones anteriores" solo aparece si existe al menos una edición archivada.
5. **Cierre de sesión**: borra `usuarioTapas` de `localStorage` y vuelve a Login.

### Roles

No hay roles de Firestore/seguridad reales: `esAdmin` es un booleano guardado por participante en `configuracion/participantes`, gestionado desde `GestionarParticipantes.js`. El frontend simplemente oculta/muestra secciones según ese flag — es un control de UI, no de seguridad (cualquiera con las reglas de Firestore adecuadas podría saltárselo). Es coherente con el contexto (app familiar de confianza).

---

## 4. Sistema de ediciones (años) — `src/ediciones.js`

Esta es la pieza clave para el mantenimiento año a año. Todo el resto de la app **no tiene el año hardcodeado**: lee siempre de aquí.

```js
export const EDICION_ACTIVA = "2027";

export const EDICIONES = {
  "2026": { titulo, fechaEvento, horaEvento, lugarEvento, plazoConfirmacion, aforoEsperado, archivada: true },
  "2027": { titulo, fechaEvento, horaEvento, lugarEvento, plazoConfirmacion, aforoEsperado, archivada: false },
};

export const EDICIONES_ARCHIVADAS = Object.keys(EDICIONES).filter(k => EDICIONES[k].archivada);
```

- `EDICION_ACTIVA`: el año "en curso" de la app (el que se usa por defecto en todas partes: título, footer, formularios nuevos, banner de asistencia, etc.).
- `EDICIONES`: datos de cada edición (título, fecha/hora/lugar del evento, plazo de confirmación, aforo esperado, y si está `archivada`).
- `EDICIONES_ARCHIVADAS`: se calcula solo, no se edita a mano — es la lista de años con `archivada: true`, y alimenta el selector de la sección "Archivo".

### Cómo se usa el año en el resto del código

Cada documento que se crea en Firestore lleva un campo `edicion` con el valor de `EDICION_ACTIVA` en el momento de crearlo:

| Colección Firestore | Campo `edicion` | Dónde se escribe |
|---|---|---|
| `tapas` | sí | `SubirFoto.js` |
| `votos` | sí | `VotarTapa.js` |
| `asistencias` | sí (también en el ID del doc: `${edicion}_${nombre}`) | `ConfirmarAsistencia.js` |
| `accesos` | sí | `Login.js` |
| `configuracion/participantes` | **no** — es un único documento global, compartido por todas las ediciones | `GestionarParticipantes.js` |

Y al leer, los componentes filtran por ese campo:

- `TapaList`, `Ranking`: reciben un prop opcional `edicion` (por defecto `EDICION_ACTIVA`) y filtran Firestore con `where("edicion", "==", edicion)`. Esto es lo que permite reutilizarlos tanto en la vista normal (edición activa) como en `Archivo.js` (edición pasada elegida por el usuario), sin duplicar código.
- `ConfirmarAsistencia`, `App.js` (estadísticas del banner): filtran siempre por `EDICION_ACTIVA`.
- `RegistroAccesos.js` (admin): **no filtra por edición** — muestra todos los accesos de todas las ediciones juntos, ordenados por fecha. Es así a propósito o por omisión; si se quiere ver accesos solo de un año habría que añadir el filtro.

Como cada documento queda "marcado" con su año, **no hace falta migrar ni borrar datos al cambiar de edición**: los datos antiguos se quedan en las mismas colecciones y siguen siendo consultables desde "Archivo" en modo solo lectura (prop `soloLectura` en `TapaCard`/`TapaList`, que oculta el formulario de subir foto y el widget de voto).

### Ejemplo concreto: ¿cómo sabe la app qué tapas son de 2027 cuando ya esté en 2028?

No hay una tabla separada por año: `tapas` y `votos` son colecciones únicas donde conviven documentos de todos los años, y lo que separa unos de otros es el campo `edicion` de cada documento, más el hecho de que cada `tapaId` (ID autogenerado por Firestore) es único y no se reutiliza nunca entre ediciones.

1. **Crear tapa** (`SubirFoto.js`): `addDoc(collection(db, "tapas"), { ..., edicion: EDICION_ACTIVA })` → si es 2027, el doc queda con `edicion: "2027"` y un ID único, p.ej. `abc123`.
2. **Votar esa tapa** (`VotarTapa.js`): `addDoc(collection(db, "votos"), { tapaId: "abc123", userName, puntuacion, edicion: EDICION_ACTIVA })` → el voto queda ligado a `tapaId: "abc123"`, que solo existe como tapa de 2027.
3. **Listar tapas** (`TapaList.js`, `Ranking.js`): filtran `where("edicion", "==", edicion)` sobre `tapas` — esto es lo que decide qué año se ve.
4. **Calcular la media de una tapa** (`TapaCard.js`, `TapaList.js`, `Ranking.js`): filtran `where("tapaId", "==", tapa.id)` sobre `votos` — no necesitan filtrar por `edicion` porque ese `tapaId` ya pertenece en exclusiva a una tapa (y por tanto a un año) concreto.

Al cambiar `EDICION_ACTIVA` a `"2028"`: las pantallas normales (inicio → Tapas/Ranking) llaman a `TapaList`/`Ranking` sin pasar `edicion`, así que usan el valor por defecto (`"2028"`) y solo muestran tapas/votos de 2028. Las tapas de 2027 no se mueven ni se borran; simplemente dejan de aparecer ahí porque su `edicion` es `"2027"`. Solo vuelven a verse entrando en **Archivo**, que pasa explícitamente `edicion="2027"` a esos mismos componentes con `soloLectura` activo — y por eso, además, ya no se puede seguir votando tapas de una edición archivada (`TapaCard` no renderiza `VotarTapa` cuando `soloLectura` es `true`).

---

## 5. Detalle por componente

**`Login.js`** — Carga la lista de participantes desde `configuracion/participantes` (o usa 4 nombres por defecto si el documento no existe). Al elegir nombre y enviar, registra el acceso y crea la sesión local. No hay contraseña.

**`ConfirmarAsistencia.js`** — Permite confirmar o cancelar la asistencia al evento de la edición activa. Un documento por persona y edición (ID `edicion_nombre`, así no choca con confirmaciones de otros años). Muestra lista de confirmados, barra de progreso frente al `aforoEsperado`, y detalles del evento (fecha/hora/lugar) sacados de `ediciones.js`.

**`SubirFoto.js`** — Formulario de inscripción de una tapa: nombre, descripción, foto opcional. La foto se sube a ImgBB (base64 vía `FileReader` → `fetch` a `api.imgbb.com`) y se guarda la URL resultante en el documento de Firestore. Límite 5MB, solo imágenes.

**`TapaList.js` / `TapaCard.js`** — Lista todas las tapas de una edición, ordenadas por media de votos (descendente). Cada `TapaCard` calcula su propia media en tiempo real (`onSnapshot` sobre `votos`), muestra medalla si está en el top 3, permite subir foto si la tapa no tiene una todavía (salvo en modo `soloLectura`), e incluye el widget de voto (`VotarTapa`) salvo en modo solo lectura.

**`VotarTapa.js`** — Vota de 1 a 5 estrellas. Usa dos identificadores guardados en `localStorage`: `deviceId` (por dispositivo, se genera una vez) y `usuarioActivo` (el nombre elegido en el login). El voto se guarda como `{ tapaId, userName, deviceId, puntuacion, edicion }`, y antes de permitir votar comprueba si ya existe un voto de ese `userName` para esa tapa (para impedir votar dos veces la misma tapa con el mismo nombre). No hay reglas de seguridad en Firestore que lo impidan a nivel de servidor, es control de cliente.

**`Ranking.js`** — Calcula medias de voto por tapa para una edición y muestra podio (top 3) + lista del resto. Igual que `TapaList`, acepta `edicion` como prop para poder mostrar rankings históricos desde `Archivo.js`.

**`Archivo.js`** — Selector de edición archivada (`EDICIONES_ARCHIVADAS`) + pestañas Tapas/Ranking, reutilizando `TapaList` y `Ranking` con `soloLectura`/edición fija. Si no hay ninguna edición archivada, muestra un mensaje y no se ofrece la tarjeta "Ediciones anteriores" en el inicio.

**`RegistroAccesos.js`** *(solo admin)* — Tabla de accesos (`accesos`) con nombre, fecha y navegador detectado, con buscador por nombre y contador de usuarios únicos. No está filtrado por edición (ver nota en sección 4).

**`GestionarParticipantes.js`** *(solo admin)* — Alta/baja de participantes y toggle de `esAdmin`, sobre el documento único `configuracion/participantes`. Esta lista es **global**, no por edición: si cambian los participantes de un año a otro, hay que actualizarla a mano aquí (ver sección 6).

---

## 6. Qué hay que cambiar para una nueva edición (ej. 2028)

La edición **2027 ya está configurada** (`EDICION_ACTIVA = "2027"` en `src/ediciones.js`, con `archivada: false`, y "2026" ya marcada como `archivada: true`).

Gracias a que todo el código depende de `ediciones.js` (sección 4), preparar **2028** es, en el caso normal, un cambio de **un solo archivo**:

### Paso obligatorio: `src/ediciones.js`

```js
export const EDICION_ACTIVA = "2028";   // 1. cambiar el año activo

export const EDICIONES = {
  "2026": { ...  archivada: true },
  "2027": {                              // 2. archivar la edición 2027
    titulo: "Concurso de Tapas Reyes 2027",
    fechaEvento: "5 de Enero de 2027 (Noche de Reyes)",
    horaEvento: "A partir de las 18",
    lugarEvento: "Calle Palencia 13 2º B",
    plazoConfirmacion: "02/01/2027",
    aforoEsperado: 20,
    archivada: true,                     // ← antes false
  },
  "2028": {                              // 3. añadir la nueva edición
    titulo: "Concurso de Tapas Reyes 2028",
    fechaEvento: "5 de Enero de 2028 (Noche de Reyes)",
    horaEvento: "A partir de las 18",     // ajustar si cambia
    lugarEvento: "Calle Palencia 13 2º B", // ajustar si cambia
    plazoConfirmacion: "02/01/2028",       // ajustar si cambia
    aforoEsperado: 20,                     // ajustar si cambia
    archivada: false,
  },
};
```

Con esto, automáticamente:
- El título de cabecera, login y footer pasan a mostrar 2028.
- Las nuevas tapas, votos, asistencias y accesos que se creen quedan marcados `edicion: "2028"`, sin tocar ni migrar los datos de 2026/2027 (que se quedan intactos en Firestore).
- "Archivo" empieza a ofrecer 2027 (además de 2026) como edición consultable en modo solo lectura.
- No hace falta tocar `App.js`, `TapaList.js`, `Ranking.js`, `ConfirmarAsistencia.js`, `SubirFoto.js`, `VotarTapa.js`, ni `Login.js` — todos leen el año de `ediciones.js`.

### Pasos adicionales a revisar (no son código, pero conviene hacerlos)

1. **Lista de participantes** (`GestionarParticipantes.js`, colección `configuracion/participantes`): es **global**, no se resetea entre ediciones. Si cambian los participantes de un año a otro (alguien nuevo, alguien que ya no viene), hay que actualizarla a mano desde esa pantalla antes de abrir la edición 2028.
2. **Volver a desplegar**: no hace falta ningún paso manual — al hacer `git push` a `master`, el workflow de GitHub Actions compila y publica solo (ver sección 8).
3. *(Opcional, no bloqueante)* Revisar `notas.txt`, que ya recoge mejoras pendientes (contraseña de admin, ventana de fechas para votar, etc.) por si se quieren abordar antes de 2028.

### Cosas que **no** haría falta cambiar

- No hay que crear colecciones nuevas en Firestore ni limpiar las existentes: el campo `edicion` en cada documento ya separa los años dentro de las mismas colecciones (`tapas`, `votos`, `asistencias`, `accesos`).
- No hay que tocar credenciales de Firebase/ImgBB (`config.js`, `firebase.js`) salvo que cambien los proyectos/servicios usados.

---

## 8. Despliegue en GitHub Pages vía GitHub Actions (guía replicable)

Este proyecto empezó publicándose con el paquete `gh-pages` (opción de Pages **"Deploy from a branch"**): había que ejecutar `npm run deploy` a mano cada vez, que compilaba localmente y subía `build/` a una rama `gh-pages`. Se migró a la opción **"GitHub Actions"**: cada `git push` a `master` dispara un workflow que compila y publica solo, sin pasos manuales.

Estos son los pasos seguidos, generalizados para poder repetirlos en cualquier otro proyecto de Create React App desplegado en GitHub Pages.

### 8.1 Diferencia entre las dos opciones de Pages

| | Deploy from a branch | GitHub Actions |
|---|---|---|
| Dónde se compila | En tu máquina (`npm run deploy`) | En un runner de GitHub, en cada push |
| Riesgo de olvido | Sí — si no ejecutas el comando, el sitio queda desactualizado | No — se dispara solo |
| Secretos/claves | Van en tu `.env`/`config.js` local, nunca pasan por GitHub | Se gestionan como **Secrets** del repo, inyectados solo durante el build |
| Historial de despliegues | Solo el commit automático en la rama `gh-pages` | Pestaña **Actions**, con logs de cada build |

### 8.2 Comprobaciones previas

Antes de tocar nada, verificar que coinciden:
- El remoto `origin` del repo local (`git remote -v`).
- El campo `"homepage"` de `package.json` (de dónde CRA calcula las rutas de los assets).
- La URL donde realmente vive el sitio publicado.

Si no coinciden (por ejemplo, tras mover el repo a otra cuenta/organización), corregir el remoto (`git remote set-url origin <url-correcta>`) y el `homepage` **antes** de seguir.

### 8.3 Crear el workflow

Archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]   # o "main", según el repo
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build
        env:
          CI: false   # evita que los warnings de ESLint rompan el build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 8.4 Cambiar el "Source" de Pages

En el repo de GitHub: **Settings → Pages → Build and deployment → Source** → cambiar de "Deploy from a branch" a **"GitHub Actions"**. Sin este paso, el workflow compila pero no publica.

### 8.5 Quitar el método antiguo

En `package.json`:
- Eliminar el script `predeploy` y `deploy` (`gh-pages -d build`).
- Desinstalar la dependencia: `npm uninstall gh-pages`.

La rama `gh-pages` remota puede borrarse una vez confirmado que el nuevo método funciona (no es obligatorio, solo limpieza).

### 8.6 Claves/API keys: de archivo local a GitHub Secrets

Si el proyecto tiene un archivo tipo `src/config.js` con claves (Firebase, APIs de terceros) excluido del repo por `.gitignore`, el build en Actions falla porque ese archivo no existe en el runner (`Module not found`). Con un repo **público**, la solución correcta no es commitear el archivo con las claves reales, sino:

1. Reescribir el archivo de configuración para leer variables de entorno con prefijo `REACT_APP_` (obligatorio en CRA para que lleguen al bundle del navegador):
   ```js
   export const FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
   ```
2. Quitar ese archivo del `.gitignore` y commitearlo (ya no contiene secretos, solo referencias a `process.env`).
3. Crear un `.env.local` (gitignorado por defecto en CRA) con los valores reales, para que `npm start`/`npm run build` sigan funcionando en local.
4. Crear un **Secret** por cada variable en **Settings → Secrets and variables → Actions → New repository secret**, con el mismo nombre (`REACT_APP_...`).
5. Pasarlos al paso de build del workflow:
   ```yaml
   - run: npm run build
     env:
       CI: false
       REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
       # ...una línea por cada secret
   ```

Nota: las claves de cliente de Firebase no son secretas en sentido estricto (viajan igualmente en el JS público del sitio); lo que sí conviene mantener fuera del historial de git son claves con capacidad de escritura/abuso (p. ej. una API key de subida de imágenes de terceros).

### 8.7 Checklist para replicar en otro proyecto

- [ ] Confirmar que `origin` y `homepage` apuntan al repo/URL reales.
- [ ] Añadir `.github/workflows/deploy.yml` (plantilla de 8.3, ajustando la rama si no es `master`).
- [ ] Cambiar Source de Pages a "GitHub Actions".
- [ ] Quitar `gh-pages` de `package.json` y del proyecto.
- [ ] Si hay claves/config con secretos: migrar a `process.env.REACT_APP_*` + `.env.local` local + Secrets en GitHub + inyectarlos en el paso de build.
- [ ] Hacer push y comprobar la pestaña **Actions** hasta ver el deploy en verde.

---

## 9. Notas / comportamientos a tener en cuenta

- **Sin autenticación real**: el "login" es solo elegir un nombre de una lista; cualquiera puede entrar como cualquier participante si conoce/ve la lista. Es aceptable para un uso familiar de confianza, pero no es seguridad real.
- **`RegistroAccesos.js` no filtra por edición**: aunque cada acceso se guarda con su `edicion`, la pantalla de admin siempre muestra el histórico completo de todos los años mezclado.
- **Un solo dispositivo/foto por tapa**: `TapaCard` solo deja subir foto si la tapa no tiene ya una (`!tapa.fotoURL`); no hay forma de reemplazar una foto ya subida desde la UI normal (sí se podría sobrescribir el documento a mano en Firestore).
- **Votos**: la restricción de "un voto por persona y tapa" se basa en el nombre (`userName`), no en el dispositivo — si dos personas comparten el mismo dispositivo pero inician sesión con nombres distintos, ambas pueden votar.
