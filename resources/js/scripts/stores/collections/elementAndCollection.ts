import type { TCName, TArray, TPage } from '@/types/collectionTypes'

import { defineStore } from 'pinia'

import { useCollectionsStore } from './collections'

export const useElementAndCollectionStore = defineStore('elementAndCollection', () => {
  const { getCollectionStore } = useCollectionsStore()

  function arrayElementByIndex(name: TCName, index: number): TArray {
    const c = getCollectionStore(name)
    return c.array[index]
  }

  function indexByArrayElement(collectionName: TCName, element: TArray) {
    const c = getCollectionStore(collectionName)
    const index = c.array.findIndex((x) => {
      return c.arrayEqualFunc(x, element)
    })
    console.log(
      `indexByArrayElement() name: ${collectionName}, element: ${JSON.stringify(element, null, 2)}\n=> ${index}`,
    )
    return index
  }

  function elementInPage<A extends TArray, C extends TCName>(collectionName: C, element: A) {
    const c = getCollectionStore(collectionName)
    return c.page.some((x) => {
      return c.pageEqualFunc(element, <TPage>x)
    })
  }

  function nextArrayIndex(name: TCName, index: number, isRight: boolean) {
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
    name: TCName,
    index: number,
    isRight: boolean,
  ): { item: TArray; index: number } {
    const newIndex = nextArrayIndex(name, index, isRight)
    return { item: arrayElementByIndex(name, newIndex), index: newIndex }
  }

  return {
    arrayElementByIndex,
    nextArrayElement,
    nextArrayIndex,
    indexByArrayElement,
    elementInPage,
  }
})
