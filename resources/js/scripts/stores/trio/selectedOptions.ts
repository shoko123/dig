import { defineStore, storeToRefs } from 'pinia'
import { TrioSourceName, TGroupField } from '../../../types/trioTypes'

import { useTrioStore } from './trio'
import { useItemStore } from '../item'

type TGroup = { label: string; options: string[] }
type TCat = { label: string; groups: TGroup[] }

export const useTrioSelectedStore = defineStore('trioSelected', () => {
  const { trio, groupLabelToGroupKeyObj, filterAllOptions, taggerAllOptions } =
    storeToRefs(useTrioStore())
  const { itemAllOptions } = storeToRefs(useItemStore())

  function selectedTrio(sourceName: TrioSourceName) {
    if (trio.value.categories.length === 0) {
      return []
    }

    let options: string[] = []
    const groups = <TGroup[]>[]
    const cats = <TCat[]>[]

    //choose source
    switch (sourceName) {
      case 'Filter':
        options = filterAllOptions.value
        break
      case 'Item':
        options = itemAllOptions.value.filter((x) => {
          const group = trio.value.groupsObj[trio.value.optionsObj[x].groupKey]
          if (group.code === 'FD') {
            if (!(<TGroupField>group).show_in_item_tags) {
              return false
            } else {
              //on lookup fields we assume that the first item is always 'unassigned' and won't display it.
              return (<TGroupField>group).tag_source === 'Lookup' &&
                group.optionKeys.indexOf(x) === 0
                ? false
                : true
            }
          } else {
            return true
          }
        })
        break
      case 'Tagger':
        options = taggerAllOptions.value
        break
    }

    //order options by their keys
    options.sort((a, b) => {
      return a > b ? 1 : -1
    })

    //push options into "groups" objects array, each entry consisting of label and its options array
    options.forEach((p) => {
      const group = trio.value.groupsObj[trio.value.optionsObj[p].groupKey]

      const i = groups.findIndex((g) => {
        return g.label === group.label
      })

      if (i === -1) {
        //if new group, push the option's group into the groups array with itself as the first option
        groups.push({ label: group.label, options: [trio.value.optionsObj[p].text] })
      } else {
        //if the group is already selected, add option's text to the group's options array
        groups[i].options.push(trio.value.optionsObj[p].text)
      }
    })

    //Now all the groups are organized in a sorted array, find their categories.
    groups.forEach((g) => {
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[g.label]]
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
