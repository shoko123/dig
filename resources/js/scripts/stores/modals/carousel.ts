import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TCName, TArrayByCName, TCArray } from '@/js/types/collectionTypes'
import { TCarousel, TApiCarousel, TCarouselUnion, TApiCarouselUnion } from '@/js/types/mediaTypes'
import { TModule } from '@/js/types/moduleTypes'

import { useCollectionsStore } from '../collections/collections'
import { useElementAndCollectionStore } from '../collections/elementAndCollection'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useItemStore } from '../item'

export const useCarouselStore = defineStore('carousel', () => {
  const { getCollectionStore, loadPageByItemIndex } = useCollectionsStore()
  const { send } = useXhrStore()
  const { derived } = storeToRefs(useItemStore())
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId, getViewName, getItemsPerPage } = useModuleStore()
  const { arrayElementByIndex, nextArrayElement, indexByArrayElement } =
    useElementAndCollectionStore()

  const isOpen = ref<boolean>(false)
  const collectionName = ref<TCName>('main')
  const index = ref<number>(-1)
  const carouselItemDetails = ref<TCarouselUnion | null>(null)
  const current = ref<TApiCarouselUnion | null>(null)

  const carouselComputed = computed(() => {
    if (current.value === null) {
      return undefined
    }

    switch (collectionName.value) {
      case 'main': {
        const car = current.value as TApiCarousel<'main'>
        const media = buildMedia(car.urls, derived.value.module)
        const tagAndSlug = tagAndSlugFromId(car.id)
        return { ...car, media, ...tagAndSlug }
      }

      case 'media': {
        const car = current.value as TApiCarousel<'media'>
        const media = buildMedia(car.urls, derived.value.module)
        return {
          ...car,
          media,
          size: (car.size / 1000000).toFixed(2).toString() + 'MB',
          tag: '',
          text: '',
          title: '',
        }
      }
      case 'related':
      default: {
        const car = current.value as TApiCarousel<'related'>
        const media = buildMedia(car.urls, car.module)
        const tagAndSlug = tagAndSlugFromId(car.id)
        return { ...car, media, ...tagAndSlug }
      }
    }
  })

  const sourceArrayLength = computed(() => {
    const store = getCollectionStore(collectionName.value)
    return store.array.length
  })

  async function open(source: TCName, openIndex: number) {
    collectionName.value = source
    const arrayElement = arrayElementByIndex(source, openIndex)
    const res = await loadItem(arrayElement)

    if (res.success) {
      index.value = openIndex
      isOpen.value = true
      return { success: true }
    } else {
      return res
    }
  }

  async function loadItem(arrayElement: TCArray) {
    switch (collectionName.value) {
      case 'main':
        return await loadCarouselMain(arrayElement as TArrayByCName<'main'>)

      case 'media':
        return await loadCarouselMedia(arrayElement as TArrayByCName<'media'>)

      case 'related':
        return loadCarouselRelated(arrayElement as TArrayByCName<'related'>)
    }
  }

  async function loadCarouselMain(
    item: TArrayByCName<'main'>,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const res = await send<TApiCarousel<'main'>>('carousel/show', 'post', {
      source: 'main',
      module: derived.value.module,
      module_id: item,
    })

    if (res.success) {
      carouselItemDetails.value = {
        ...res.data,
        ...tagAndSlugFromId(res.data.id),
        media: buildMedia(res.data.urls, derived.value.module),
      }
      current.value = res.data
    } else {
      return { success: false, message: `Failed to load carousel item.` }
      //pushHome('Failed to load carousel item. Redirected to home page.')
    }
    return { success: true }
  }

  async function loadCarouselMedia(
    item: TArrayByCName<'media'>,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const res = await send<TApiCarousel<'media'>>('carousel/show', 'post', {
      source: 'media',
      module: derived.value.module, //required to exist by App\Http\Requests\ModuleRequest.prepaerForValidation()
      media_id: (<TApiCarousel<'media'>>item).id,
    })

    if (res.success) {
      carouselItemDetails.value = {
        id: (<TApiCarousel<'media'>>item).id,
        tag: <string>derived.value.tag,
        media: buildMedia(res.data.urls),
        size: (res.data.size / 1000000).toFixed(2).toString() + 'MB',
        collection_name: res.data.collection_name,
        file_name: res.data.file_name,
        order_column: res.data.order_column,
        title: res.data.title,
        text: res.data.text,
      }
      current.value = res.data
      return { success: true }
    } else {
      return { success: false, message: `Failed to load carousel item.` }
    }
  }

  async function loadCarouselRelated(
    item: TArrayByCName<'related'>,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const tmp = <TArrayByCName<'related'>>item
    carouselItemDetails.value = {
      ...tmp,
      ...tagAndSlugFromId(tmp.id, tmp.module),
      media: buildMedia(tmp.urls, tmp.module),
    }
    current.value = tmp
    return { success: true }
  }

  async function nextItem(
    isRight: boolean,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const nextItem = nextArrayElement(collectionName.value, index.value, isRight)
    const res = await loadItem(nextItem.item)

    if (res.success) {
      index.value = nextItem.index
      return { success: true }
    } else {
      return res
    }
  }

  async function close(): Promise<{ success: true } | { success: false; message: string }> {
    //if current current is in currently loaded page - close, otherwise, load relevant page

    switch (collectionName.value) {
      case 'main':
        {
          const { useCollectionMainStore } = await import('../collections/collectionMain')
          const { elementIsInPage } = useCollectionMainStore()
          const { viewIndex } = storeToRefs(useCollectionMainStore())
          const view = getViewName('main', viewIndex.value)
          const ipp = getItemsPerPage('main', viewIndex.value)
          if (!elementIsInPage(<string>carouselItemDetails.value?.id)) {
            const index = indexByArrayElement(
              'main',
              <string>(<TCarousel<'main'>>carouselItemDetails.value).id,
            )
            const res = await loadPageByItemIndex(
              collectionName.value,
              view,
              ipp,
              index,
              <TModule>derived.value.module,
            )
            if (!res.success) {
              return res
            }
          } else {
            console.log(`carousel.close() no need to load a new page`)
          }
        }
        break
      case 'media':
        console.log(`carousel.close() media not loading new page (YET)`)
        break
      case 'related':
        console.log(`carousel.close() related not loading new page (YET)`)
    }
    isOpen.value = false
    return { success: true }
  }

  return {
    isOpen,
    collectionName,
    carouselItemDetails,
    ///
    current,
    carouselComputed,
    ////
    sourceArrayLength,
    index,
    open,
    close,
    nextItem,
  }
})
