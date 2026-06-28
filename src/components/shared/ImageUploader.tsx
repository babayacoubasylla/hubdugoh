import { useState, useRef } from 'react'
import { HiPhoto, HiTrash } from 'react-icons/hi2'
import { useImageUpload } from '@/hooks/useImageUpload'

interface ImageUploaderProps {
    currentImage?: string | null
    onImageUploaded: (url: string) => void
    onImageRemoved?: () => void
    bucket?: string
    folder?: string
    className?: string
    label?: string
    children?: React.ReactNode
}

export default function ImageUploader({
    currentImage,
    onImageUploaded,
    onImageRemoved,
    bucket = 'produits',
    folder = '',
    className = '',
    label = 'Ajouter une image',
    children
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { uploadImage, deleteImage, uploading, progress } = useImageUpload({ bucket, folder })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Créer un aperçu local
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload vers Supabase
        const url = await uploadImage(file)
        if (url) {
            setPreview(url)
            onImageUploaded(url)
        } else {
            // Réinitialiser si erreur
            setPreview(currentImage || null)
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (currentImage) {
            await deleteImage(currentImage)
        }
        setPreview(null)
        if (onImageRemoved) {
            onImageRemoved()
        }
        onImageUploaded('')
    }

    const triggerFileInput = (e?: React.MouseEvent) => {
        e?.preventDefault()
        fileInputRef.current?.click()
    }

    // Si children est fourni, on les utilise comme déclencheur
    if (children) {
        return (
            <div className={className}>
                <div
                    onClick={triggerFileInput}
                    role="button"
                    tabIndex={0}
                >
                    {children}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />
            </div>
        )
    }

    return (
        <div className={className}>
            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-xl border border-slate-200"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors"
                            title="Changer l'image"
                        >
                            <HiPhoto className="text-slate-700 text-xl" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                            title="Supprimer l'image"
                        >
                            <HiTrash className="text-white text-xl" />
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-b-xl overflow-hidden">
                            <div
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                    <HiPhoto className="text-4xl text-slate-400" />
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-xs text-slate-400">JPG, PNG, WEBP • Max 5MB</span>
                    {uploading && (
                        <div className="w-full max-w-xs mt-2">
                            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-orange-500 mt-1">{progress}%</p>
                        </div>
                    )}
                </button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
            />
        </div>
    )
}