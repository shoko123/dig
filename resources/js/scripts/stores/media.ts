// stores/media.js
import { TFields } from '@/types/moduleTypes'
import { TMediaOfItem, TMediaUrls } from '@/types/mediaTypes'
import type { TModule } from '@/types/moduleTypes'
import type { TArray } from '@/types/collectionTypes'

import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useRoutesMainStore } from './routes/routesMain'
import { useMainStore } from './main'
import { useXhrStore } from './xhr'
import { useCollectionMediaStore } from './collections/collectionMedia'
import { useItemStore } from './item'
import { useNotificationsStore } from './notifications'

export const useMediaStore = defineStore('media', () => {
  const { send } = useXhrStore()
  const { showSnackbar } = useNotificationsStore()
  const { bucketUrl, mediaCollectionNames } = storeToRefs(useMainStore())

  //Media collection index
  const mediaCollectionName = ref('Photo')
  const showUploader = ref<boolean>(false)

  function buildMedia(apiMedia: TMediaUrls | null, module?: TModule): TMediaOfItem {
    if (apiMedia === null || apiMedia === undefined) {
      return {
        hasMedia: false,
        urls: {
          full: `${bucketUrl.value}app/filler/${module}Filler.jpg`,
          tn: `${bucketUrl.value}app/filler/${module}Filler-tn.jpg`,
        },
      }
    } else {
      return {
        hasMedia: true,
        urls: {
          full: `${bucketUrl.value}${apiMedia.full}`,
          tn: `${bucketUrl.value}${apiMedia.tn}`,
        },
      }
    }
  }

  function setItemMedia(media: TArray<'media'>[]) {
    const { setArray } = useCollectionMediaStore()
    setArray(media)
  }

  //mediaUpload
  const images = ref<File[]>([])
  const imagesAsBrowserReadable = ref<string[]>([])
  const loadingToBrowser = ref<boolean>(false)

  const mediaReady = computed(() => {
    return images.value.length !== 0 && !loadingToBrowser.value
  })

  async function onInputChange() {
    if (images.value.length > 6) {
      alert('Max number of files is 6 - Upload aborted!')
      clear()
      return
    }

    images.value.forEach((file) => {
      if (file.size > 1024 * 1024 * 2) {
        alert(`File ${file.name} exceeds max allowed 2MB - Upload aborted!`)
        clear()
        return
      }
    })

    loadingToBrowser.value = true
    //console.log("Load files - started")
    try {
      await Promise.all(
        images.value.map(async (image) => {
          addImage(image)
        }),
      )
    } catch {
      showSnackbar(`Files upload to browser failed. Please try again later.`)
      clear()
    }

    loadingToBrowser.value = false
    //console.log("Load files -finished")
  }

  async function addImage(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target) {
        //console.log(`media.push image`)
        imagesAsBrowserReadable.value.push(<string>e.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function clear() {
    images.value = []
    imagesAsBrowserReadable.value = []
    showUploader.value = false
    orderChanged.value = false
  }

  async function mediaUpload() {
    const i = useItemStore()
    const r = useRoutesMainStore()
    const fd = new FormData()

    images.value.forEach((file) => {
      fd.append('media_files[]', file, file.name)
    })

    const idAsString = (<TFields>i.fields).id as unknown as string
    fd.append('module', <TModule>r.current.module)
    fd.append('id', idAsString)
    fd.append('media_collection_name', mediaCollectionName.value)

    const res = await send<TArray<'media'>[]>('media/upload', 'post', fd)
    if (res.success) {
      showUploader.value = false
      setItemMedia(res.data)
      clear()
      return { success: true }
    } else {
      return { success: false, message: res.message }
    }
  }

  //media destroy
  async function mediaDestroy(media_id: number) {
    const r = useRoutesMainStore()
    const i = useItemStore()
    console.log(
      `destroy() media_id: ${media_id}, model: ${r.current.module}, model_id: ${(<TFields>i.fields).id}`,
    )

    const res = await send<TArray<'media'>[]>('media/destroy', 'post', {
      media_id,
      module: r.current.module,
      module_id: (<TFields>i.fields).id,
    })
    if (res.success) {
      showUploader.value = false
      setItemMedia(res.data)
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  //media reorder
  const orderChanged = ref(false)

  async function mediaReorder() {
    const r = useRoutesMainStore()
    const i = useItemStore()
    const cm = useCollectionMediaStore()
    const ordered = cm.array.map((x) => x.id)
    console.log(
      `reorder()  model: ${r.current.module}, id: ${i.fields?.id} ,ordered: ${JSON.stringify(ordered, null, 2)}`,
    )

    const res = await send<TArray<'media'>[]>('media/reorder', 'post', {
      module: r.current.module,
      module_id: i.fields?.id,
      ordered_media_ids: ordered,
    })

    if (res.success) {
      showUploader.value = false
      return { success: res.success }
    }
    return { success: false, message: res.message }
  }

  return {
    bucketUrl,
    mediaReady,
    orderChanged,
    showUploader,
    mediaCollectionNames,
    mediaCollectionName,
    images,
    imagesAsBrowserReadable,
    buildMedia,
    onInputChange,
    clear,
    mediaDestroy,
    mediaReorder,
    setItemMedia,
    mediaUpload,
  }
})
