<script setup lang="ts">
import type { NeededExif } from '~~/shared/types/photo'

const route = useRoute()
const photoId = computed(() => route.params.id as string)

const { data: photo } = await useFetch<Photo>(`/api/photos/visible`, {
  transform: (photos: Photo[]) => photos.find((p) => p.id === photoId.value) || null,
})

if (!photo.value) {
  throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
}

const exif = computed<NeededExif | null>(() => {
  if (!photo.value?.exif) return null
  try {
    return typeof photo.value.exif === 'string' ? JSON.parse(photo.value.exif) : photo.value.exif
  } catch {
    return null
  }
})

const fullUrl = computed(() => {
  if (photo.value?.originalUrl) return photo.value.originalUrl
  if (photo.value?.storageKey) return `/storage/${photo.value.storageKey}`
  return ''
})

const dayjs = useDayjs()

const formatBytes = (bytes: number) => {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const formatExposureTime = (val: string | number | undefined) => {
  if (!val) return ''
  let seconds: number
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const [num, den] = val.split('/')
      seconds = parseFloat(num) / parseFloat(den)
    } else {
      seconds = parseFloat(val)
    }
    if (isNaN(seconds)) return val
  } else {
    seconds = val
  }
  return seconds >= 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}`
}

const formatGPS = (lat: number, lng: number) => {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  const latAbs = Math.abs(lat)
  const lngAbs = Math.abs(lng)
  const latDeg = Math.floor(latAbs)
  const latMin = Math.floor((latAbs - latDeg) * 60)
  const latSec = ((latAbs - latDeg) * 60 - latMin) * 60
  const lngDeg = Math.floor(lngAbs)
  const lngMin = Math.floor((lngAbs - lngDeg) * 60)
  const lngSec = ((lngAbs - lngDeg) * 60 - lngMin) * 60
  return `${latDeg}°${latMin}'${latSec.toFixed(2)}"${latDir}, ${lngDeg}°${lngMin}'${lngSec.toFixed(2)}"${lngDir}`
}

interface ExifItem { label: string; value: string }

const basicInfo = computed<ExifItem[]>(() => {
  const p = photo.value
  const e = exif.value
  const items: ExifItem[] = []
  if (p?.storageKey) items.push({ label: 'Filename', value: p.storageKey.split('/').pop() || p.storageKey })
  if (p?.fileSize) items.push({ label: 'File Size', value: formatBytes(p.fileSize) })
  if (p?.width && p?.height) {
    items.push({ label: 'Resolution', value: `${p.width} × ${p.height}` })
    items.push({ label: 'Megapixels', value: `${((p.width * p.height) / 1000000).toFixed(2)} MP` })
  }
  if (e?.DateTimeOriginal) items.push({ label: 'Date Taken', value: dayjs(e.DateTimeOriginal).format('YYYY-MM-DD HH:mm:ss') })
  if (e?.ColorSpace) items.push({ label: 'Color Space', value: e.ColorSpace })
  if (e?.Artist) items.push({ label: 'Artist', value: e.Artist })
  if (e?.Software) items.push({ label: 'Software', value: e.Software })
  if (e?.tz) items.push({ label: 'Time Zone', value: e.tz })
  if (p?.country) items.push({ label: 'Country', value: p.country })
  if (p?.city) items.push({ label: 'City', value: p.city })
  if (p?.locationName) items.push({ label: 'Location', value: p.locationName })
  if (p?.latitude && p?.longitude) items.push({ label: 'GPS', value: formatGPS(p.latitude, p.longitude) })
  return items
})

const captureParams = computed<ExifItem[]>(() => {
  const e = exif.value
  if (!e) return []
  const items: ExifItem[] = []
  if (e.FocalLengthIn35mmFormat) items.push({ label: 'Focal Length (35mm)', value: `${e.FocalLengthIn35mmFormat}` })
  if (e.FocalLength) items.push({ label: 'Focal Length', value: `${e.FocalLength}` })
  if (e.FNumber) items.push({ label: 'Aperture', value: `f/${e.FNumber}` })
  if (e.ExposureTime) items.push({ label: 'Exposure', value: formatExposureTime(e.ExposureTime) })
  if (e.ISO) items.push({ label: 'ISO', value: `${e.ISO}` })
  if (e.ExposureCompensation) items.push({ label: 'Exposure Compensation', value: `${e.ExposureCompensation} EV` })
  return items
})

const deviceInfo = computed<ExifItem[]>(() => {
  const e = exif.value
  if (!e) return []
  const items: ExifItem[] = []
  if (e.Make && e.Model) items.push({ label: 'Camera', value: `${e.Make} ${e.Model}` })
  else if (e.Model) items.push({ label: 'Camera', value: e.Model })
  if (e.LensModel) {
    const lens = e.LensMake ? `${e.LensMake} ${e.LensModel}` : e.LensModel
    items.push({ label: 'Lens', value: lens })
  }
  if (e.MaxApertureValue) items.push({ label: 'Max Aperture', value: `f/${e.MaxApertureValue}` })
  return items
})

