"use client";

import { useState } from "react";
import type { MarkerType } from "@/types";
import { MARKER_CONFIG, SECTION_LABELS, COUNT_LABELS } from "@/types";
import { formatTime } from "@/lib/spotify";

interface MarkerEditorProps {
  timeMs: number;
  onAdd: (type: MarkerType, label?: string) => void;
  onClose: () => void;
}

export default function MarkerEditor({
  timeMs,
  onAdd,
  onClose,
}: MarkerEditorProps) {
  const [selectedType, setSelectedType] = useState<MarkerType>("count");
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    const finalLabel =
      selectedType === "section" || selectedType === "count" ? label : undefined;
    onAdd(selectedType, finalLabel || undefined);
  };

  const showLabelField =
    selectedType === "section" || selectedType === "count";
  const labelOptions =
    selectedType === "section"
      ? SECTION_LABELS
      : selectedType === "count"
        ? COUNT_LABELS
        : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-semibold text-white">Add Marker</h3>
        <p className="mb-4 text-sm text-zinc-400">
          at {formatTime(timeMs)}
        </p>

        {/* Type selection */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(
            Object.entries(MARKER_CONFIG) as [
              MarkerType,
              (typeof MARKER_CONFIG)[MarkerType],
            ][]
          ).map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setLabel("");
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedType === type
                  ? "border-white/30 bg-zinc-800 text-white"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
              <kbd className="ml-auto rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                {cfg.shortcut}
              </kbd>
            </button>
          ))}
        </div>

        {/* Label field */}
        {showLabelField && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Label
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {labelOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLabel(opt)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    label === opt
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Or type a custom label..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Add Marker
          </button>
        </div>
      </div>
    </div>
  );
}
