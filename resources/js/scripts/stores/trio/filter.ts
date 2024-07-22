// stores/trio.jsTGroupBase
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TGroupBase, TGroupColumn } from '@/js/types/trioTypes'
import type { TApiFilters } from '@/js/types/routesTypes'
import type { IStringObject } from '@/js/types/generalTypes'
import type { TApiArray } from '@/js/types/collectionTypes'
import { useTrioStore } from './trio'
import { useXhrStore } from '../xhr'
import { useRoutesMainStore } from '../routes/routesMain'
import { assert } from '../../utils/utils'

export const useFilterStore = defineStore('filter', () => {
  const { send } = useXhrStore()
  const { current } = storeToRefs(useRoutesMainStore())
  const { trio, groupLabelToKey, orderByAvailable, orderByGroup, orderByOptions, currentGroup } =
    storeToRefs(useTrioStore())
  const selectedFilterParams = ref<string[]>([])

  function filtersToQueryObject() {
    const q2: IStringObject = {}
    selectedFilterParams.value.sort((a, b) => {
      return a > b ? 1 : -1
    })
    selectedFilterParams.value.forEach((k) => {
      const paramUlined = trio.value.paramsObj[k].text.replace(/ /g, '_')
      const groupUlined = trio.value.groupsObj[trio.value.paramsObj[k].groupKey].label.replace(
        / /g,
        '_',
      )
      if (Object.prototype.hasOwnProperty.call(q2, groupUlined)) {
        q2[groupUlined] += ',' + paramUlined
      } else {
        q2[groupUlined] = paramUlined
      }
    })
    console.log(`filtersToQueryObject().q2: ${JSON.stringify(q2, null, 2)}`)
    return q2
  }

  const apiQueryPayload = computed<TApiFilters>(() => {
    const all: TApiFilters = {
      model_tag_ids: [],
      global_tag_ids: [],
      column_values: [],
      column_lookup_ids: [],
      column_search: [],
      media: [],
      bespoke: [],
      order_by: [],
    }

    if (trio.value.categories.length === 0) {
      return all
    }

    //push params into their correct arrays, according to group type
    selectedFilterParams.value.forEach((key) => {
      const param = trio.value.paramsObj[key]
      const group = trio.value.groupsObj[trio.value.paramsObj[key].groupKey]

      switch (group.code) {
        case 'CV':
        case 'CR':
          {
            const i = all.column_values.findIndex((x) => {
              return x.column_name === (<TGroupColumn>group).column_name
            })
            if (i === -1) {
              //if new group, push the param's group into the groups array with itself as the first param
              all.column_values.push({
                column_name: (<TGroupColumn>group).column_name,
                vals: [param.text],
              })
            } else {
              //if the group is already selected, add param's text to the group's params array
              all.column_values[i].vals.push(param.text)
            }
          }
          break

        case 'CL':
          {
            const i = all.column_lookup_ids.findIndex((x) => {
              return x.column_name === (<TGroupColumn>group).column_name
            })
            if (i === -1) {
              //if new group, push the param's group into the groups array with itself as the first param
              all.column_lookup_ids.push({
                column_name: (<TGroupColumn>group).column_name,
                vals: [<number>param.extra],
              })
            } else {
              //if the group is already selected, add param's text to the group's params array
              all.column_lookup_ids[i].vals.push(<number>param.extra)
            }
          }
          break

        case 'CB':
          {
            const i = all.column_values.findIndex((x) => {
              return x.column_name === (<TGroupColumn>group).column_name
            })
            if (i === -1) {
              //if new group, push the param's group into the groups array with itself as the first param
              all.column_values.push({
                column_name: (<TGroupColumn>group).column_name,
                vals: [<string>param.extra],
              })
            } else {
              //if the group is already selected, add param's text to the group's params array
              all.column_values[i].vals.push(<string>param.extra)
            }
          }
          break

        case 'CS':
          {
            const i = all.column_search.findIndex((x) => {
              return x.column_name === (<TGroupColumn>group).column_name
            })
            if (i === -1) {
              //if new group, push the param's group into the groups array with itself as the first param
              all.column_search.push({
                column_name: (<TGroupColumn>group).column_name,
                vals: [param.text],
              })
            } else {
              //if the group is already selected, add param's text to the group's params array
              all.column_search[i].vals.push(param.text)
            }
          }
          break
        case 'TM':
          {
            all.model_tag_ids.push(<number>param.extra)
          }
          break

        case 'TG':
          {
            all.global_tag_ids.push(<number>param.extra)
          }
          break

        case 'MD':
          {
            all.media.push(param.text)
          }
          break

        case 'OB':
          {
            const ordeByItem = orderByOptions.value.find((x) => x.name === param.text.slice(0, -2))
            assert(ordeByItem !== undefined, `Selected OrderBy param "${param.text} not found`)
            all.order_by.push({
              column_name: ordeByItem.column_name,
              asc: param.text.slice(-1) === 'A',
            })
          }
          break
      }
    })
    return all
  })

  function clearSelectedFilters() {
    console.log(`filter.clearSelectedFilters()`)
    for (const value of Object.values(groupLabelToKey.value)) {
      if (trio.value.groupsObj[value].code === 'CS') {
        trio.value.groupsObj[value].paramKeys.forEach((x) => {
          trio.value.paramsObj[x].text = ''
          trio.value.paramsObj[x].extra = null
        })
      }
    }
    orderByClear()
    selectedFilterParams.value = []
  }

  async function getCount() {
    const res = await send<TApiArray[]>('model/index', 'post', {
      model: current.value.module,
      query: apiQueryPayload.value,
    })
    return res.success ? res.data.length : -1
  }

  const textSearchParamKeys = computed(() => {
    return (<TGroupBase>currentGroup.value).paramKeys
  })

  function searchTextChanged(index: number, val: string) {
    const paramKey = textSearchParamKeys.value[index]
    //console.log(`changeOccured() index: ${index} setting param with key ${paramKey} to: ${val}`)
    trio.value.paramsObj[paramKey].text = val

    //add/remove from selected filters
    const inSelected = selectedFilterParams.value.includes(paramKey)
    if (inSelected && val === '') {
      const i = selectedFilterParams.value.indexOf(paramKey)
      selectedFilterParams.value.splice(i, 1)
    }
    if (!inSelected && val !== '') {
      selectedFilterParams.value.push(paramKey)
    }
  }

  function searchTextClearCurrent() {
    console.log(`clear()`)
    textSearchParamKeys.value.forEach((x) => {
      trio.value.paramsObj[x].text = ''

      //if currently in selectedFilters, then remove.
      if (selectedFilterParams.value.includes(x)) {
        const i = selectedFilterParams.value.indexOf(x)
        selectedFilterParams.value.splice(i, 1)
      }
    })
  }

  //order by
  ///////////

  function orderParamClicked(index: number, asc: boolean) {
    const orderByParams = orderByGroup.value?.paramKeys.map((x) => {
      return { ...trio.value.paramsObj[x], key: x }
    })

    if (orderByParams === undefined) {
      console.log(`serious error - abort *********`)
      return
    }

    const firstEmptyParam = orderByParams.find((x) => x.text === '')
    if (firstEmptyParam === undefined) {
      console.log(`serious error - abort *********`)
      return
    }

    const label = `${orderByAvailable.value[index].name}.${asc ? 'A' : 'D'}`
    // console.log(`paramClicked(${index}) asc: ${asc} params:  ${JSON.stringify(orderByParams, null, 2)} key: ${firstEmptyParam.key} label: ${label}`)

    trio.value.paramsObj[firstEmptyParam.key].text = label
    selectedFilterParams.value.push(firstEmptyParam.key)
  }

  function orderByClear() {
    console.log(`orderClear`)
    orderByGroup.value?.paramKeys.forEach((x) => {
      trio.value.paramsObj[x].text = ''
      if (selectedFilterParams.value.includes(x)) {
        const i = selectedFilterParams.value.indexOf(x)
        selectedFilterParams.value.splice(i, 1)
      }
    })
  }

  return {
    selectedFilterParams,
    apiQueryPayload,
    orderParamClicked,
    orderByClear,
    filtersToQueryObject,
    clearSelectedFilters,
    getCount,
    searchTextChanged,
    searchTextClearCurrent,
  }
})
