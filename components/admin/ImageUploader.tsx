"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { prepareImage, uploadWithProgress } from "@/lib/admin/client";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL = 25 * 1024 * 1024; // phone photos get shrunk in the browser before upload

type Props = {
  id: string;
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
  compact?: boolean;
  error?: string;
};

/** Pick a photo → instant preview → upload with progress. Supports replace and remove. */
export default function ImageUploader({ id, label, value, onChange, onBusyChange, compact, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    if (!ACCEPT.includes(file.type)) return setProblem("Please choose a JPG, PNG or WebP photo.");
    if (file.size > MAX_ORIGINAL) return setProblem("That photo is very large (over 25 MB). Please choose a smaller one.");

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setProgress(0);
    onBusyChange?.(true);
    try {
      const { blob, name } = await prepareImage(file);
      const { url } = await uploadWithProgress(blob, name, setProgress);
      onChange(url);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "The photo couldn't be uploaded.");
      setLocalPreview(null);
    } finally {
      setProgress(null);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shown = localPreview ?? value;
  const uploading = progress !== null;
  const message = problem ?? error;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        aria-label={label}
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={uploading}
      />
      {shown ? (
        <div className={`relative overflow-hidden rounded-2xl border border-gold/25 bg-card ${compact ? "aspect-square" : "aspect-[4/3.4]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of a just-picked local file */}
          <img src={shown} alt={`${label} preview`} className="h-full w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-forest/75 px-6">
              <p className="text-sm text-cream">Uploading… {progress}%</p>
              <div className="h-2 w-full max-w-48 overflow-hidden rounded-full bg-cream/15" role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="h-full bg-gold transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-forest/90 to-transparent p-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-forest/90 px-3.5 text-xs font-semibold text-cream ring-1 ring-gold/40 hover:text-gold">
                <RefreshCw size={14} aria-hidden="true" /> Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalPreview(null);
                  onChange(null);
                }}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-forest/90 px-3.5 text-xs font-semibold text-cream ring-1 ring-[#c0583a]/60 hover:text-[#f0a18a]"
              >
                <Trash2 size={14} aria-hidden="true" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/35 bg-forest/50 px-4 text-center text-sand/70 transition-colors hover:border-gold hover:text-gold ${compact ? "aspect-square" : "aspect-[4/3.4]"}`}
        >
          <ImagePlus size={compact ? 24 : 32} strokeWidth={1.4} aria-hidden="true" />
          <span className="text-sm font-medium">{compact ? "Add photo" : "Choose a photo"}</span>
          {!compact && <span className="text-xs text-sand/50">JPG, PNG or WebP · tap to pick from your device</span>}
        </button>
      )}
      {message && (
        <p className="flex items-start gap-1.5 text-sm text-[#f0a18a]" role="alert">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
