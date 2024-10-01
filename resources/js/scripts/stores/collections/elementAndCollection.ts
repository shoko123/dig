import type { TCName, TArray, TPage } from '@/types/collectionTypes'

import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useCollectionsStore } from './collections'

type TIndexName = 'Show' | 'Carousel'
type TIndexInfo = { index: number; collectionName: TCName }
type TIndices = Record<TIndexName, TIndexInfo>

export const useElementAndCollectionStore = defineStore('elementAndCollection', () => {
  const { getCollectionStore } = useCollectionsStore()

  const indices = ref<TIndices>({
    Show: { index: -1, collectionName: 'main' },
    Carousel: { index: -1, collectionName: 'main' },
  })

  function setIndexByElement(indexName: TIndexName, collectionName: TCName, element: TArray) {
    const c = getCollectionStore(collectionName)
    const index = c.array.findIndex((x) => {
      return c.arrayEqualFunc(x, element)
    })
    indices.value[indexName] = { collectionName, index }
  }

  function getElement(indexName: TIndexName) {
    const m = indices.value[indexName]
    if (m.index === -1) {
      return undefined
    }
    const c = getCollectionStore(indices.value[indexName].collectionName)
    return c.array[indices.value[indexName].index]
  }

  function setNextIndex(indexName: TIndexName, isRight: boolean) {
    const c = getCollectionStore(indices.value[indexName].collectionName)
    const currentIndex = indices.value[indexName].index
    const nextIndex = isRight
      ? currentIndex === c.array.length - 1
        ? 0
        : currentIndex + 1
      : currentIndex === 0
        ? c.array.length - 1
        : currentIndex - 1

    indices.value[indexName].index = nextIndex
  }

  function resetElementIndex(indexName: TIndexName[]) {
    indexName.forEach((element) => {
      indices.value[element].index = -1
      indices.value[element].collectionName = 'main'
    })
  }

  function arrayElementByIndex(name: TCName, index: number): TArray {
    const c = getCollectionStore(name)
    return c.array[index]!
  }

  function indexByArrayElement(collectionName: TCName, element: TArray) {
    setIndexByElement('Show', collectionName, element)
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
    indices,
    setIndexByElement,
    resetElementIndex,
    setNextIndex,
    getElement,
    arrayElementByIndex,
    nextArrayElement,
    nextArrayIndex,
    indexByArrayElement,
    elementInPage,
  }
})
