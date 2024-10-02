import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TCName, TArray } from '@/types/collectionTypes'
import { TApiCarousel, TApiCarouselUnion } from '@/types/mediaTypes'

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
  const { tagAndSlugFromId, getItemsPerPage } = useModuleStore()
  const {
    elementInPage,
    resetElementIndex,
    setIndexByElement,
    setElementIndex,
    setNextIndex,
    getElement,
    arrayLength,
  } = useElementAndCollectionStore()
  const { indices } = storeToRefs(useElementAndCollectionStore())
  const isOpen = ref<boolean>(false)
  const current = ref<TApiCarouselUnion | null>(null)

  const collectionName = computed(() => {
    return indices.value.Carousel.collectionName
  })

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

  const index = computed(() => {
    return indices.value.Carousel.index
  })

  const carouselArrayLength = computed(() => {
    return arrayLength('Carousel')
  })

  async function open(source: TCName, openIndex: number) {
    setElementIndex('Carousel', source, openIndex)
    const res = await loadCarousel(getElement('Carousel')!)
    if (res) {
      isOpen.value = true
      return true
    } else {
      console.log(`*** Failed to load carousel item.`)
      return false
    }
  }

  async function loadCarousel(arrayElement: TArray): Promise<boolean> {
    switch (indices.value.Carousel.collectionName) {
      case 'related':
        current.value = arrayElement as TArray<'related'>
        return true
      case 'main':
        return await loadCarouselMain(arrayElement as TArray<'main'>)

      case 'media':
        return await loadCarouselMedia(arrayElement as TArray<'media'>)
    }
  }

  async function loadCarouselMain(item: TArray<'main'>) {
    const res = await send<TApiCarousel<'main'>>('carousel/show', 'post', {
      source: 'main',
      module: derived.value.module,
      module_id: item,
    })
    return handleXhrResult(res)
  }

  async function loadCarouselMedia(item: TArray<'media'>) {
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
  ) {
    if (res.success) {
      current.value = res.data
      return true
    } else {
      console.log(`carousel.load() failed. error: ${res.message}`)
      return false
    }
  }

  async function nextItem(isRight: boolean) {
    setNextIndex('Carousel', isRight)
    return await loadCarousel(getElement('Carousel')!)
  }

  async function close(): Promise<boolean> {
    let element: TArray

    switch (collectionName.value) {
      case 'main': {
        const car = carouselComputed.value as unknown as TApiCarousel<'main'>
        element = car.id
        break
      }

      case 'media': {
        const car = carouselComputed.value as unknown as TApiCarousel<'media'>
        element = { id: car.id, order_column: car.order_column, urls: car.urls }
        break
      }
      case 'related': {
        const car = carouselComputed.value as unknown as TApiCarousel<'related'>
        element = { ...car }
        break
      }
    }

    //If current carousel item is in the currently loaded page, close.
    if (elementInPage(collectionName.value, element)) {
      console.log(`carousel.close() no need to load a new page`)
      isOpen.value = false
      resetElementIndex(['Carousel'])
      return true
    }

    console.log(`carousel.close() - load new page by element: ${JSON.stringify(element, null, 2)}`)
    const store = getCollectionStore(collectionName.value)
    const ipp = getItemsPerPage(collectionName.value, store.viewIndex)
    setIndexByElement('Carousel', collectionName.value, element)

    const res = await loadPageByItemIndex(
      collectionName.value,
      'Gallery',
      ipp,
      indices.value.Carousel.index,
      derived.value.module!,
    )

    isOpen.value = false
    resetElementIndex(['Carousel'])
    return res.success
  }

  return {
    isOpen,
    collectionName,
    current,
    carouselComputed,
    carouselArrayLength,
    index,
    open,
    close,
    nextItem,
  }
})
