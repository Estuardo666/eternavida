# Admin — Generador de QR

## Descripción

Página dedicada en el panel de administración para generar códigos QR personalizados de cualquier URL pública del sitio.

## Acceso

- **Sidebar admin → General → Generador de QR**
- URL directa: `/admin/qr-generator`
- Requiere autenticación admin/staff (Clerk)

## Entidades soportadas

| Tipo | Ejemplo URL |
|---|---|
| Páginas estáticas | Home, Acerca de Nosotros, Contacto, legales |
| Productos (detalle) | `/productos/acelga-ecuatoriana-500g` |
| Categorías (listado) | `/categorias/alimentos-organicos` |
| Colecciones (detalle) | `/colecciones/verano-2025` |

## Personalización disponible

- **Forma de puntos**: redondeado, puntos, cuadrado, elegante, elegante redondeado, extra redondeado
- **Esquinas externas**: extra redondeado, cuadrado, punto
- **Esquinas internas**: punto, cuadrado
- **Colores**: foreground y background con color picker + código hex
- **Gradiente**: activable, 2 colores, lineal
- **Logo central**: seleccionable desde la biblioteca de MediaAssets existente (imágenes)
- **Tamaño del logo**: slider 0.1–0.5 (fracción del QR)
- **Margen del logo**: slider 0–20px
- **Margen del QR**: slider 0–60px

## Output

- PNG 1080×1080px listo para descargar
- Nombre de archivo: `qr-<nombre-entidad>.png`
- QR apunta a la URL completa de la entidad seleccionada (con `NEXT_PUBLIC_SITE_URL`)

## Arquitectura

- **Generación**: 100% client-side con librería `qr-code-styling`
- **Preview en vivo**: se actualiza en cada cambio de configuración
- **Sin persistencia**: la configuración de estilo NO se guarda en DB
- **Logo**: se obtiene de la MediaAsset library existente, el MediaPickerModal se reutiliza desde `admin-content`

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `src/types/qr-generator.ts` | Tipos TypeScript del dominio QR |
| `src/services/qr-generator/get-qr-generator-data.ts` | Servicio server-side que recolecta entidades + media assets |
| `src/app/api/admin/qr-generator/route.ts` | API GET de datos (requiere auth) |
| `src/app/api/admin/qr-generator/proxy-image/route.ts` | Proxy server-side para imágenes de logo (bypass CORS) |
| `src/app/admin/(dashboard)/qr-generator/page.tsx` | Página admin (server component) |
| `src/features/qr-generator/components/qr-generator-view.tsx` | Componente cliente con controles + preview + descarga |
| `src/components/layout/admin-sidebar.tsx` | Nav item en sección "General" |

## Reutilización

- `MediaPickerModal` de `src/features/admin-content/components/media-picker-modal.tsx`
- `uploadMediaAsset` / `registerMediaAsset` de `src/services/admin-content/client.ts`
- `listMediaAssets` de `src/server/media/admin-media-library.repository.ts`
- `listAdminProductRecords` / `listAdminCategoryRecords` de `src/server/catalog/admin-catalog.repository.ts`
- `collectionRepository` de `src/server/collections/collection.repository.ts`
- Estilos admin de `src/components/admin/surface-styles.ts`
