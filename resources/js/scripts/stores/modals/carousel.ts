// stores/media.js
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TCollectionName, TApiArray } from '@/js/types/collectionTypes'
import { TCarousel, TApiCarousel, TCarouselUnion } from '@/js/types/mediaTypes'
import { TModule } from '@/js/types/moduleTypes'
import { useCollectionsStore } from '../collections/collections'
import { useCollectionMainStore } from '../collections/collectionMain'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useItemStore } from '../item'

export const useCarouselStore = defineStore('carousel', () => {
  const c = useCollectionsStore()
  const { extra } = storeToRefs(useCollectionMainStore())
  const { send } = useXhrStore()

  const { derived } = storeToRefs(useItemStore())
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId } = useModuleStore()

  const isOpen = ref<boolean>(false)
  const collectionName = ref<TCollectionName>('main')
  const index = ref<number>(-1)
  const carouselItemDetails = ref<TCarouselUnion | null>(null)

  const arrayLength = computed(() => {
    const collection = c.collection(<TCollectionName>collectionName.value)
    return collection.value.array.length
  })

  async function open(
    source: TCollectionName,
    openIndex: number,
  ): Promise<{ success: true } | { success: false; message: string }> {
    collectionName.value = source
    //console.log(`carousel.open() source: ${collectionName.value} index: ${openIndex}`)
    const res = await loadCarouselItem(c.itemByIndex(source, openIndex))
    if (res.success) {
      index.value = openIndex
      isOpen.value = true
      return { success: true }
    } else {
      return res
    }
  }

  async function next(
    isRight: boolean,
  ): Promise<{ success: true } | { success: false; message: string }> {
    const next = c.next(collectionName.value, index.value, isRight)
    const res = await loadCarouselItem(c.itemByIndex(collectionName.value, next.index))

    if (res.success) {
      index.value = next.index
      return { success: true }
    } else {
      return res
    }
  }

  async function loadCarouselItem(
    item: TApiArray<TCollectionName>,
  ): Promise<{ success: true } | { success: false; message: string }> {
    switch (collectionName.value) {
      case 'main':
        {
          const res = await send<TApiCarousel<'main'>>('model/carousel', 'post', {
            id: <TApiArray>item,
            model: derived.value.module,
          })
          if (res.success) {
            carouselItemDetails.value = {
              ...res.data,
              ...tagAndSlugFromId(<TModule>derived.value.module, res.data.id),
              media: buildMedia(res.data.urls, derived.value.module),
            }
          } else {
            return { success: false, message: `Failed to load carousel item.` }
            //pushHome('Failed to load carousel item. Redirected to home page.')
          }
        }
        break
      case 'media':
        {
          const res = await send<TApiCarousel<'media'>>('media/carousel', 'post', {
            id: (<TApiCarousel<'media'>>item).id,
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
          } else {
            return { success: false, message: `Failed to load carousel item.` }
          }
        }

        break

      case 'related':
        {
          const tmp = <TApiArray<'related'>>item
          carouselItemDetails.value = {
            ...tmp,
            ...tagAndSlugFromId(tmp.module, tmp.id),
            media: buildMedia(tmp.media, tmp.module),
          }
        }
        break
    }
    return { success: true }
  }

  async function close(): Promise<{ success: true } | { success: false; message: string }> {
    //if current carouselItem is in currently loaded page - close, otherwise, load relevant page

    switch (collectionName.value) {
      case 'main':
        {
          const view = extra.value.views[extra.value.viewIndex]
          if (!c.itemIsInPage(<string>carouselItemDetails.value?.id)) {
            const index = c.itemIndexById<string>((<TCarousel<'main'>>carouselItemDetails.value).id)

            const res = await c.loadPageByItemIndex(
              collectionName.value,
              view,
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
    arrayLength,
    index,
    open,
    close,
    next,
  }
})
