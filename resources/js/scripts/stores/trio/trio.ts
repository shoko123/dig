// stores/trio.js
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiTrio,
  TTrio,
  TGroupOrFieldToKeyObj,
  TGroupTag,
  TApiParam,
  // TParam,
  TGroupBase,
  TGroupField,
} from '../../../types/trioTypes'
import type { TFieldsUnion, TFieldInfo, TFieldValue } from '@/js/types/moduleTypes'

import { useTrioNormalizerStore } from './trioNormalizer'
import { useRoutesMainStore } from '../routes/routesMain'
import { useTaggerStore } from './tagger'
import { useFilterStore } from './filter'

export const useTrioStore = defineStore('trio', () => {
  const { normalizetrio } = useTrioNormalizerStore()
  const { current } = storeToRefs(useRoutesMainStore())

  const trio = ref<TTrio>({ categories: [], groupsObj: {}, paramsObj: {} })
  const groupLabelToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const fieldsToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})

  const orderByOptions = ref<TApiParam[]>([])
  //current index of visible categories/groups
  const categoryIndex = ref<number>(0)
  const groupIndex = ref<number>(0)

  function getFieldsParams(fields: TFieldsUnion) {
    const paramKeys: string[] = []
    const all: TFieldInfo[] = []
    let paramKey: string | undefined
    let val: TFieldValue = 0

    Object.entries(fieldsToGroupKeyObj.value).forEach(([key, value]) => {
      const group = <TGroupField>trio.value.groupsObj[value]
      val = fields[key as keyof TFieldsUnion]
      let index = -1
      if (group.tag_source === 'Categorized') {
        index = group.categorizer!(val)
        paramKey = group.paramKeys[index]
      } else {
        index = group.paramKeys.findIndex(
          // ** weak comparison because param.extra is either string, number or boolean
          (y) => trio.value.paramsObj[y].extra == val,
        )

        if (index === -1) {
          throw new Error(
            `getFieldsParams() - Can't find value ${val} in ${group.label} field ${key}`,
          )
        }
        paramKey = group.paramKeys[index]
      }

      all.push({
        fieldName: group.field_name,
        fieldValue: val,
        paramKey: paramKey,
        paramLabel: trio.value.paramsObj[paramKey].text,
        paramExtra: trio.value.paramsObj[paramKey].extra,
        options: group.paramKeys.map((x) => {
          const param = { ...trio.value.paramsObj[x] }
          return param
        }),
        index,
      })
      paramKeys.push(paramKey)
    })

    //console.log(`getFieldsParams() params: ${JSON.stringify(all, null, 2)}`)
    return all
  }

  //A category is visible if at least one of its groups is available
  const visibleCategories = computed(() => {
    const visCats: { catName: string; catIndex: number; hasSelected: boolean }[] = []

    for (const [index, cat] of trio.value.categories.entries()) {
      //for (const cat of trio.value.categories) {
      let available = false
      let hasSelected = false
      for (const grpKey of cat.groupKeys) {
        if (groupIsAvailable(grpKey)) {
          available = true
          if (trio.value.groupsObj[grpKey].paramKeys.some((r) => selected.value.includes(r))) {
            hasSelected = true
          }
        }
      }
      if (available) {
        visCats.push({ catName: cat.name, catIndex: index, hasSelected })
      }
    }

    //console.log(`visibleCats: ${JSON.stringify(visCats, null, 2)}`)

    return visCats
  })

  //returns groups that are available and belong to the currently selected category.
  const visibleGroups = computed(() => {
    if (visibleCategories.value.length === 0) {
      return []
    }

    const grpKeys =
      trio.value.categories[visibleCategories.value[categoryIndex.value].catIndex].groupKeys

    //filter out unavailable groups
    const available = grpKeys.filter((x) => groupIsAvailable(x))

    return available.map((x) => {
      const group = trio.value.groupsObj[x]
      let required = false
      let multiple = false
      switch (group.code) {
        case 'FD':
          required = true
          multiple = false
          break

        case 'TM':
        case 'TG':
          required = false
          multiple = (<TGroupTag>group).multiple
          break
        default:
          break
      }
      return {
        name: group.label,
        groupKey: x,
        visible: true,
        selectedCount: groupSelectedParamsCnt(x),
        groupType: group.code,
        required,
        multiple,
        params: group.paramKeys,
      }
    })
  })

  //Is group available?.
  function groupIsAvailable(groupKey: string) {
    const g = trio.value.groupsObj[groupKey]

    switch (g.code) {
      case 'FD':
        switch (source.value) {
          case 'filter':
            if (!(<TGroupField>g).show_in_filters) {
              return false
            }
            break

          case 'tagger':
            if (!(<TGroupField>g).show_in_tagger) {
              return false
            }
            break
          default:
            return false
        }
        break

      case 'TG':
      case 'TM':
        break

      default:
        switch (source.value) {
          case 'filter':
            return true
          case 'tagger':
          default:
            return false
        }
    }

    //Check if dependency conditions are met
    return (
      (<TGroupTag>g).dependency.length === 0 ||
      (<TGroupTag>g).dependency.some((x) => {
        return selected.value.includes(x)
      })
    )
  }

  function paramClicked(prmKey: string) {
    const param = trio.value.paramsObj[prmKey]
    const group = trio.value.groupsObj[param.groupKey]

    const isSelected = selected.value.includes(prmKey)
    console.log(`TRIO.click(${prmKey}) "${param.text}" selected: ${isSelected}`)

    if (current.value.name === 'filter') {
      if (isSelected) {
        unSelectParam(prmKey)
      } else {
        selectParam(prmKey)
      }
      return
    }

    //new tags for item
    switch (group.code) {
      case 'TG':
      case 'TM':
        if ((<TGroupTag>group).multiple) {
          if (isSelected) {
            unSelectParam(prmKey)
          } else {
            selectParam(prmKey)
          }
        } else {
          if (isSelected) {
            unSelectParam(prmKey)
          } else {
            //if there is currently  a  selected one - unselect the currently selected and select the new one.
            //if there isn't, select the new one.
            const currentKey = selected.value.find((x) => {
              return trio.value.groupsObj[trio.value.paramsObj[x].groupKey].label === group.label
            })
            if (currentKey !== undefined) {
              unSelectParam(currentKey)
              selectParam(prmKey)
            } else {
              console.log('No param currently selected - selecting clicked')
              selectParam(prmKey)
            }
          }
        }
        break

      case 'FD':
        if (isSelected) {
          //do nothing
        } else {
          //unselect the currently selected and select the new one
          const currentKey = selected.value.find((x) => {
            return trio.value.groupsObj[trio.value.paramsObj[x].groupKey].label === group.label
          })
          if (currentKey === undefined) {
            console.log(
              "Error in paramNewClicked - can't find a selected param in current group, wrong code",
            )
            return
          }
          console.log(`newItemParams(CL or FD).clicked select: ${prmKey}, unSelect: ${currentKey}`)
          unSelectParam(currentKey)
          selectParam(prmKey)
        }
        break
      default:
        console.log('Error in paramNewClicked - wrong code')
    }
  }

  function selectParam(prmKey: string) {
    console.log(`selectParam(${prmKey})`)
    selected.value.push(prmKey)
  }

  function unSelectParam(paramKey: string) {
    const i = selected.value.indexOf(paramKey)
    selected.value.splice(i, 1)
    clearDependecies(paramKey)
  }

  //When unselecting a param, unselect dependencies.
  function clearDependecies(paramKey: string) {
    console.log(
      `*** trio clearDependecies param: ${paramKey} currently selected: ${selected.value} ***`,
    )
    //We assume that this param was already removed from paramClickedSource (selectedFilterParams/selectedNewItemParams).

    //step 1 - collect all groups affected by unselecting this param
    const groupsToUnselect: { grpKey: string; label: string; paramKeys: string[] }[] = []

    for (const value of Object.values(groupLabelToGroupKeyObj.value)) {
      const group = trio.value.groupsObj[value]

      //if a group has a dependency that includes this param and will be unselected if param is unselected,
      // add it to the groupsToUnselect array
      if (
        'dependency' in group &&
        group.dependency.includes(paramKey) &&
        !group.dependency.some((x) => {
          return selected.value.includes(x)
        })
      ) {
        console.log(`group ${group.label} is dependent on "${value}"`)
        groupsToUnselect.push({ grpKey: value, label: group.label, paramKeys: group.paramKeys })
      }
    }

    console.log(`Extra Groups to be unselectable: ${JSON.stringify(groupsToUnselect, null, 2)}`)

    //step 2 - collect all params to be unselected
    const paramsToBeUnselected: string[] = []
    groupsToUnselect.forEach((x) => {
      x.paramKeys.forEach((y) => {
        if (selected.value.includes(y)) {
          paramsToBeUnselected.push(y)
        }
      })
    })

    console.log(`Extra Params to be unselected: ${paramsToBeUnselected}`)

    //step 3 - for each paramsToBeUnselected - remove from selected, call clearDependecies() recuresively
    paramsToBeUnselected.forEach((x) => {
      const i = selected.value.findIndex((y) => y === x)
      if (i === -1) {
        console.log(`ERRRRR - trying to remove param ${x} which is NOT selected`)
      } else {
        const param = trio.value.paramsObj[x]
        const group = trio.value.groupsObj[param.groupKey]
        if (current.value.name === 'tag' && group.code === 'FD') {
          //unselect required, single selection - replace with default (first entry in group.params[])
          selected.value[i] = group.paramKeys[0]
        } else {
          selected.value.splice(i, 1)
        }
        if (selected.value.length > 0) {
          clearDependecies(x)
        }
      }
    })
  }

  function groupSelectedParamsCnt(groupKey: string) {
    const paramKeys = trio.value.groupsObj[groupKey].paramKeys
    const selectedCount = paramKeys.reduce((accumulator, param) => {
      const toAdd = selected.value.includes(param) ? 1 : 0
      return accumulator + toAdd
    }, 0)
    return selectedCount
  }

  const visibleParams = computed(() => {
    if (currentGroup.value === undefined) {
      return []
    }
    const paramKeys = (<TGroupBase>currentGroup.value).paramKeys
    return paramKeys.map((x) => {
      return { ...trio.value.paramsObj[x], selected: selected.value.includes(x), key: x }
    })
  })

  const selected = computed(() => {
    const { selectedFilterParams } = storeToRefs(useFilterStore())
    const { selectedNewItemParams } = storeToRefs(useTaggerStore())
    switch (current.value.name) {
      case 'filter':
        return selectedFilterParams.value
      case 'tag':
        return selectedNewItemParams.value
      default:
        return []
    }
  })

  const source = computed(() => {
    switch (current.value.name) {
      case 'filter':
        return 'filter'
      case 'tag':
        return 'tagger'
      default:
        return null
    }
  })

  function trioReset() {
    const { clearSelectedFilters } = useFilterStore()
    const { truncateNewItemParams } = useTaggerStore()
    truncateNewItemParams()
    clearSelectedFilters()

    groupIndex.value = 0
    categoryIndex.value = 0
    trio.value = { categories: [], groupsObj: {}, paramsObj: {} }
    groupLabelToGroupKeyObj.value = {}
    orderByOptions.value = []
  }

  function setTrio(apiTrio: TApiTrio) {
    trioReset()

    //const res = normalizeTrio(apiTrio)
    const res = normalizetrio(apiTrio)
    trio.value = res.trio
    groupLabelToGroupKeyObj.value = res.groupLabelToGroupKeyObj
    orderByOptions.value = res.orderByOptions
    fieldsToGroupKeyObj.value = res.fieldsToGroupKeyObj
  }

  function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg)
  }

  ///////// Debug only ////////////
  function groupDetails(groupKey: string) {
    assert(groupKey in trio.value.groupsObj, `groupObj[${groupKey}] doesn't exist!`)

    const grp = trio.value.groupsObj[groupKey]
    //console.log(`paramDetails(${groupKey}) =>  ${JSON.stringify(paramsObj.value[groupKey], null, 2)}. grp:  ${JSON.stringify(grp, null, 2)}`)
    return {
      label: grp.label,
      groupCode: grp.code,
      params: grp.paramKeys.reduce(
        (accumulator, currentValue) => accumulator + trio.value.paramsObj[currentValue].text + ', ',
        '',
      ),
      available: groupIsAvailable(groupKey),
      cnt: groupSelectedParamsCnt(groupKey),
    }
  }

  const groups = computed(() => {
    const grpList = []
    for (const key of Object.keys(trio.value.groupsObj)) {
      grpList.push(groupDetails(key))
    }
    return grpList
  })
  /////////// Debug only - end ///////////////

  const currentGroup = computed(() => {
    if (visibleGroups.value.length === 0) {
      return undefined
    }
    return trio.value.groupsObj[visibleGroups.value[groupIndex.value].groupKey]
  })

  const textSearchValues = computed(() => {
    if (currentGroup.value === undefined || currentGroup.value.code !== 'FS') {
      return []
    }
    const vals: string[] = []
    currentGroup.value.paramKeys.forEach((x) => {
      vals.push(trio.value.paramsObj[x].text)
    })
    return vals
  })

  const orderByGroup = computed(() => {
    // if (!groupLabelToGroupKeyObj.value.hasOwnProperty('Order By')) {
    if (!Object.prototype.hasOwnProperty.call(groupLabelToGroupKeyObj.value, 'Order By')) {
      return undefined
    }
    return trio.value.groupsObj[groupLabelToGroupKeyObj.value['Order By']]
  })

  const orderBySelected = computed(() => {
    if (orderByGroup.value === undefined) {
      return []
    }

    return orderByGroup.value.paramKeys
      .filter((x) => {
        const label = trio.value.paramsObj[x].text
        return label !== ''
      })
      .map((x) => {
        return { label: trio.value.paramsObj[x].text, key: x }
      })
  })

  const orderByAvailable = computed(() => {
    if (orderByGroup.value === undefined) {
      return []
    }

    return orderByOptions.value.filter((x) => {
      return !orderBySelected.value.some((y) => y.label.slice(0, -2) === x.text)
    })
  })

  function resetCategoryAndGroupIndices() {
    groupIndex.value = 0
    categoryIndex.value = 0
  }

  return {
    trio,
    groupLabelToGroupKeyObj,
    fieldsToGroupKeyObj,
    orderByOptions,
    orderByGroup,
    orderByAvailable,
    orderBySelected,
    groups,
    textSearchValues,
    trioReset,
    setTrio,
    categoryIndex,
    groupIndex,
    currentGroup,
    visibleCategories,
    visibleGroups,
    visibleParams,
    paramClicked,
    resetCategoryAndGroupIndices,
    getFieldsParams,
  }
})
