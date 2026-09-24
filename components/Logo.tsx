import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Custom Multifaceted Geometric Convergence Emblem */}
      <div className={`relative ${iconDimensions} flex-shrink-0 group`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        >
          {/* Subtle Outer Glow */}
          <circle cx="22" cy="22" r="20" fill="url(#outer_ambient)" opacity="0.3" />

          {/* Background Rounded Shield / Hexagon Plate (Clean White, Minimalist) */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="10"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          {/* Facet 1: Text Modality (Top Node) */}
          <path
            d="M22 8L33 16V24L22 17L11 24V16L22 8Z"
            fill="#475569"
            opacity="0.9"
          />

          {/* Facet 2: Code AST Modality (Left Node) */}
          <path
            d="M11 24L22 17V34L11 28V24Z"
            fill="#64748B"
            opacity="0.85"
          />

          {/* Facet 3: Visual CLIP Modality (Right Node) */}
          <path
            d="M33 24L22 17V34L33 28V24Z"
            fill="#334155"
            opacity="0.9"
          />

          {/* Central Convergence Diamond Core */}
          <polygon
            points="22,14 26,18 22,22 18,18"
            fill="#FFFFFF"
            opacity="0.98"
          />
          <circle cx="22" cy="18" r="1.5" fill="#0F172A" />

          {/* Optical Interlocking Accent Lines */}
          <path
            d="M22 8V14M11 24L18 20M33 24L26 20M22 22V34"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography & Badging */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className={`font-medium text-slate-800 ${titleSizes} tracking-tight leading-none`}>
              Origina<span className="text-slate-800">X</span>
            </span>
            <span className="text-[10px] font-normal tracking-wider uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
              v2.4
            </span>
          </div>
          <span className="text-[11px] font-normal text-slate-500 tracking-normal mt-0.5">
            Multi-Modal Plagiarism Detector
          </span>
        </div>
      )}
    </div>
  );
}
