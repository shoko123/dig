// stores/trio.jsTGroupBase
import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TGroupBase, TGroupField } from '@/js/types/trioTypes'
import type { TApiFilters } from '@/js/types/routesTypes'
import type { TApiArray } from '@/js/types/collectionTypes'
import { useTrioStore } from './trio'
import { useXhrStore } from '../xhr'
import { useModuleStore } from '../module'
import { assert } from '../../utils/utils'

export const useFilterStore = defineStore('filter', () => {
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())
  const { trio, orderByAvailable, orderByGroup, orderByOptions, currentGroup, filterAllOptions } =
    storeToRefs(useTrioStore())

  function filtersToQueryObject() {
    const q: {
      [key: string]: string
    } = {}

    filterAllOptions.value.sort((a, b) => {
      return a > b ? 1 : -1
    })

    filterAllOptions.value.forEach((k) => {
      const optionUlined = trio.value.optionsObj[k].text.replace(/ /g, '_')
      const groupUlined = trio.value.groupsObj[trio.value.optionsObj[k].groupKey].label.replace(
        / /g,
        '_',
      )
      if (Object.prototype.hasOwnProperty.call(q, groupUlined)) {
        q[groupUlined] += ',' + optionUlined
      } else {
        q[groupUlined] = optionUlined
      }
    })
    console.log(`filtersToQueryObject().q: ${JSON.stringify(q, null, 2)}`)
    return q
  }

  const apiQueryPayload = computed<TApiFilters>(() => {
    const all: TApiFilters = {
      model_tag_ids: [],
      global_tag_ids: [],
      field_value: [],
      field_search: [],
      media: [],
      order_by: [],
    }

    if (trio.value.categories.length === 0) {
      return all
    }

    //push options into their correct arrays, according to group type
    filterAllOptions.value.forEach((key) => {
      const option = trio.value.optionsObj[key]
      const group = trio.value.groupsObj[trio.value.optionsObj[key].groupKey]

      switch (group.code) {
        case 'FD':
          {
            const i = all.field_value.findIndex((x) => {
              return x.field_name === (<TGroupField>group).field_name
            })

            if (i === -1) {
              //if new group, push the option's group into the groups array with itself as the first option
              all.field_value.push({
                field_name: (<TGroupField>group).field_name,
                vals: [option.extra],
                source: (<TGroupField>group).tag_source,
              })
            } else {
              //if the group is already selected, add option's text to the group's options array
              //all.field_value[i].vals.push(option.text)
              all.field_value[i].vals.push(option.extra)
            }
          }
          break

        case 'FS':
          {
            const i = all.field_search.findIndex((x) => {
              return x.field_name === (<TGroupField>group).field_name
            })
            if (i === -1) {
              //if new group, push the option's group into the groups array with itself as the first option
              all.field_search.push({
                field_name: (<TGroupField>group).field_name,
                vals: [option.text],
              })
            } else {
              //if the group is already selected, add option's text to the group's options array
              all.field_search[i].vals.push(option.text)
            }
          }
          break

        case 'TM':
          all.model_tag_ids.push(<number>option.extra)
          break

        case 'TG':
          all.global_tag_ids.push(<number>option.extra)
          break

        case 'MD':
          all.media.push(option.text)
          break

        case 'OB':
          {
            const ordeByItem = orderByOptions.value.find((x) => x.text === option.text.slice(0, -2))
            assert(ordeByItem !== undefined, `Selected OrderBy option "${option.text} not found`)

            all.order_by.push({
              field_name: <string>ordeByItem.extra,
              asc: option.text.slice(-1) === 'A',
            })
          }
          break
      }
    })
    return all
  })

  async function getCount() {
    const res = await send<TApiArray[]>('module/index', 'post', {
      module: module.value,
      query: apiQueryPayload.value,
    })
    return res.success ? res.data.length : -1
  }

  const textSearchOptionKeys = computed(() => {
    return (<TGroupBase>currentGroup.value).optionKeys
  })

  function searchTextChanged(index: number, val: string) {
    const optionKey = textSearchOptionKeys.value[index]
    //console.log(`changeOccured() index: ${index} setting option with key ${optionKey} to: ${val}`)
    trio.value.optionsObj[optionKey].text = val

    //add/remove from selected filters
    const inSelected = filterAllOptions.value.includes(optionKey)
    if (inSelected && val === '') {
      const i = filterAllOptions.value.indexOf(optionKey)
      filterAllOptions.value.splice(i, 1)
    }
    if (!inSelected && val !== '') {
      filterAllOptions.value.push(optionKey)
    }
  }

  function searchTextClearCurrent() {
    console.log(`clear()`)
    textSearchOptionKeys.value.forEach((x) => {
      trio.value.optionsObj[x].text = ''

      //if currently in selectedFilters, then remove.
      if (filterAllOptions.value.includes(x)) {
        const i = filterAllOptions.value.indexOf(x)
        filterAllOptions.value.splice(i, 1)
      }
    })
  }

  //order by
  ///////////

  function orderOptionClicked(index: number, asc: boolean) {
    const orderByOptions = orderByGroup.value?.optionKeys.map((x) => {
      return { ...trio.value.optionsObj[x], key: x }
    })

    if (orderByOptions === undefined) {
      console.log(`serious error - abort *********`)
      return
    }

    const firstEmptyOption = orderByOptions.find((x) => x.text === '')
    if (firstEmptyOption === undefined) {
      console.log(`serious error - abort *********`)
      return
    }

    const label = `${orderByAvailable.value[index].text}.${asc ? 'A' : 'D'}`
    // console.log(`optionClicked(${index}) asc: ${asc} options:  ${JSON.stringify(orderByOptions, null, 2)} key: ${firstEmptyOption.key} label: ${label}`)

    trio.value.optionsObj[firstEmptyOption.key].text = label
    filterAllOptions.value.push(firstEmptyOption.key)
  }

  function orderByClear() {
    console.log(`orderClear`)
    orderByGroup.value?.optionKeys.forEach((x) => {
      trio.value.optionsObj[x].text = ''
      if (filterAllOptions.value.includes(x)) {
        const i = filterAllOptions.value.indexOf(x)
        filterAllOptions.value.splice(i, 1)
      }
    })
  }

  return {
    filterAllOptions,
    apiQueryPayload,
    orderOptionClicked,
    orderByClear,
    filtersToQueryObject,
    getCount,
    searchTextChanged,
    searchTextClearCurrent,
  }
})
