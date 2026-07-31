export interface ImageLoaderResult {
  blobSrc: string
}

export interface LoadingStateUpdate {
  isVisible: boolean
  isWebGLLoading?: boolean
  webglMessage?: string
  webglQuality?: string
  isError?: boolean
  message?: string
}

export class ImageLoaderManager {
  private abortController: AbortController | null = null
  private cleaned = false

  async loadImage(
    src: string,
    options: {
      onProgress?: (progress: number) => void
      onError?: () => void
      onUpdateLoadingState?: (state: LoadingStateUpdate) => void
    } = {},
  ): Promise<ImageLoaderResult> {
    this.abortController = new AbortController()

    options.onUpdateLoadingState?.({
      isVisible: true,
      isWebGLLoading: true,
      webglMessage: 'Loading...',
    })

    try {
      const response = await fetch(src, {
        signal: this.abortController.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const blob = await response.blob()
      const blobSrc = URL.createObjectURL(blob)

      options.onProgress?.(100)

      return { blobSrc }
    } catch (e) {
      if (this.cleaned) return { blobSrc: '' }
      throw e
    }
  }

  cleanup() {
    this.cleaned = true
    this.abortController?.abort()
    this.abortController = null
  }
}
