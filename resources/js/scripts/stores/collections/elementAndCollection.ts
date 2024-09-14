import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { TCollectionName, TCollectionArrays } from '@/js/types/collectionTypes'

import { useCollectionsStore } from './collections'

export const useElementAndCollectionStore = defineStore('elementAndCollection', () => {
  const { getCollectionStore } = useCollectionsStore()

  const showIndex = ref(-1)
  const carouselIndex = ref(-1)

  const getShowIndex = computed(() => {
    return showIndex.value
  })

  const getCarouselIndex = computed(() => {
    return carouselIndex.value
  })

  function arrayElementByIndex(name: TCollectionName, index: number): TCollectionArrays {
    const c = getCollectionStore(name)
    return c.array[index]
  }

  function indexByArrayItem(collectionName: TCollectionName, item: TCollectionArrays) {
    const c = getCollectionStore(collectionName)
    const index = c.array.findIndex((x) => {
      return c.arrayEqualFunc(x, item)
    })
    //console.log(`collectionMain.itemIndexById(id:${id}) array: ${JSON.stringify(array.value.slice(0,5), null, 2)} index: ${index}`)
    return index
  }

  function nextArrayIndex(name: TCollectionName, index: number, isRight: boolean) {
    const c = getCollectionStore(name)
    const length = c.array.length
    let newIndex

    if (isRight) {
      newIndex = index === length - 1 ? 0 : index + 1
    } else {
      newIndex = index === 0 ? length - 1 : index - 1
    }
    return newIndex
  }

  function nextArrayElement(
    name: TCollectionName,
    index: number,
    isRight: boolean,
  ): { item: TCollectionArrays; index: number } {
    const newIndex = nextArrayIndex(name, index, isRight)
    return { item: arrayElementByIndex(name, newIndex), index: newIndex }
  }

  //  function nextArrayElement(
  //     name: TCollectionName,
  //     index: number,
  //     isRight: boolean,
  //   ): { item: TCollectionArrays; index: number } {
  //     const c = getCollectionStore(name)
  //     const length = c.array.length
  //     let newIndex

  //     if (isRight) {
  //       newIndex = index === length - 1 ? 0 : index + 1
  //     } else {
  //       newIndex = index === 0 ? length - 1 : index - 1
  //     }
  //     return { item: c.array[newIndex], index: newIndex }
  //   }

  function getElementIndex<IDtype extends string | number>(id: IDtype) {
    return id
  }

  function elementInPage<IDtype extends string | number>(id: IDtype) {
    return id
  }

  return {
    getShowIndex,
    getCarouselIndex,
    getElementIndex,
    elementInPage,
    arrayElementByIndex,
    nextArrayElement,
    nextArrayIndex,
    indexByArrayItem,
  }
})
