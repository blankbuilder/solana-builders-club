'use client'

import { useState } from 'react'

interface ImageUploadPreviewProps {
  name?: string
  required?: boolean
  existingUrl?: string | null
}

export function ImageUploadPreview({ 
  name = 'logo', 
  required = false, 
  existingUrl = null 
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(existingUrl)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {previewUrl && (
        <div className="w-24 h-24 border-[0.5px] border-white/10 bg-[--color-bg] p-2 flex items-center justify-center">
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <input
        type="file"
        id={name}
        name={name}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        required={required && !existingUrl}
        onChange={handleFileChange}
        className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-2 text-sm focus:border-white/50 focus:outline-none transition-colors text-[--color-subtle] file:mr-4 file:py-1 file:px-3 file:border-[0.5px] file:border-white/10 file:bg-white/5 file:text-[--color-foreground] file:text-xs file:font-mono hover:file:bg-white/10"
      />
    </div>
  )
}
