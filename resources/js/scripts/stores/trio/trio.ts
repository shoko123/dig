// stores/trio.js
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiTrio,
  TTrio,
  TGroupOrFieldToKeyObj,
  TGroupTag,
  TApiOption,
  TGroupBase,
  TGroupField,
  TrioSourceName,
  // TOption,
} from '../../../types/trioTypes'
import type { TFields, TFieldInfo, TFieldValue } from '@/types/moduleTypes'
import type { TApiFilters } from '@/types/routesTypes'
import { useTrioNormalizerStore } from './trioNormalizer'
import { useRoutesMainStore } from '../routes/routesMain'
import { useModuleStore } from '../module'

export const useTrioStore = defineStore('trio', () => {
  const { normalizetrio } = useTrioNormalizerStore()
  const { current } = storeToRefs(useRoutesMainStore())

  const trio = ref<TTrio>({ categories: [], groupsObj: {}, optionsObj: {} })
  const groupLabelToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const fieldsToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})

  const taggerAllOptions = ref<string[]>([])
  const filterAllOptions = ref<string[]>([])
  const itemAllOptions = ref<string[]>([])

  const orderByOptions = ref<TApiOption[]>([])

  //current indices of visible categories/groups
  const categoryIndex = ref<number>(0)
  const groupIndex = ref<number>(0)
  const categorizer = ref<Record<string, (val: TFieldValue) => number>>({})

  function getFieldsOptions(fields: TFields) {
    const optionKeys: string[] = []
    const all: TFieldInfo[] = []
    let optionKey: string | undefined
    let val: TFieldValue = 0

    // console.log(`getFieldsOptions() fields:${JSON.stringify(fields, null, 2)}`)

    Object.entries(fieldsToGroupKeyObj.value).forEach(([key, value]) => {
      // console.log(`[key: ${key}] => ${value}`)
      const group = <TGroupField>trio.value.groupsObj[value]
      val = fields[key as keyof TFields]
      let index = -1
      if (group.tag_source === 'Categorized') {
        // console.log(`categorized group: ${group.label} val: ${val}`)
        index = group.categorizer!(val)
        // console.log(`index: ${index}`)
        optionKey = group.optionKeys[index]!
      } else {
        index = group.optionKeys.findIndex(
          // ** weak comparison because option.extra is either string, number or boolean
          (y) => trio.value.optionsObj[y]!.extra == val,
        )

        if (index === -1) {
          console.log(`getFieldsOptions() - Can't find value ${val} in ${group.label} field ${key}`)
          throw new Error(
            `getFieldsOptions() - Can't find value ${val} in ${group.label} field ${key}`,
          )
        }
        optionKey = group.optionKeys[index]!
      }

      all.push({
        fieldName: group.field_name,
        fieldValue: val,
        optionKey: optionKey,
        optionLabel: trio.value.optionsObj[optionKey]!.text,
        optionExtra: trio.value.optionsObj[optionKey]!.extra,
        options: group.optionKeys.map((x) => {
          const option = trio.value.optionsObj[x]!
          return option
        }),
        index,
      })
      optionKeys.push(optionKey)
    })

    // console.log(`getFieldsOptions() options: ${JSON.stringify(all, null, 2)}`)
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
          if (trio.value.groupsObj[grpKey]!.optionKeys.some((r) => selected.value.includes(r))) {
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
      trio.value.categories[visibleCategories.value[categoryIndex.value]!.catIndex]!.groupKeys

    //filter out unavailable groups
    const available = grpKeys.filter((x) => groupIsAvailable(x))

    return available.map((x) => {
      const group = trio.value.groupsObj[x]!
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
        selectedCount: groupSelectedOptionsCnt(x),
        groupType: group.code,
        required,
        multiple,
        options: group.optionKeys,
      }
    })
  })

  //Is group available?.
  function groupIsAvailable(groupKey: string) {
    const g = trio.value.groupsObj[groupKey]!

    switch (g.code) {
      case 'FD':
        switch (current.value.name) {
          case 'filter':
            if (!(<TGroupField>g).show_in_filters) {
              return false
            }
            break

          case 'tag':
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
        switch (current.value.name) {
          case 'filter':
            return true
          case 'tag':
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

  function optionClicked(prmKey: string) {
    const option = trio.value.optionsObj[prmKey]!
    const group = trio.value.groupsObj[option.groupKey]!

    const isSelected = selected.value.includes(prmKey)
    console.log(`TRIO.click(${prmKey}) "${option.text}" selected: ${isSelected}`)

    if (current.value.name === 'filter') {
      if (isSelected) {
        unSelectOption(prmKey)
      } else {
        selectOption(prmKey)
      }
      return
    }

    //new tags for item
    switch (group.code) {
      case 'TG':
      case 'TM':
        if ((<TGroupTag>group).multiple) {
          if (isSelected) {
            unSelectOption(prmKey)
          } else {
            selectOption(prmKey)
          }
        } else {
          if (isSelected) {
            unSelectOption(prmKey)
          } else {
            //if there is currently  a  selected one - unselect the currently selected and select the new one.
            //if there isn't, select the new one.
            const currentKey = selected.value.find((x) => {
              return trio.value.groupsObj[trio.value.optionsObj[x]!.groupKey]!.label === group.label
            })
            if (currentKey !== undefined) {
              unSelectOption(currentKey)
              selectOption(prmKey)
            } else {
              console.log('No option currently selected - selecting clicked')
              selectOption(prmKey)
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
            return trio.value.groupsObj[trio.value.optionsObj[x]!.groupKey]!.label === group.label
          })
          if (currentKey === undefined) {
            console.log(
              "Error in optionNewClicked - can't find a selected option in current group, wrong code",
            )
            return
          }
          console.log(`newItemOptions(CL or FD).clicked select: ${prmKey}, unSelect: ${currentKey}`)
          unSelectOption(currentKey)
          selectOption(prmKey)
        }
        break
      default:
        console.log('Error in optionNewClicked - wrong code')
    }
  }

  function selectOption(prmKey: string) {
    console.log(`selectOption(${prmKey})`)
    selected.value.push(prmKey)
  }

  function unSelectOption(optionKey: string) {
    const i = selected.value.indexOf(optionKey)
    selected.value.splice(i, 1)
    clearDependecies(optionKey)
  }

  //When unselecting a option, unselect dependencies.
  function clearDependecies(optionKey: string) {
    console.log(
      `*** trio clearDependecies option: ${optionKey} currently selected: ${selected.value} ***`,
    )
    //We assume that this option was already removed from optionClickedSource (filterAllOptions/taggerAllOptions).

    //step 1 - collect all groups affected by unselecting this option
    const groupsToUnselect: { grpKey: string; label: string; optionKeys: string[] }[] = []

    for (const value of Object.values(groupLabelToGroupKeyObj.value)) {
      const group = trio.value.groupsObj[value]!

      //if a group has a dependency that includes this option and will be unselected if option is unselected,
      // add it to the groupsToUnselect array
      if (
        'dependency' in group &&
        group.dependency.includes(optionKey) &&
        !group.dependency.some((x) => {
          return selected.value.includes(x)
        })
      ) {
        console.log(`group ${group.label} is dependent on "${value}"`)
        groupsToUnselect.push({ grpKey: value, label: group.label, optionKeys: group.optionKeys })
      }
    }

    console.log(`Extra Groups to be unselectable: ${JSON.stringify(groupsToUnselect, null, 2)}`)

    //step 2 - collect all options to be unselected
    const optionsToBeUnselected: string[] = []
    groupsToUnselect.forEach((x) => {
      x.optionKeys.forEach((y) => {
        if (selected.value.includes(y)) {
          optionsToBeUnselected.push(y)
        }
      })
    })

    console.log(`Extra Options to be unselected: ${optionsToBeUnselected}`)

    //step 3 - for each optionsToBeUnselected - remove from selected, call clearDependecies() recuresively
    optionsToBeUnselected.forEach((x) => {
      const i = selected.value.findIndex((y) => y === x)
      if (i === -1) {
        console.log(`ERRRRR - trying to remove option ${x} which is NOT selected`)
      } else {
        const option = trio.value.optionsObj[x]!
        const group = trio.value.groupsObj[option.groupKey]!
        if (current.value.name === 'tag' && group.code === 'FD') {
          //unselect required, single selection - replace with default (first entry in group.options[])
          selected.value[i] = group.optionKeys[0]!
        } else {
          selected.value.splice(i, 1)
        }
        if (selected.value.length > 0) {
          clearDependecies(x)
        }
      }
    })
  }

  function groupSelectedOptionsCnt(groupKey: string) {
    const optionKeys = trio.value.groupsObj[groupKey]!.optionKeys
    const selectedCount = optionKeys.reduce((accumulator, option) => {
      const toAdd = selected.value.includes(option) ? 1 : 0
      return accumulator + toAdd
    }, 0)
    return selectedCount
  }

  const visibleOptions = computed(() => {
    if (currentGroup.value === undefined) {
      return []
    }
    const optionKeys = (<TGroupBase>currentGroup.value).optionKeys
    return optionKeys.map((x) => {
      return { ...trio.value.optionsObj[x], selected: selected.value.includes(x), key: x }
    })
  })

  const selected = computed(() => {
    switch (current.value.name) {
      case 'filter':
        return filterAllOptions.value
      case 'tag':
        return taggerAllOptions.value
      default:
        return []
    }
  })

  function clearTrio() {
    clearFilterOptions()
    clearTaggerOptions()
    itemAllOptions.value = []
    groupIndex.value = 0
    categoryIndex.value = 0
    trio.value = { categories: [], groupsObj: {}, optionsObj: {} }
    groupLabelToGroupKeyObj.value = {}
    orderByOptions.value = []
  }

  function clearTaggerOptions() {
    taggerAllOptions.value = []
  }

  function clearFilterOptions() {
    console.log(`trio.clearFilterOptions`)
    //clear search options
    for (const value of Object.values(groupLabelToGroupKeyObj.value)) {
      const group = trio.value.groupsObj[value]!
      if (group.code === 'FS') {
        group.optionKeys.forEach((x) => {
          const param = trio.value.optionsObj[x]!
          param.text = ''
          param.extra = ''
        })
      }
    }
    // clear order by options
    orderByGroup.value?.optionKeys.forEach((x) => {
      trio.value.optionsObj[x]!.text = ''
      if (filterAllOptions.value.includes(x)) {
        const i = filterAllOptions.value.indexOf(x)
        filterAllOptions.value.splice(i, 1)
      }
    })

    // clear filters
    filterAllOptions.value = []
  }

  async function setTrio(apiTrio: TApiTrio) {
    clearTrio()
    const { getCategorizer } = useModuleStore()
    categorizer.value = getCategorizer()
    const res = await normalizetrio(apiTrio, categorizer.value)
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

    const group = trio.value.groupsObj[groupKey]!
    //console.log(`optionDetails(${groupKey}) =>  ${JSON.stringify(optionsObj.value[groupKey], null, 2)}. group:  ${JSON.stringify(group, null, 2)}`)
    return {
      label: group.label,
      groupCode: group.code,
      options: group.optionKeys.reduce(
        (accumulator, currentValue) =>
          accumulator + trio.value.optionsObj[currentValue]!.text + ', ',
        '',
      ),
      available: groupIsAvailable(groupKey),
      cnt: groupSelectedOptionsCnt(groupKey),
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
    return trio.value.groupsObj[visibleGroups.value[groupIndex.value]!.groupKey]!
  })

  const textSearchValues = computed(() => {
    if (currentGroup.value === undefined || currentGroup.value.code !== 'FS') {
      return []
    }
    const vals: string[] = []
    currentGroup.value.optionKeys.forEach((x) => {
      vals.push(trio.value.optionsObj[x]!.text)
    })
    return vals
  })

  const orderByGroup = computed(() => {
    return trio.value.groupsObj[groupLabelToGroupKeyObj.value['Order By']!]
  })

  const orderBySelected = computed(() => {
    if (orderByGroup.value === undefined) {
      return []
    }

    return orderByGroup.value.optionKeys
      .filter((x) => {
        const label = trio.value.optionsObj[x]!.text
        return label !== ''
      })
      .map((x) => {
        return { label: trio.value.optionsObj[x]!.text, key: x }
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

  function setItemAllOptions(options: string[]) {
    itemAllOptions.value = options
  }

  function copyItemOptionsToTaggerOptions() {
    taggerAllOptions.value = [...itemAllOptions.value]
  }

  const selectedFilterOptions = computed(() => {
    return selectedTrio('Filter')
  })

  const selectedTaggerOptions = computed(() => {
    return selectedTrio('Tagger')
  })
  const selectedItemOptions = computed(() => {
    return selectedTrio('Item')
  })

  type TGroup = { label: string; options: string[] }
  type TCat = { label: string; groups: TGroup[] }

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
          const group = trio.value.groupsObj[trio.value.optionsObj[x]!.groupKey]!
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
      const group = trio.value.groupsObj[trio.value.optionsObj[p]!.groupKey]!

      const i = groups.findIndex((g) => {
        return g.label === group.label
      })

      if (i === -1) {
        //if new group, push the option's group into the groups array with itself as the first option
        groups.push({ label: group.label, options: [trio.value.optionsObj[p]!.text] })
      } else {
        //if the group is already selected, add option's text to the group's options array
        groups[i]!.options.push(trio.value.optionsObj[p]!.text)
      }
    })

    //Now all the groups are organized in a sorted array, find their categories.
    groups.forEach((g) => {
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[g.label]!]!
      const cat = trio.value.categories[group.categoryIndex]!

      const i = cats.findIndex((c) => {
        return c.label === cat.name
      })

      if (i === -1) {
        //if the group belongs to a new category, push the new category into the categories array with itself as the first group
        cats.push({ label: cat.name, groups: [g] })
      } else {
        //if the category is already selected, add the group label to the category's groups array
        cats[i]!.groups.push(g)
      }
    })
    return cats
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
      const option = trio.value.optionsObj[key]!
      const group = trio.value.groupsObj[trio.value.optionsObj[key]!.groupKey]!

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
    clearTrio,
    setTrio,
    categoryIndex,
    groupIndex,
    currentGroup,
    visibleCategories,
    visibleGroups,
    visibleOptions,
    optionClicked,
    resetCategoryAndGroupIndices,
    getFieldsOptions,
    taggerAllOptions,
    filterAllOptions,
    clearTaggerOptions,
    clearFilterOptions,
    setItemAllOptions,
    copyItemOptionsToTaggerOptions,
    selectedFilterOptions,
    selectedItemOptions,
    selectedTaggerOptions,
    itemAllOptions,
    apiQueryPayload,
    categorizer,
  }
})
