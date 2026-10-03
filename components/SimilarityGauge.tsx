"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface SimilarityGaugeProps {
  score: number; // 0 - 100
  rawCosine?: number;
  size?: number;
}

export default function SimilarityGauge({
  score = 0,
  rawCosine,
  size = 200,
}: SimilarityGaugeProps) {
  const radius = size * 0.38;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const { colorHex, tierText, tierBadgeClass, icon } = useMemo(() => {
    if (score >= 85) {
      return {
        colorHex: "#dc2626", // Red-600
        tierText: "High Plagiarism Risk",
        tierBadgeClass: "bg-red-50 text-red-700 border-red-200",
        icon: <AlertCircle className="w-4 h-4 text-red-600 mr-1" />,
      };
    } else if (score >= 60) {
      return {
        colorHex: "#d97706", // Amber-600
        tierText: "Moderate Similarity (Paraphrased)",
        tierBadgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <HelpCircle className="w-4 h-4 text-amber-600 mr-1" />,
      };
    } else {
      return {
        colorHex: "#0284c7", // Sky Blue (Original / Low Risk)
        tierText: "Low Similarity (Original)",
        tierBadgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        icon: <CheckCircle className="w-4 h-4 text-sky-600 mr-1" />,
      };
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Gauge SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="gauge-circle"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-normal text-slate-800 tracking-tight">
            {score.toFixed(1)}%
          </span>
          <span className="text-xs uppercase tracking-wider font-normal text-slate-400 mt-0.5">
            Confidence
          </span>
        </div>
      </div>

      {/* Tier Badge */}
      <div
        className={`mt-4 inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${tierBadgeClass}`}
      >
        {icon}
        <span>{tierText}</span>
      </div>

      {rawCosine !== undefined && (
        <p className="text-xs font-mono text-slate-400 mt-2">
          Raw Cosine: <span className="font-normal text-slate-600">{rawCosine.toFixed(4)}</span>
        </p>
      )}
    </div>
  );
}