const shootingMode = computed<ExifItem[]>(() => {
  const e = exif.value
  if (!e) return []
  const items: ExifItem[] = []
  if (e.WhiteBalance) items.push({ label: 'White Balance', value: String(e.WhiteBalance) })
  if (e.ExposureProgram) items.push({ label: 'Exposure Program', value: String(e.ExposureProgram) })
  if (e.ExposureMode) items.push({ label: 'Exposure Mode', value: String(e.ExposureMode) })
  if (e.MeteringMode) items.push({ label: 'Metering Mode', value: String(e.MeteringMode) })
  if (e.Flash) items.push({ label: 'Flash', value: String(e.Flash) })
  if (e.SceneCaptureType) items.push({ label: 'Scene Type', value: String(e.SceneCaptureType) })
  return items
})

const hasExif = computed(() => {
  return basicInfo.value.length > 0 || captureParams.value.length > 0 || deviceInfo.value.length > 0 || shootingMode.value.length > 0
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 shrink-0">
      <NuxtLink to="/photos" class="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors no-underline">
        <UIcon name="i-lucide-arrow-left" class="text-lg" />
        <span class="font-sans text-sm">Back</span>
      </NuxtLink>
      <p v-if="photo?.title" class="font-display text-sm font-medium text-white truncate max-w-[50%]">{{ photo.title }}</p>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Image -->
      <div class="flex-1 flex items-center justify-center p-4 overflow-auto">
        <img
          v-if="fullUrl"
          :src="fullUrl"
          :alt="photo?.title || ''"
          class="max-w-full max-h-full object-contain rounded"
        />
      </div>

      <!-- Info panel -->
      <aside class="w-80 bg-neutral-900 border-l border-neutral-800 overflow-y-auto shrink-0">
        <div class="p-5 space-y-6">
          <!-- Title & description -->
          <div>
            <h1 class="font-display text-lg font-bold text-white mb-1">{{ photo?.title || 'Untitled' }}</h1>
            <p v-if="photo?.description" class="font-sans text-sm text-neutral-400 leading-relaxed">{{ photo.description }}</p>
          </div>

          <!-- Tags -->
          <div v-if="photo?.tags && photo.tags.length > 0" class="flex flex-wrap gap-1.5">
            <span v-for="tag in photo.tags" :key="tag" class="px-2 py-0.5 bg-neutral-800 text-neutral-300 font-sans text-xs rounded">{{ tag }}</span>
          </div>

          <!-- No EXIF -->
          <div v-if="!hasExif" class="py-8 text-center">
            <UIcon name="i-lucide-info" class="text-2xl text-neutral-600 mb-2" />
            <p class="font-sans text-sm text-neutral-500">No EXIF data available</p>
          </div>

          <!-- EXIF sections -->
          <template v-if="hasExif">
            <div v-if="basicInfo.length">
              <h3 class="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Basic Information</h3>
              <dl class="space-y-1.5">
                <div v-for="item in basicInfo" :key="item.label" class="flex justify-between gap-3">
                  <dt class="font-sans text-sm text-neutral-500 shrink-0">{{ item.label }}</dt>
                  <dd class="font-sans text-sm text-neutral-200 text-right break-all">{{ item.value }}</dd>
                </div>
              </dl>
            </div>

            <div v-if="captureParams.length">
              <h3 class="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Capture Parameters</h3>
              <dl class="space-y-1.5">
                <div v-for="item in captureParams" :key="item.label" class="flex justify-between gap-3">
                  <dt class="font-sans text-sm text-neutral-500 shrink-0">{{ item.label }}</dt>
                  <dd class="font-sans text-sm text-neutral-200 text-right break-all">{{ item.value }}</dd>
                </div>
              </dl>
            </div>

            <div v-if="deviceInfo.length">
              <h3 class="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Device</h3>
              <dl class="space-y-1.5">
                <div v-for="item in deviceInfo" :key="item.label" class="flex justify-between gap-3">
                  <dt class="font-sans text-sm text-neutral-500 shrink-0">{{ item.label }}</dt>
                  <dd class="font-sans text-sm text-neutral-200 text-right break-all">{{ item.value }}</dd>
                </div>
              </dl>
            </div>

            <div v-if="shootingMode.length">
              <h3 class="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Shooting Mode</h3>
              <dl class="space-y-1.5">
                <div v-for="item in shootingMode" :key="item.label" class="flex justify-between gap-3">
                  <dt class="font-sans text-sm text-neutral-500 shrink-0">{{ item.label }}</dt>
                  <dd class="font-sans text-sm text-neutral-200 text-right break-all">{{ item.value }}</dd>
                </div>
              </dl>
            </div>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>
