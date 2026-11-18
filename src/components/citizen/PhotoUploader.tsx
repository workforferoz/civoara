"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface PhotoUploaderProps {
  onPhotoSelected: (file: File | null, previewUrl: string | null) => void;
  maxSizeMB?: number;
  error?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoSelected,
  maxSizeMB = 5,
  error,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    sizeKb: number;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const handleFile = (file: File) => {
    setValidationError(null);

    // Validate type
    if (!allowedTypes.includes(file.type)) {
      setValidationError("Invalid file format. Please upload JPG, PNG, or WebP images.");
      return;
    }

    // Validate size (maxSizeMB in bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setValidationError(`Image is too large. Maximum permitted file size is ${maxSizeMB}MB.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileDetails({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
    });
    onPhotoSelected(file, objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileDetails(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onPhotoSelected(null, null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Photograph Evidence <span className="text-red-500">*</span>
      </label>

      {preview ? (
        <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative h-32 w-32 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image
                src={preview}
                alt="Civic defect preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-800 break-all">
                {fileDetails?.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Size: {fileDetails?.sizeKb} KB • Ready for municipal upload
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  leftIcon={<X className="w-3.5 h-3.5 text-red-500" />}
                >
                  Remove & Replace
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-indigo-400 cursor-pointer transition-colors text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to upload photograph or drag & drop
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            JPG, PNG or WebP (Maximum {maxSizeMB}MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {(validationError || error) && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}
    </div>
  );
};
