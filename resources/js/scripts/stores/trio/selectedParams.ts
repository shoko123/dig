import { defineStore, storeToRefs } from 'pinia'
import { TrioSourceName } from '../../../types/trioTypes'

import { useTrioStore } from './trio'
import { useItemStore } from '../item'
import { useFilterStore } from './filter'
import { useTaggerStore } from './tagger'

type TGroup = { label: string; params: string[] }
type TCat = { label: string; groups: TGroup[] }

export const useTrioSelectedStore = defineStore('trioSelected2', () => {
  const { trio, groupLabelToKey } = storeToRefs(useTrioStore())
  const { selectedItemParams } = storeToRefs(useItemStore())
  const { selectedFilterParams } = storeToRefs(useFilterStore())
  const { selectedNewItemParams } = storeToRefs(useTaggerStore())

  function selectedTrio(sourceName: TrioSourceName) {
    if (trio.value.categories.length === 0) {
      return []
    }

    let params: string[] = []
    const groups = <TGroup[]>[]
    const cats = <TCat[]>[]

    //choose source
    switch (sourceName) {
      case 'Filter':
        params = selectedFilterParams.value
        break
      case 'Item':
        params = selectedItemParams.value.filter(
          (x) => trio.value.paramsObj[x].text !== 'Unassigned',
        )
        break
      case 'New':
        params = selectedNewItemParams.value
        break
    }

    //order params by their keys
    params.sort((a, b) => {
      return a > b ? 1 : -1
    })

    //push params into "groups" objects array, each entry consisting of label and its params array
    params.forEach((p) => {
      const group = trio.value.groupsObj[trio.value.paramsObj[p].groupKey]

      const i = groups.findIndex((g) => {
        return g.label === group.label
      })

      if (i === -1) {
        //if new group, push the param's group into the groups array with itself as the first param
        groups.push({ label: group.label, params: [trio.value.paramsObj[p].text] })
      } else {
        //if the group is already selected, add param's text to the group's params array
        groups[i].params.push(trio.value.paramsObj[p].text)
      }
    })

    //Now all the groups are organized in a sorted array, find their categories.
    groups.forEach((g) => {
      const group = trio.value.groupsObj[groupLabelToKey.value[g.label]]
      const cat = trio.value.categories[group.categoryIndex]

      const i = cats.findIndex((c) => {
        return c.label === cat.name
      })

      if (i === -1) {
        //if the group belongs to a new category, push the new category into the categories array with itself as the first group
        cats.push({ label: cat.name, groups: [g] })
      } else {
        //if the category is already selected, add the group label to the category's groups array
        cats[i].groups.push(g)
      }
    })
    return cats
  }

  return {
    selectedTrio,
  }
})
