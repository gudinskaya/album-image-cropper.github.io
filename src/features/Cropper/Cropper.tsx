import React, { useState, useRef } from 'react'
import cn from 'classnames'

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'
import Select from '../../components/Select/Select'
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox'
import Checkbox from '../../components/Checkbox/Checkbox'
import { Button } from 'antd'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export const Cropper = () => {
  const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(5 / 5)
  const [text, setText] = useState('Choose a picture (<= 5MB):')
  const [isChecked, setChecked] = useState(false)

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fileSize = e.target.files?.item(0)?.size;
    if (e.target.files && fileSize && e.target.files.length > 0) {
      const fileMb = Math.ceil(fileSize / 1024 ** 2);
      console.log(fileMb)
      if (fileMb && (fileMb <= 5)) {
        setCrop(undefined) // Makes crop preview update between images.
        const reader = new FileReader()
        reader.addEventListener('load', () =>
          setImgSrc(reader.result?.toString() || ''),
        )
        reader.readAsDataURL(e.target.files[0])
      } else {
        setText("Please select a file that is <= 5MB")
      }
      }
      
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const onDownloadCropClick = () => {
    if (!previewCanvasRef.current) {
      throw new Error('Crop canvas does not exist')
    }

    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob')
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      blobUrlRef.current = URL.createObjectURL(blob)
      hiddenAnchorRef.current!.href = blobUrlRef.current
      hiddenAnchorRef.current!.click()
    })
  }

  const handleChangeAspect = (value: string) => {
    if (imgRef.current) {
      setAspect(+value)
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, +value))
    }
  }

  const onChange = (e: CheckboxChangeEvent) => {
    console.log('checked = ', e.target.checked)
    setChecked(e.target.checked)
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
        )
      }
    },
    100,
    [completedCrop],
  )

  return (
    <div>
      <div className="crop-controls">
      <Checkbox isChecked={isChecked as boolean} onChange={onChange} />
      <div>Select size</div>
      <Select handleChange={handleChangeAspect} />
      <label htmlFor="file">{text}</label>
      <input className="btn" name="file" id="file" type="file" accept="image/*" onChange={onSelectFile} />
      </div>
      {!!imgSrc && (
        <ReactCrop
          className={cn('', isChecked && 'frame')}
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      {!!completedCrop && (
        <>
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
              }}
            />
          </div>
          <div>
          <Button type="primary" onClick={onDownloadCropClick}>Download Crop </Button>
            <a
              ref={hiddenAnchorRef}
              download
              style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
              }}
            >
              Hidden download
            </a>
          </div>
        </>
      )}
    </div>
  )
}
