import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UseImageUploadProps {
    bucket?: string
    folder?: string
}

export function useImageUpload({ bucket = 'produits', folder = '' }: UseImageUploadProps = {}) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const uploadImage = async (file: File, fileName?: string): Promise<string | null> => {
        if (!file) return null

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            toast.error('Format non supporte. Utilisez JPG, PNG, WEBP ou GIF')
            return null
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image trop volumineuse (max 5MB)')
            return null
        }

        setUploading(true)
        setProgress(0)

        try {
            const ext = file.name.split('.').pop()
            const finalName = fileName
                ? `${fileName}.${ext}`
                : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`

            const filePath = folder ? `${folder}/${finalName}` : finalName

            console.log('Upload de image', bucket, filePath, folder)

            const uploadResult = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { cacheControl: '3600', upsert: true })

            if (uploadResult.error) {
                console.error('Erreur upload', uploadResult.error)
                toast.error('Erreur lors de upload: ' + uploadResult.error.message)
                return null
            }

            const urlResult = supabase.storage.from(bucket).getPublicUrl(filePath)
            const publicUrl = urlResult.data.publicUrl
            console.log('URL publique', publicUrl)

            toast.success('Image uploadee avec succes')
            return publicUrl
        } catch (error) {
            console.error('Erreur', error)
            toast.error('Erreur lors de upload')
            return null
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }

    const deleteImage = async (imageUrl: string): Promise<boolean> => {
        try {
            const urlParts = imageUrl.split('/')
            const bucketIndex = urlParts.indexOf(bucket)

            if (bucketIndex === -1) return false

            const filePath = urlParts.slice(bucketIndex + 1).join('/')
            if (!filePath) return false

            const result = await supabase.storage.from(bucket).remove([filePath])
            if (result.error) {
                toast.error('Erreur lors de la suppression')
                return false
            }

            toast.success('Image supprimee')
            return true
        } catch (error) {
            console.error('Erreur', error)
            return false
        }
    }

    return { uploadImage, deleteImage, uploading, progress }
}
