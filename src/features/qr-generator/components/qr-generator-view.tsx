"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  Download,
  Palette,
  Shapes,
  QrCode,
  Image as ImageIcon,
  Loader2,
  Search,
} from "lucide-react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { MediaPickerModal } from "@/features/admin-content/components/media-picker-modal";
import { uploadMediaAsset } from "@/services/admin-content/client";
import { cx } from "@/lib/utils";
import type {
  QrDotType,
  QrCornerSquareType,
  QrCornerDotType,
  QrEntityOption,
  QrStyleConfig,
  QrGeneratorData,
} from "@/types/qr-generator";
import {
  QR_DEFAULT_STYLE,
  QR_DOT_TYPE_OPTIONS,
  QR_CORNER_SQUARE_OPTIONS,
  QR_CORNER_DOT_OPTIONS,
} from "@/types/qr-generator";
import type { AdminMediaAssetSummary } from "@/types/admin-home-content";

import type QRCodeStylingType from "qr-code-styling";

// Stable reference — React never reconciles children of this container
const QR_CONTAINER_PROPS = { dangerouslySetInnerHTML: { __html: "" } } as const;

interface QrGeneratorViewProps {
  initialData: QrGeneratorData;
}

type QrEntityTypeLabel = "Página estática" | "Producto" | "Categoría" | "Colección" | "Post de blog" | "Categoría blog";

function getEntityTypeLabel(entityType: QrEntityOption["entityType"]): QrEntityTypeLabel {
  switch (entityType) {
    case "product":
      return "Producto";
    case "category":
      return "Categoría";
    case "collection":
      return "Colección";
    case "static-page":
      return "Página estática";
    case "blog-post":
      return "Post de blog";
    case "blog-category":
      return "Categoría blog";
  }
}

function groupEntityOptions(options: QrEntityOption[]): Map<string, QrEntityOption[]> {
  const groups = new Map<string, QrEntityOption[]>();

  for (const option of options) {
    const label = getEntityTypeLabel(option.entityType);
    const group = groups.get(label);
    if (group) {
      group.push(option);
    } else {
      groups.set(label, [option]);
    }
  }

  return groups;
}

// Module-level — no component deps, safe outside render
function buildQrOptions(url: string, style: QrStyleConfig, size = 1080, logoDataUrl = "") {
  const dotsOptions: Record<string, unknown> = {
    type: style.dotType,
    color: style.foregroundColor,
  };

  if (style.gradientEnabled) {
    dotsOptions.gradient = {
      type: "linear",
      colorStops: [
        { offset: 0, color: style.gradientColor1 },
        { offset: 1, color: style.gradientColor2 },
      ],
    };
  }

  const options: Record<string, unknown> = {
    type: "canvas",
    shape: "square",
    width: size,
    height: size,
    margin: style.margin,
    data: url,
    qrOptions: {
      typeNumber: 0,
      errorCorrectionLevel: "Q",
    },
    dotsOptions,
    cornersSquareOptions: {
      type: style.cornerSquareType,
      color: style.gradientEnabled ? style.gradientColor1 : style.foregroundColor,
    },
    cornersDotOptions: {
      type: style.cornerDotType,
      color: style.gradientEnabled ? style.gradientColor1 : style.foregroundColor,
    },
    backgroundOptions: {
      color: style.backgroundColor,
    },
  };

  if (logoDataUrl) {
    options.image = logoDataUrl;
    options.imageOptions = {
      hideBackgroundDots: true,
      imageSize: style.logoSize,
      margin: style.logoMargin,
    };
  }

  return options;
}

function ColorPickerField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-body-sm text-text-secondary">{props.label}</span>
      <span className="relative flex items-center">
        <input
          type="color"
          value={props.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-border-soft bg-transparent"
        />
        <span className="pointer-events-none ml-2 font-mono text-caption text-text-tertiary">
          {props.value.toUpperCase()}
        </span>
      </span>
    </label>
  );
}

