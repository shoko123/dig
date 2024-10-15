import { defineStore, storeToRefs } from 'pinia'
import type { TArray } from '@/types/collectionTypes'
import { useXhrStore } from '../xhr'
import { useModuleStore } from '../module'
import { useTrioStore } from './trio'

export const useFilterStore = defineStore('filter', () => {
  const trioStore = useTrioStore()
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())

  function filtersToQueryObject() {
    const q: {
      [key: string]: string
    } = {}

    trioStore.filterAllOptionKeys.sort((a, b) => {
      return a > b ? 1 : -1
    })

    trioStore.filterAllOptionKeys.forEach((k) => {
      const optionUlined = trioStore.trio.optionsObj[k]!.text.replace(/ /g, '_')
      const groupUlined = trioStore.trio.groupsObj[
        trioStore.trio.optionsObj[k]!.groupKey
      ]!.label.replace(/ /g, '_')
      if (Object.prototype.hasOwnProperty.call(q, groupUlined)) {
        q[groupUlined] += ',' + optionUlined
      } else {
        q[groupUlined] = optionUlined
      }
    })
    console.log(`filtersToQueryObject().q: ${JSON.stringify(q, null, 2)}`)
    return q
  }

  async function getCount() {
    const res = await send<TArray[]>('module/index', 'post', {
      module: module.value,
      query: trioStore.filterApiQueryParams(),
    })
    return res.success ? res.data.length : -1
  }

  // const textSearchOptionKeys = computed(() => {
  //   return (<TGroupBase>currentGroup.value).optionKeys
  // })

  function searchTextChanged(index: number, val: string) {
    const textSearchOptionKeys = trioStore.currentGroup?.optionKeys
    const optionKey = textSearchOptionKeys![index]!
    //console.log(`changeOccured() index: ${index} setting option with key ${optionKey} to: ${val}`)
    trioStore.trio.optionsObj[optionKey]!.text = val

    //add/remove from selected filters
    const inSelected = trioStore.filterAllOptionKeys.includes(optionKey)
    if (inSelected && val === '') {
      const i = trioStore.filterAllOptionKeys.indexOf(optionKey)
      trioStore.filterAllOptionKeys.splice(i, 1)
    }
    if (!inSelected && val !== '') {
      trioStore.filterAllOptionKeys.push(optionKey)
    }
  }

  function searchTextClearCurrent() {
    console.log(`clear()`)
    const textSearchOptionKeys = trioStore.currentGroup?.optionKeys
    textSearchOptionKeys!.forEach((x) => {
      trioStore.trio.optionsObj[x]!.text = ''

      //if currently in selectedFilters, then remove.
      if (trioStore.filterAllOptionKeys.includes(x)) {
        const i = trioStore.filterAllOptionKeys.indexOf(x)
        trioStore.filterAllOptionKeys.splice(i, 1)
      }
    })
  }

  return {
    filtersToQueryObject,
    getCount,
    searchTextChanged,
    searchTextClearCurrent,
  }
})
