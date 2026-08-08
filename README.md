# 🍢 Concurso de Tapas

Aplicación web para gestionar el concurso familiar de tapas de Reyes: inscripción de tapas, votación por estrellas, confirmación de asistencia, ranking en vivo y archivo histórico de ediciones anteriores.

**🔗 App en vivo:** [albaeh-apps.github.io/app_concurso_tapas](https://albaeh-apps.github.io/app_concurso_tapas)

## Qué se puede hacer

- Confirmar asistencia al evento de la edición en curso.
- Inscribir una tapa con foto y descripción.
- Votar las tapas del resto de participantes (1 a 5 estrellas).
- Ver el ranking y podio en tiempo real.
- Consultar tapas y rankings de ediciones anteriores archivadas.
- (Admin) Gestionar participantes y ver el registro de accesos.

## Stack

- **Frontend:** React 19 (Create React App)
- **Datos:** Firebase / Firestore
- **Imágenes:** ImgBB
- **Despliegue:** GitHub Pages, automático vía GitHub Actions en cada push a `master`

## Documentación técnica

Arquitectura, modelo de datos, flujo de la app y guía de despliegue: ver [`DOCUMENTACION.md`](DOCUMENTACION.md).

Para preparar una nueva edición del concurso, ver la [sección 6 de la documentación técnica](DOCUMENTACION.md#6-qué-hay-que-cambiar-para-una-nueva-edición-ej-2028).

## Desarrollo local

```bash
npm install
npm start        # http://localhost:3000
```

Requiere un archivo `.env.local` con las claves de Firebase e ImgBB (ver [`DOCUMENTACION.md`](DOCUMENTACION.md) sección 1 y 8.6).

```bash
npm run build     # build de producción en /build
npm test          # tests
```