function SelectField<T extends string>(props: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-body-sm text-text-secondary">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
        className={cx(
          "w-full rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary",
          "transition-[border-color] duration-150 hover:border-border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand",
        )}
      >
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeField(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between">
        <span className="text-body-sm text-text-secondary">{props.label}</span>
        <span className="font-mono text-caption text-text-tertiary">
          {props.value}{props.unit ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border-soft accent-brand-primary"
      />
    </label>
  );
}

function PanelSection(props: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-label-sm text-text-primary">
        {props.icon}
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

export function QrGeneratorView({ initialData }: QrGeneratorViewProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStylingType | null>(null);

  // State
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [style, setStyle] = useState<QrStyleConfig>(QR_DEFAULT_STYLE);
  const [allMediaAssets, setAllMediaAssets] = useState<AdminMediaAssetSummary[]>(initialData.mediaAssets);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [previewSize, setPreviewSize] = useState(380);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");

  // Pre-fetch logo as data URL via server proxy (bypasses CORS)
  useEffect(() => {
    const url = style.logoMediaAssetPublicUrl;
    if (!url) {
      setLogoDataUrl("");
      setLogoError("");
      return;
    }

    let cancelled = false;

    fetch(`/api/admin/qr-generator/proxy-image?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) {
            setLogoDataUrl(reader.result as string);
            setLogoError("");
          }
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        if (!cancelled) {
          setLogoDataUrl("");
          setLogoError("No se pudo cargar el logo. Verifica la configuración del servidor.");
        }
      });

    return () => { cancelled = true; };
  }, [style.logoMediaAssetPublicUrl]);

  // Track wrapper size for QR preview
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const size = Math.floor(entry.contentRect.width);
        if (size > 0) setPreviewSize(size);
      }
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Derived
  const entityGroups = groupEntityOptions(initialData.entityOptions);

  const filteredGroups = new Map<string, QrEntityOption[]>();
  for (const [groupLabel, items] of entityGroups) {
    const filtered = searchQuery
      ? items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : items;
    if (filtered.length > 0) {
      filteredGroups.set(groupLabel, filtered);
    }
  }

  const selectedEntity = initialData.entityOptions.find((e) => e.id === selectedEntityId) ?? null;

  const updateStyle = useCallback(<K extends keyof QrStyleConfig>(key: K, value: QrStyleConfig[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  }, []);

  // --- QR code lifecycle ---
  // Re-create QR when entity or style changes.
  // Container uses dangerouslySetInnerHTML → React never touches its children.
  useEffect(() => {
    if (!selectedEntity || typeof window === "undefined") return;

    let cancelled = false;

    import("qr-code-styling").then((mod) => {
      if (cancelled) return;
      const QRCodeStyling = mod.default;

      const container = containerRef.current;
      if (!container) return;

      const qrOptions = buildQrOptions(selectedEntity.url, style, previewSize, logoDataUrl);
      const qrCode = new QRCodeStyling(qrOptions);

      // Clear previous QR DOM nodes (library owns this subtree)
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      qrCode.append(container);
      qrRef.current = qrCode;
      setQrLoaded(true);
    });

    return () => {
      cancelled = true;
      // Remove QR library DOM nodes synchronously.
      // Because the container uses dangerouslySetInnerHTML, React's commit phase
      // will NOT try to reconcile these children, so this cleanup is safe.
      const container = containerRef.current;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      qrRef.current = null;
    };
  }, [selectedEntity, style, previewSize, logoDataUrl]);

  useEffect(() => {
    setAllMediaAssets(initialData.mediaAssets);
  }, [initialData.mediaAssets]);

  // --- Handlers ---
  const handleLogoSelect = useCallback((asset: AdminMediaAssetSummary) => {
    updateStyle("logoMediaAssetId", asset.id);
    updateStyle("logoMediaAssetPublicUrl", asset.publicUrl ?? "");
    setIsMediaPickerOpen(false);
  }, [updateStyle]);

  const handleLogoRemove = useCallback(() => {
    updateStyle("logoMediaAssetId", "");
    updateStyle("logoMediaAssetPublicUrl", "");
  }, [updateStyle]);

  const handleMediaUpload = useCallback(
    async (file: File, input: Parameters<typeof uploadMediaAsset>[1]) => {
      const result = await uploadMediaAsset(file, input);
      setAllMediaAssets((prev) => [result, ...prev]);
      return result;
    },
    [],
  );

  const handleDownload = useCallback(async () => {
    if (!selectedEntity || typeof window === "undefined") return;

    const safeName = selectedEntity.label
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    // Create temporary QR at 1080x1080 for download
    const mod = await import("qr-code-styling");
    const QRCodeStyling = mod.default;
    const qrOptions = buildQrOptions(selectedEntity.url, style, 1080, logoDataUrl);
    const downloadQr = new QRCodeStyling(qrOptions);
    await downloadQr.download({ name: `qr-${safeName}`, extension: "png" });
  }, [selectedEntity, style, logoDataUrl]);

  const selectedLogoAsset = allMediaAssets.find((a) => a.id === style.logoMediaAssetId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-lg text-text-primary">Generador de QR</h1>
        <p className="text-body-md text-text-secondary">
          Selecciona una página o producto, personaliza el estilo y descarga el código QR en PNG 1080×1080.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
        {/* Controls */}
        <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex flex-col gap-6")}>
          {/* Entity selector */}
          <PanelSection title="Seleccionar destino" icon={<QrCode className="h-4 w-4" />}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Buscar producto, categoría, página..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border-soft bg-surface-canvas py-2.5 pl-10 pr-3.5 text-body-md text-text-primary transition-[border-color] duration-150 placeholder:text-text-tertiary hover:border-border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </div>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className={cx(
                "w-full rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary",
                "transition-[border-color] duration-150 hover:border-border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand",
              )}
            >
              <option value="">— Seleccionar —</option>
              {[...filteredGroups.entries()].map(([groupLabel, items]) => (
                <optgroup key={groupLabel} label={groupLabel}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedEntity && (
              <div className="rounded-lg border border-border-soft/60 bg-surface-subtle px-3.5 py-2.5">
                <p className="text-caption text-text-tertiary">URL del QR:</p>
                <p className="break-all font-mono text-body-sm text-text-secondary">{selectedEntity.url}</p>
              </div>
            )}
          </PanelSection>

          {/* Shape */}
          <PanelSection title="Forma" icon={<Shapes className="h-4 w-4" />}>
            <SelectField
              label="Estilo de puntos"
              value={style.dotType}
              options={QR_DOT_TYPE_OPTIONS}
              onChange={(v) => updateStyle("dotType", v as QrDotType)}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Esquinas externas"
                value={style.cornerSquareType}
                options={QR_CORNER_SQUARE_OPTIONS}
                onChange={(v) => updateStyle("cornerSquareType", v as QrCornerSquareType)}
              />
              <SelectField
                label="Esquinas internas"
                value={style.cornerDotType}
                options={QR_CORNER_DOT_OPTIONS}
                onChange={(v) => updateStyle("cornerDotType", v as QrCornerDotType)}
              />
            </div>
            <RangeField
              label="Margen"
              value={style.margin}
              min={0}
              max={60}
              step={2}
              unit="px"
              onChange={(v) => updateStyle("margin", v)}
            />
          </PanelSection>

          {/* Colors */}
          <PanelSection title="Colores" icon={<Palette className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <ColorPickerField
                label="Primer plano"
                value={style.foregroundColor}
                onChange={(v) => updateStyle("foregroundColor", v)}
              />
              <ColorPickerField
                label="Fondo"
                value={style.backgroundColor}
                onChange={(v) => updateStyle("backgroundColor", v)}
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={style.gradientEnabled}
                onChange={(e) => updateStyle("gradientEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border-default accent-brand-primary"
              />
              <span className="text-body-sm text-text-secondary">Activar gradiente</span>
            </label>
            {style.gradientEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <ColorPickerField
                  label="Color gradiente 1"
                  value={style.gradientColor1}
                  onChange={(v) => updateStyle("gradientColor1", v)}
                />
                <ColorPickerField
                  label="Color gradiente 2"
                  value={style.gradientColor2}
                  onChange={(v) => updateStyle("gradientColor2", v)}
                />
              </div>
            )}
          </PanelSection>

          {/* Logo */}
          <PanelSection title="Logo central" icon={<ImageIcon className="h-4 w-4" />}>
            {style.logoMediaAssetPublicUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border-soft bg-surface-subtle">
                  <img
                    src={style.logoMediaAssetPublicUrl}
                    alt="Logo seleccionado"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-body-sm text-text-primary truncate max-w-[200px]">
                    {selectedLogoAsset?.altText || selectedLogoAsset?.storageKey || "Logo seleccionado"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "w-full")}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Seleccionar desde biblioteca
              </button>
            )}
            {logoError && (
              <div className="rounded-lg border border-status-error/30 bg-status-error/5 px-3.5 py-2.5 text-body-sm text-status-error">
                {logoError}
              </div>
            )}
            {style.logoMediaAssetPublicUrl && (
              <>
                <RangeField
                  label="Tamaño del logo"
                  value={style.logoSize}
                  min={0.1}
                  max={0.5}
                  step={0.02}
                  onChange={(v) => updateStyle("logoSize", v)}
                />
                <RangeField
                  label="Margen del logo"
                  value={style.logoMargin}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                  onChange={(v) => updateStyle("logoMargin", v)}
                />
              </>
            )}
          </PanelSection>
        </div>

        {/* Preview + Download */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex flex-col items-center gap-5")}>
            <p className="text-label-sm text-text-secondary">
              {selectedEntity
                ? `QR para: ${selectedEntity.label}`
                : "Selecciona un destino para generar el QR"}
            </p>
            {/* Container isolated from React via dangerouslySetInnerHTML.
                qr-code-styling injects raw SVG here; React never tracks these children. */}
            <div ref={wrapperRef} className="relative flex aspect-square w-full max-w-[380px] items-center justify-center rounded-xl border border-border-soft bg-white">
              <div
                ref={containerRef}
                {...QR_CONTAINER_PROPS}
                className="absolute inset-0"
              />
              {!qrLoaded && (
                <Loader2 className="relative z-10 h-8 w-8 animate-spin text-text-tertiary" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!selectedEntity || !qrLoaded}
            className={cx(ADMIN_BUTTON_PRIMARY_CLASS_NAME, "w-full")}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar PNG 1080×1080
          </button>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleLogoSelect}
        onUpload={handleMediaUpload}
        mediaAssets={allMediaAssets}
        selectedAssetId={style.logoMediaAssetId || undefined}
        title="Seleccionar logo para QR"
      />
    </div>
  );
}
