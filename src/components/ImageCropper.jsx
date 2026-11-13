import { useEffect, useMemo, useState } from 'react'
import { Check, Move, X, ZoomIn } from 'lucide-react'

const ImageCropper = ({ file, aspectRatio = 1, onCancel, onComplete }) => {
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file])
  const [image, setImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const cropWindow = useMemo(() => {
    if (!image) return null
    const imageRatio = image.width / image.height
    let width = image.width
    let height = image.height

    if (imageRatio > aspectRatio) {
      width = image.height * aspectRatio
    } else {
      height = image.width / aspectRatio
    }

    width /= zoom
    height /= zoom
    const maxX = (image.width - width) / 2
    const maxY = (image.height - height) / 2

    return {
      width,
      height,
      x: image.width / 2 - width / 2 + (maxX * offsetX) / 100,
      y: image.height / 2 - height / 2 + (maxY * offsetY) / 100,
    }
  }, [aspectRatio, image, offsetX, offsetY, zoom])

  const handleComplete = () => {
    if (!image || !cropWindow) return

    const canvas = document.createElement('canvas')
    const outputWidth = 1200
    canvas.width = outputWidth
    canvas.height = Math.round(outputWidth / aspectRatio)
    const context = canvas.getContext('2d')
    if (!context) {
      onCancel()
      return
    }
    context.drawImage(
      image,
      cropWindow.x,
      cropWindow.y,
      cropWindow.width,
      cropWindow.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    canvas.toBlob((blob) => {
      if (!blob) {
        onCancel()
        return
      }
      onComplete(new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}-cropped.webp`, { type: 'image/webp' }))
    }, 'image/webp', 0.88)
  }

  return (
    <div className="admin-login-overlay px-4">
      <div className="login-card large max-w-2xl">
        <div className="flex items-center gap-4 mb-8 text-primary">
          <Move size={28} />
          <div className="flex-grow">
            <h3 className="text-2xl font-black uppercase">Crop Image</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">Fit image to card frame</p>
          </div>
          <button type="button" onClick={onCancel} className="text-3xl text-white/20 hover:text-white"><X /></button>
        </div>

        <div className="mx-auto mb-8 flex max-h-[50vh] min-h-64 max-w-full items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-black/50" style={{ aspectRatio }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Crop preview"
              onLoad={(event) => setImage(event.currentTarget)}
              className="h-full w-full object-cover transition-transform"
              style={{
                objectPosition: `${50 + offsetX / 2}% ${50 + offsetY / 2}%`,
                transform: `scale(${zoom})`,
              }}
            />
          )}
        </div>

        <div className="space-y-5">
          <label className="field-label flex items-center gap-2"><ZoomIn size={14} /> Zoom</label>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" />
          <label className="field-label">Horizontal position</label>
          <input type="range" min="-100" max="100" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} className="w-full accent-primary" />
          <label className="field-label">Vertical position</label>
          <input type="range" min="-100" max="100" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} className="w-full accent-primary" />
        </div>

        <button type="button" onClick={handleComplete} disabled={!image} className="admin-action-btn mt-8 w-full justify-center py-4">
          <Check size={16} /> Use Cropped Image
        </button>
      </div>
    </div>
  )
}

export default ImageCropper
