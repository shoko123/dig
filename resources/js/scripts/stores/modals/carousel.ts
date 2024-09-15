// stores/media.js
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TCollectionName, TApiArray, TCollectionArrays } from '@/js/types/collectionTypes'
import { TCarousel, TApiCarousel, TCarouselUnion } from '@/js/types/mediaTypes'
import { TModule } from '@/js/types/moduleTypes'

import { useCollectionsStore } from '../collections/collections'
import { useElementAndCollectionStore } from '../collections/elementAndCollection'
// import { useRoutesMainStore } from '../routes/routesMain'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useItemStore } from '../item'

export const useCarouselStore = defineStore('carousel', () => {
  const { getCollectionStore, loadPageByItemIndex } = useCollectionsStore()
  const { send } = useXhrStore()
  // const { current } = storeToRefs(useRoutesMainStore())
  const { derived } = storeToRefs(useItemStore())
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId, getViewName, getItemsPerPage } = useModuleStore()
  const { arrayElementByIndex, nextArrayElement } = useElementAndCollectionStore()

  const isOpen = ref<boolean>(false)
  const collectionName = ref<TCollectionName>('main')
  const index = ref<number>(-1)
  const carouselItemDetails = ref<TCarouselUnion | null>(null)

  const sourceArrayLength = computed(() => {
    const store = getCollectionStore(collectionName.value)
    return store.array.length
  })

  async function open(
    source: TCollectionName,
    openIndex: number,
  ): Promise<{ success: true } | { success: false; message: string }> {
    collectionName.value = source
    const arrayElement = arrayElementByIndex(source, openIndex)
    let res: { success: true } | { success: false; message: string } = {
      success: false,
      message: '',
    }
    res = await loadItem(arrayElement)
    // switch (collectionName.value) {
    //   case 'main':
    //     res = await loadMainCarouselItem(element as TApiArray<'main'>)
    //     break
    //   case 'media':
    //     res = await loadMediaCarouselItem(element as TApiArray<'media'>)
    //     break
    //   case 'related':
    //     res = await loadRelatedCarouselItem(element as TApiArray<'related'>)
    //     break
    // }

    // const tagAndSlug = tagAndSlugFromId(id, current.value.module)

    ///////

    //console.log(`carousel.open() source: ${collectionName.value} index: ${openIndex}`)
    // const item = itemByIndex(source, openIndex)
    // const res = await loadCarouselItem(id)
    if (res.success) {
      index.value = openIndex
      isOpen.value = true
      return { success: true }
    } else {
      return res
    }
  }

  async function loadMainCarouselItem(
    item: TApiArray<'main'>,
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
    } else {
      return { success: false, message: `Failed to load carousel item.` }
      //pushHome('Failed to load carousel item. Redirected to home page.')
    }
    return { success: true }
  }

  async function loadMediaCarouselItem(
    item: TApiArray<'media'>,
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
      return { success: true }
    } else {
      return { success: false, message: `Failed to load carousel item.` }
    }
  }

  async function loadRelatedCarouselItem(
    item: TApiArray<'related'>,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const tmp = <TApiArray<'related'>>item
    carouselItemDetails.value = {
      ...tmp,
      ...tagAndSlugFromId(tmp.id, tmp.module),
      media: buildMedia(tmp.media, tmp.module),
    }
    return { success: true }
  }

  // async function loadCarouselItem(
  //   item: TCollectionArrays,
  // ): Promise<{ success: true } | { success: false; message: string }> {
  //   switch (collectionName.value) {
  //     case 'main':
  //       {
  //         const res = await send<TApiCarousel<'main'>>('carousel/show', 'post', {
  //           source: 'main',
  //           module: derived.value.module,
  //           module_id: <TApiArray>item,
  //         })
  //         if (res.success) {
  //           carouselItemDetails.value = {
  //             ...res.data,
  //             ...tagAndSlugFromId(res.data.id),
  //             media: buildMedia(res.data.urls, derived.value.module),
  //           }
  //         } else {
  //           return { success: false, message: `Failed to load carousel item.` }
  //           //pushHome('Failed to load carousel item. Redirected to home page.')
  //         }
  //       }
  //       break
  //     case 'media':
  //       {
  //         const res = await send<TApiCarousel<'media'>>('carousel/show', 'post', {
  //           source: 'media',
  //           module: derived.value.module, //required to exist by App\Http\Requests\ModuleRequest.prepaerForValidation()
  //           media_id: (<TApiCarousel<'media'>>item).id,
  //         })

  //         if (res.success) {
  //           carouselItemDetails.value = {
  //             id: (<TApiCarousel<'media'>>item).id,
  //             tag: <string>derived.value.tag,
  //             media: buildMedia(res.data.urls),
  //             size: (res.data.size / 1000000).toFixed(2).toString() + 'MB',
  //             collection_name: res.data.collection_name,
  //             file_name: res.data.file_name,
  //             order_column: res.data.order_column,
  //             title: res.data.title,
  //             text: res.data.text,
  //           }
  //         } else {
  //           return { success: false, message: `Failed to load carousel item.` }
  //         }
  //       }
  //       break

  //     case 'related':
  //       {
  //         const tmp = <TApiArray<'related'>>item
  //         carouselItemDetails.value = {
  //           ...tmp,
  //           ...tagAndSlugFromId(tmp.id, tmp.module),
  //           media: buildMedia(tmp.media, tmp.module),
  //         }
  //       }
  //       break
  //   }
  //   return { success: true }
  // }

  async function loadItem(arrayElement: TCollectionArrays) {
    let res: { success: true } | { success: false; message: string } = {
      success: false,
      message: '',
    }
    switch (collectionName.value) {
      case 'main':
        res = await loadMainCarouselItem(arrayElement as TApiArray<'main'>)
        break
      case 'media':
        res = await loadMediaCarouselItem(arrayElement as TApiArray<'media'>)
        break
      case 'related':
        res = await loadRelatedCarouselItem(arrayElement as TApiArray<'related'>)
        break
    }
    return res
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

  // async function nextItem(
  //   isRight: boolean,
  // ): Promise<{ success: true } | { success: false; message: string }> {
  //   const nextItem = next(collectionName.value, index.value, isRight)
  //   const res = await loadCarouselItem(itemByIndex(collectionName.value, nextItem.index))

  //   if (res.success) {
  //     index.value = nextItem.index
  //     return { success: true }
  //   } else {
  //     return res
  //   }
  // }

  async function close(): Promise<{ success: true } | { success: false; message: string }> {
    //if current carouselItem is in currently loaded page - close, otherwise, load relevant page

    switch (collectionName.value) {
      case 'main':
        {
          const { useElementAndCollectionStore } = await import(
            '../collections/elementAndCollection'
          )
          const { indexByArrayItem } = useElementAndCollectionStore()
          const { useCollectionMainStore } = await import('../collections/collectionMain')
          const { itemIsInPage } = useCollectionMainStore()
          const { viewIndex } = storeToRefs(useCollectionMainStore())
          const view = getViewName('main', viewIndex.value)
          const ipp = getItemsPerPage('main', viewIndex.value)
          if (!itemIsInPage(<string>carouselItemDetails.value?.id)) {
            // const index = itemIndexById<string>((<TCarousel<'main'>>carouselItemDetails.value).id)
            const index = indexByArrayItem(
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
    sourceArrayLength,
    index,
    open,
    close,
    nextItem,
  }
})
