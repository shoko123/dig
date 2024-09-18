import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TCName, TArrayByCName, TCArray } from '@/js/types/collectionTypes'
import { TCarousel, TApiCarousel, TApiCarouselUnion } from '@/js/types/mediaTypes'

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
    const res = await loadCarousel(arrayElement)

    if (res.success) {
      index.value = openIndex
      isOpen.value = true
      return { success: true }
    } else {
      return res
    }
  }

  async function loadCarousel(
    arrayElement: TCArray,
  ): Promise<{ success: true } | { success: false; message: string }> {
    switch (collectionName.value) {
      case 'related':
        current.value = arrayElement as TArrayByCName<'related'>
        return { success: true }
      case 'main':
        return await loadCarouselMain(arrayElement as TArrayByCName<'main'>)

      case 'media':
        return await loadCarouselMedia(arrayElement as TArrayByCName<'media'>)
    }
  }

  async function loadCarouselMain(item: TArrayByCName<'main'>) {
    const res = await send<TApiCarousel<'main'>>('carousel/show', 'post', {
      source: 'main',
      module: derived.value.module,
      module_id: item,
    })
    return handleXhrResult(res)
  }

  async function loadCarouselMedia(item: TArrayByCName<'media'>) {
    const res = await send<TApiCarousel<'media'>>('carousel/show', 'post', {
      source: 'media',
      module: derived.value.module,
      media_id: (<TApiCarousel<'media'>>item).id,
    })
    return handleXhrResult(res)
  }

  function handleXhrResult(
    res:
      | { success: true; data: TApiCarousel<'main' | 'media'> }
      | { success: false; message: string },
  ): { success: true } | { success: false; message: string } {
    if (res.success) {
      current.value = res.data
      return { success: true }
    } else {
      return { success: false, message: `Failed to load carousel item.` }
    }
  }

  async function nextItem(isRight: boolean) {
    const nextItem = nextArrayElement(collectionName.value, index.value, isRight)
    const res = await loadCarousel(nextItem.item)

    if (res.success) {
      index.value = nextItem.index
    }
    return res
  }

  async function close(): Promise<{ success: true } | { success: false; message: string }> {
    //if current current is in currently loaded page - close, otherwise, load relevant page

    switch (collectionName.value) {
      case 'main':
        {
          const mainStore = getCollectionStore('main')
          const view = getViewName('main', mainStore.viewIndex)
          const ipp = getItemsPerPage('main', mainStore.viewIndex)
          if (mainStore.elementIsInPage(<string>carouselComputed.value?.id)) {
            console.log(`carousel.close() no need to load a new page`)
          }

          const index = indexByArrayElement(
            'main',
            <string>(<TCarousel<'main'>>carouselComputed.value).id,
          )
          const res = await loadPageByItemIndex(
            collectionName.value,
            view,
            ipp,
            index,
            derived.value.module!,
          )
          if (!res.success) {
            return res
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
    current,
    carouselComputed,
    sourceArrayLength,
    index,
    open,
    close,
    nextItem,
  }
})
