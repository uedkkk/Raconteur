import type { LoadingIndicatorRef } from '~/components/photo/LoadingIndicator.vue'
import { LoadingState } from '@raconteur/webgl-image'

export const useWebGLWorkState = (
  loadingIndicatorRef: LoadingIndicatorRef | null,
) => {
  return (
    isLoading: boolean,
    state?: LoadingState,
    quality?: 'high' | 'medium' | 'low' | 'unknown',
  ) => {
    let message = ''

    if (state === LoadingState.TEXTURE_LOADING) {
      message = 'Loading texture...'
    } else if (state === LoadingState.IMAGE_LOADING) {
      message = 'Loading...'
    }

    loadingIndicatorRef?.updateLoadingState({
      isVisible: isLoading,
      isWebGLLoading: isLoading,
      webglMessage: message,
      webglQuality: quality,
    })
  }
}
