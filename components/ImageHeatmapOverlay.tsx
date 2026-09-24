"use client";

import { useState } from "react";
import { Image as ImageIcon, Sliders, AlertCircle, Info } from "lucide-react";

interface ImageHeatmapCell {
  index: number;
  row: number;
  col: number;
  similarity: number; // 0 - 1
  isHotspot: boolean;
}

interface ImageDiffReport {
  gridSize: number;
  overallVisualSimilarity: number;
  hotspotsCount: number;
  cells: ImageHeatmapCell[];
}

interface ImageHeatmapOverlayProps {
  diffData: ImageDiffReport;
  imageAUrl?: string;
  imageBUrl?: string;
}

export default function ImageHeatmapOverlay({
  diffData,
  imageAUrl = "/placeholder-image.png",
  imageBUrl = "/placeholder-image.png",
}: ImageHeatmapOverlayProps) {
  const [opacity, setOpacity] = useState<number>(0.65);
  const [hoveredCell, setHoveredCell] = useState<ImageHeatmapCell | null>(null);

  if (!diffData || !diffData.cells) {
    return (
      <div className="p-8 text-center text-slate-400">
        No image patch heatmap data available.
      </div>
    );
  }

  const { gridSize, cells, hotspotsCount, overallVisualSimilarity } = diffData;

  const getHeatmapColor = (sim: number) => {
    // sim is 0 to 1
    if (sim >= 0.8) return `rgba(220, 38, 38, ${opacity})`; // red hotspot
    if (sim >= 0.6) return `rgba(245, 158, 11, ${opacity})`; // amber
    if (sim >= 0.4) return `rgba(16, 185, 129, ${opacity * 0.7})`; // emerald
    return `rgba(59, 130, 246, ${opacity * 0.4})`; // cool blue
  };

  return (
    <div className="clinical-card overflow-hidden">
      {/* Header with Heatmap Controls */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-medium">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-800">
              CLIP Visual Patch Heatmap Grid ({gridSize}x{gridSize})
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Perceptual patch-by-patch localized feature similarity overlay
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-xs font-normal text-slate-600">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Heatmap Opacity:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24 accent-slate-800 cursor-pointer"
            />
            <span className="w-8 font-mono text-slate-500">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
              {hotspotsCount} Hotspots (&ge; 75%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image A */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
              Artifact A (Source Graphic)
            </span>
            <span className="text-xs text-slate-400 font-mono">Reference</span>
          </div>

          <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
            {/* Visual background representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-slate-200 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2 shadow-sm">
                <ImageIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                System Diagram A
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                256 × 256 px · Raster Manifold
              </span>
            </div>

            {/* Heatmap Grid Overlay */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((cell) => {
                const isHovered = hoveredCell?.index === cell.index;
                return (
                  <div
                    key={`a-${cell.index}`}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{ backgroundColor: getHeatmapColor(cell.similarity) }}
                    className={`border border-white/40 transition-all cursor-pointer flex items-center justify-center text-[10px] font-mono font-normal text-white shadow-sm ${
                      isHovered ? "ring-2 ring-white scale-[1.03] z-10" : ""
                    }`}
                  >
                    {opacity > 0.3 && (
                      <span className="drop-shadow-md">
                        {Math.round(cell.similarity * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Image B */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
              Artifact B (Suspect Derivative)
            </span>
            <span className="text-xs text-slate-400 font-mono">Evaluated</span>
          </div>

          <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
            {/* Visual background representation */}
            <div className="absolute inset-0 bg-gradient-to-tl from-slate-200 via-white to-slate-200 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2 shadow-sm">
                <ImageIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                System Diagram B (Derivative)
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                256 × 256 px · Raster Manifold
              </span>
            </div>

            {/* Heatmap Grid Overlay */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {cells.map((cell) => {
                const isHovered = hoveredCell?.index === cell.index;
                return (
                  <div
                    key={`b-${cell.index}`}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{ backgroundColor: getHeatmapColor(cell.similarity) }}
                    className={`border border-white/40 transition-all cursor-pointer flex items-center justify-center text-[10px] font-mono font-normal text-white shadow-sm ${
                      isHovered ? "ring-2 ring-white scale-[1.03] z-10" : ""
                    }`}
                  >
                    {opacity > 0.3 && (
                      <span className="drop-shadow-md">
                        {Math.round(cell.similarity * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Patch Inspector Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <Info className="w-4 h-4 text-slate-500" />
          <span>
            {hoveredCell ? (
              <>
                Patch ({hoveredCell.row + 1}, {hoveredCell.col + 1}):{" "}
                <span className="font-medium text-slate-800">
                  {Math.round(hoveredCell.similarity * 100)}% feature congruence
                </span>{" "}
                {hoveredCell.isHotspot && (
                  <span className="text-red-600 font-medium ml-1">
                    (Visual Hotspot Cloned)
                  </span>
                )}
              </>
            ) : (
              "Hover over any patch grid cell above to inspect localized visual alignment."
            )}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-600" />
            <span>&ge;80% Hotspot</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>60-79% Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-300" />
            <span>Original</span>
          </div>
        </div>
      </div>
    </div>
  );
}
