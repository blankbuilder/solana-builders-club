'use client'

import { useEffect, useState } from 'react'

interface ImageUploadPreviewProps {
  name?: string
  required?: boolean
  existingUrl?: string | null
  existingFileName?: string | null
  hasError?: boolean
  describedBy?: string
}

export function ImageUploadPreview({ 
  name = 'logo', 
  required = false, 
  existingUrl = null,
  existingFileName = null,
  hasError = false,
  describedBy,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl)
  const [fileName, setFileName] = useState<string | null>(existingFileName)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFileName(file.name)
      setObjectUrl(url)
    } else {
      setPreviewUrl(existingUrl)
      setFileName(existingFileName)
      setObjectUrl(null)
    }
  }

  const pickerClasses = `flex w-full items-center gap-4 border-[0.5px] bg-[--color-bg] p-4 text-sm transition-colors ${
    hasError
      ? 'form-control-error'
      : 'border-white/20 focus-within:border-white/50'
  }`
  const displayFileName = fileName ?? 'No file chosen'

  return (
    <div className="flex flex-col gap-4">
      {existingUrl && <input type="hidden" name="existingLogoDataUrl" value={existingUrl} />}
      {existingFileName && (
        <input type="hidden" name="existingLogoFileName" value={existingFileName} />
      )}
      {previewUrl && (
        <div className="w-24 h-24 border-[0.5px] border-white/20 bg-[--color-bg] p-2 flex items-center justify-center">
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <div className={pickerClasses}>
        <label
          htmlFor={name}
          className="inline-flex shrink-0 cursor-pointer border-[0.5px] border-white/20 bg-white/5 px-4 py-2 text-xs font-mono text-[--color-foreground] transition-colors hover:bg-white/10"
        >
          Choose file
        </label>
        <span className="min-w-0 truncate font-mono text-sm text-[--color-foreground]">
          {displayFileName}
        </span>
        <input
          type="file"
          id={name}
          name={name}
          accept="image/png, image/jpeg, image/webp, image/svg+xml"
          required={required && !existingUrl}
          onChange={handleFileChange}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className="sr-only"
        />
      </div>
    </div>
  )
}
