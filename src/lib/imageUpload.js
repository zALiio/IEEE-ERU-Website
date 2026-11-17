import { supabase } from './supabaseClient'

export const convertToWebP = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Failed to read image file'))
  reader.onload = () => {
    const image = new window.Image()
    image.onerror = () => reject(new Error('Failed to load image for processing'))
    image.onload = () => {
      const maxDim = 1600
      const scale = Math.min(1, maxDim / image.naturalWidth, maxDim / image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Image processing is unavailable'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Image conversion produced an empty file'))
      }, 'image/webp', 0.82)
    }
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})

export const uploadImage = async (file, bucket, prefix) => {
  const webp = await convertToWebP(file)
  const name = `${Date.now()}_${prefix}.webp`
  const { error } = await supabase.storage.from(bucket).upload(name, webp, {
    contentType: 'image/webp',
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(name)
  if (!data?.publicUrl) throw new Error('Image upload did not return a public URL')
  return data.publicUrl
}
