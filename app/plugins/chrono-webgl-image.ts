import { WebGLImageViewer } from '@raconteur/webgl-image'
import '@raconteur/webgl-image/style'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('WebGLImageViewer', WebGLImageViewer)
})
