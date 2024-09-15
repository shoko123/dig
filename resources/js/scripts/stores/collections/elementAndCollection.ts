import type { TCollectionName, TCollectionArrays } from '@/js/types/collectionTypes'

import { defineStore } from 'pinia'

import { useCollectionsStore } from './collections'

export const useElementAndCollectionStore = defineStore('elementAndCollection', () => {
  const { getCollectionStore } = useCollectionsStore()

  function arrayElementByIndex(name: TCollectionName, index: number): TCollectionArrays {
    const c = getCollectionStore(name)
    return c.array[index]
  }

  function indexByArrayElement(collectionName: TCollectionName, element: TCollectionArrays) {
    const c = getCollectionStore(collectionName)
    const index = c.array.findIndex((x) => {
      return c.arrayEqualFunc(x, element)
    })
    console.log(
      `indexByArrayElement() name: ${collectionName}, element: ${JSON.stringify(element, null, 2)}\n=> ${index}`,
    )
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

  return {
    arrayElementByIndex,
    nextArrayElement,
    nextArrayIndex,
    indexByArrayElement,
  }
})
