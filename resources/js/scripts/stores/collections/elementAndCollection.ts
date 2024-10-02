import type { TCName, TArray, TPage } from '@/types/collectionTypes'

import { ref, computed } from 'vue'
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

  function setElementIndex(indexName: TIndexName, collectionName: TCName, index: number) {
    indices.value[indexName].collectionName = collectionName
    indices.value[indexName].index = index
  }

  function setIndexByElement(indexName: TIndexName, collectionName: TCName, element: TArray) {
    const c = getCollectionStore(collectionName)
    const index = c.array.findIndex((x) => {
      return c.arrayEqualFunc(x, element)
    })
    indices.value[indexName] = { collectionName, index }
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

  // debug
  const showElement = computed(() => {
    return getElement('Show')
  })

  const carouselElement = computed(() => {
    return getElement('Carousel')
  })
  // debug end

  function getElement(indexName: TIndexName) {
    if (indices.value[indexName].index === -1) {
      return undefined
    }
    const c = getCollectionStore(indices.value[indexName].collectionName)
    return c.array[indices.value[indexName].index]
  }

  function arrayLength(indexName: TIndexName) {
    const c = getCollectionStore(indices.value[indexName].collectionName)
    return c.array.length
  }

  function elementInPage<A extends TArray, C extends TCName>(collectionName: C, element: A) {
    const c = getCollectionStore(collectionName)
    return c.page.some((x) => {
      return c.pageEqualFunc(element, <TPage>x)
    })
  }

  return {
    indices,
    setElementIndex,
    setIndexByElement,
    resetElementIndex,
    setNextIndex,
    getElement,
    arrayLength,
    elementInPage,
    // debug
    showElement,
    carouselElement,
    // debug- end
  }
})
