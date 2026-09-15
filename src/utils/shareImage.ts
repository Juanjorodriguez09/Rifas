export async function captureElementAsBlob(element: HTMLElement): Promise<Blob> {
  const { default: html2canvas } = await import('html2canvas-pro')
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: Math.min(window.devicePixelRatio || 1, 2.5),
    useCORS: true,
  })
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo generar la imagen.'))
    }, 'image/png')
  })
}

export async function shareOrDownloadImage(element: HTMLElement, filename: string, shareTitle: string) {
  const blob = await captureElementAsBlob(element)
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: shareTitle })
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
