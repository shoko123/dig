import { defineStore, storeToRefs } from 'pinia'
import type { TArray } from '@/types/collectionTypes'
import { useXhrStore } from '../xhr'
import { useModuleStore } from '../module'
import { useTrioStore } from './trio'
import { assert } from '../../utils/utils'
import type { TGroupField } from '../../../types/trioTypes'
import type { TApiFilters } from '@/types/routesTypes'
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

  function filterApiQueryParams() {
    const all: TApiFilters = {
      model_tag_ids: [],
      global_tag_ids: [],
      field_value: [],
      field_search: [],
      media: [],
      order_by: [],
    }

    //push options into their correct arrays, according to group type
    trioStore.filterAllOptionKeys.forEach((key) => {
      const option = trioStore.trio.optionsObj[key]!
      const group = trioStore.trio.groupsObj[trioStore.trio.optionsObj[key]!.groupKey]!

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
              all.field_value[i]!.vals.push(option.extra)
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
              all.field_search[i]!.vals.push(option.text)
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
            const ordeByItem = trioStore.orderByFieldNameAndLabel.find(
              (x) => x.text === option.text.slice(0, -2),
            )
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
  }

  async function getCount() {
    const res = await send<TArray[]>('module/index', 'post', {
      module: module.value,
      query: filterApiQueryParams(),
    })
    return res.success ? res.data.length : -1
  }

  return {
    filtersToQueryObject,
    filterApiQueryParams,
    getCount,
  }
})
