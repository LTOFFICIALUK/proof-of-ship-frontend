"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { focusRing } from "@/components/surface";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_CHARS = 520_000;
const MAX_EDGE = 640;

const isHttpsImage = (value: string) => /^https:\/\/[^\s]+$/i.test(value.trim());

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = src;
  });

const canvasUrl = (image: HTMLImageElement, quality: number, type: string) => {
  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare that image.");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(type, quality);
};

const compressImage = async (src: string) => {
  const image = await loadImage(src);
  let quality = 0.86;
  let url = canvasUrl(image, quality, "image/webp");
  if (!url.startsWith("data:image/webp")) {
    url = canvasUrl(image, quality, "image/jpeg");
  }
  while (url.length > MAX_CHARS && quality > 0.48) {
    quality -= 0.1;
    const type = url.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
    url = canvasUrl(image, quality, type);
  }
  if (url.length > 700_000) {
    throw new Error("Use a smaller image.");
  }
  return url;
};

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Drop a PNG, JPG, WEBP, or GIF."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Keep the image under 8 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        reject(new Error("Could not read that image."));
        return;
      }
      void compressImage(result).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });

export const ImageDrop = ({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    try {
      onChange(await readFile(file));
      setFailed(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not use that image.");
    }
  };

  const handleLink = (raw: string) => {
    const link = raw.trim();
    if (!link) {
      return false;
    }
    if (!isHttpsImage(link)) {
      onError("Image links must start with https://");
      return true;
    }
    onChange(link);
    setFailed(false);
    return true;
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
      return;
    }
    const uri = event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain");
    handleLink(uri);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const showImage = Boolean(value) && !failed;

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-label={value ? "Replace coin image" : "Drop a coin image"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        onPaste={(event) => {
          const file = event.clipboardData.files[0];
          if (file) {
            event.preventDefault();
            void handleFile(file);
            return;
          }
          const text = event.clipboardData.getData("text/plain");
          if (handleLink(text)) {
            event.preventDefault();
          }
        }}
        className={`group relative grid h-32 w-32 cursor-pointer place-items-center overflow-hidden rounded-[22px] bg-[#f5f5f7] text-center transition duration-200 sm:h-36 sm:w-36 ${focusRing} ${
          dragging
            ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]"
            : "ring-1 ring-black/[0.06]"
        }`}
      >
        {showImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              onError={() => setFailed(true)}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-[var(--ink)]/55 text-[12px] font-medium text-white opacity-0 transition duration-200 group-hover:opacity-100 group-focus:opacity-100">
              {dragging ? "Drop it here" : "Replace"}
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-3 text-[var(--muted)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3.5 15.5 8 11l3.5 3.5 3-3 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="1.2" fill="currentColor" />
            </svg>
            <span className="text-[12px] leading-snug">{dragging ? "Drop it here" : "Drop image"}</span>
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-label="Upload coin image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void handleFile(file);
        }}
      />
      {value ? (
        <button
          type="button"
          className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[13px] text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/10"
          aria-label="Remove image"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange("");
            setFailed(false);
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  );
};
