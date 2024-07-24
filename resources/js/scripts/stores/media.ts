// stores/media.js
import { TFieldsUnion } from '@/js/types/moduleTypes'
import { TMediaOfItem, TMediaUrls } from '@/js/types/mediaTypes'
import type { TModule } from '@/js/types/moduleTypes'
import type { TApiArray } from '@/js/types/collectionTypes'

import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useCollectionMediaStore } from '../../scripts/stores/collections/collectionMedia'
import { useItemStore } from '../../scripts/stores/item'
import { useNotificationsStore } from '../../scripts/stores/notifications'

export const useMediaStore = defineStore('media', () => {
  const { send } = useXhrStore()
  const { showSnackbar } = useNotificationsStore()
  //both bucketUrl and mediaCollectionNames are initiated at app.init()
  const bucketUrl = ref('')
  const mediaCollectionNames = ref<string[]>([])

  //Media collection index
  const mediaCollectionName = ref('Photo')
  const showUploader = ref<boolean>(false)

  function initMedia(burl: string, media_collections: string[]) {
    bucketUrl.value = burl
    mediaCollectionNames.value = media_collections
  }

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

  function setItemMedia(media: TApiArray<'media'>[]) {
    const { array } = storeToRefs(useCollectionMediaStore())
    array.value = media
  }

  //mediaUpload
  const images = ref<File[]>([])
  const imagesAsBrowserReadable = ref<string[]>([])
  const loadingToBrowser = ref<boolean>(false)

  const mediaReady = computed(() => {
    return images.value.length !== 0 && !loadingToBrowser.value
  })

  async function onInputChange(media: File[]) {
    media //make eslint happy
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

    const idAsString = (<TFieldsUnion>i.fields).id as unknown as string
    fd.append('module', <TModule>r.current.module)
    fd.append('id', idAsString)
    fd.append('media_collection_name', mediaCollectionName.value)

    const res = await send<TApiArray<'media'>[]>('media/upload', 'post', fd)
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
      `destroy() media_id: ${media_id}, model: ${r.current.module}, model_id: ${(<TFieldsUnion>i.fields).id}`,
    )

    const res = await send<TApiArray<'media'>[]>('media/destroy', 'post', {
      media_id,
      module: r.current.module,
      module_id: (<TFieldsUnion>i.fields).id,
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
    const ordered = cm.array.map((x, index) => {
      return { id: x.id, order: index + 1 }
    })
    console.log(
      `reorder()  model: ${r.current.module}, id: ${i.fields?.id} ,ordered: ${JSON.stringify(ordered, null, 2)}`,
    )

    const res = await send<TApiArray<'media'>[]>('media/reorder', 'post', {
      module: r.current.module,
      id: i.fields?.id,
      ordered,
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
    initMedia,
    buildMedia,
    onInputChange,
    clear,
    mediaDestroy,
    mediaReorder,
    setItemMedia,
    mediaUpload,
  }
})
