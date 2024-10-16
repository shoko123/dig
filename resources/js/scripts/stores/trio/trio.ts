// stores/trio.js
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiTrio,
  TTrio,
  TGroupOrFieldToKeyObj,
  TGroupTag,
  TApiOption,
  TGroupField,
  TrioSourceName,
  TrioSelectorSource,
} from '../../../types/trioTypes'
import type { TFields, TFieldInfo, TFieldValue } from '@/types/moduleTypes'
import type { TApiTag } from '@/types/itemTypes'
import { assert } from '../../utils/utils'
import { useTrioNormalizerStore } from './trioNormalizer'
import { useRoutesMainStore } from '../routes/routesMain'
import { useModuleStore } from '../module'

export const useTrioStore = defineStore('trio', () => {
  const { normalizetrio } = useTrioNormalizerStore()
  const { current } = storeToRefs(useRoutesMainStore())

  const trio = ref<TTrio>({ categories: [], groupsObj: {}, optionsObj: {} })
  const groupLabelToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const itemFieldsToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const categorizer = ref<Record<string, (val: TFieldValue) => number>>({})
  const orderByFieldNameAndLabel = ref<TApiOption[]>([])

  const taggerAllOptionKeys = ref<string[]>([])
  const filterAllOptionKeys = ref<string[]>([])
  const itemAllOptionKeys = ref<string[]>([])

  //current indices of visible categories/groups
  const selectorCategoryIndex = ref<number>(0)
  const selectorGroupIndex = ref<number>(0)

  // Setup trio
  async function setTrio(apiTrio: TApiTrio) {
    clearTrio()
    const { getCategorizer } = useModuleStore()
    categorizer.value = getCategorizer()
    const res = await normalizetrio(apiTrio, categorizer.value)
    trio.value = res.trio
    groupLabelToGroupKeyObj.value = res.groupLabelToGroupKeyObj
    orderByFieldNameAndLabel.value = res.orderByFieldNameAndLabel
    itemFieldsToGroupKeyObj.value = res.itemFieldsToGroupKeyObj
  }

  function clearTrio() {
    console.log(`clearTrio()`)
    filterClearOptions()
    taggerClearOptions()
    itemAllOptionKeys.value = []
    resetCategoryAndGroupIndices()
    trio.value = { categories: [], groupsObj: {}, optionsObj: {} }
    groupLabelToGroupKeyObj.value = {}
    orderByFieldNameAndLabel.value = []
  }

  ////////////////////////////////
  // Displayed options (Read Only)
  ////////////////////////////////

  // Returns an object with Filter & Tagger keys and all available groupKeys according to group's dependencies
  // Indedendant of route.
  const availableGroupKeys = computed(() => {
    const tmp: Record<TrioSelectorSource, string[]> = { Filter: [], Tagger: [] }
    for (const grpKey in trio.value.groupsObj) {
      const group = trio.value.groupsObj[grpKey]!
      switch (group.code) {
        case 'FD':
          {
            const groupFD = <TGroupField>group
            if (groupFD.show_in_filters && dependencyConditionsMet(groupFD.dependency, 'Filter')) {
              tmp['Filter'].push(grpKey)
            }

            if (groupFD.show_in_tagger && dependencyConditionsMet(groupFD.dependency, 'Tagger')) {
              tmp['Tagger'].push(grpKey)
            }
          }
          break

        case 'TG':
        case 'TM':
          {
            const groupTG = <TGroupTag>group
            if (dependencyConditionsMet(groupTG.dependency, 'Filter')) {
              tmp['Filter'].push(grpKey)
            }

            if (dependencyConditionsMet(groupTG.dependency, 'Tagger')) {
              tmp['Tagger'].push(grpKey)
            }
          }
          break

        case 'FS':
        case 'OB':
        case 'MD':
          tmp['Filter'].push(grpKey)
      }
    }
    return tmp
  })

  function dependencyConditionsMet(dependency: string[], trioSource: TrioSourceName) {
    const selected =
      trioSource === 'Filter'
        ? filterAllOptionKeys
        : trioSource === 'Item'
          ? itemAllOptionKeys
          : taggerAllOptionKeys
    return (
      dependency.length === 0 ||
      dependency.some((x) => {
        return selected.value.includes(x)
      })
    )
  }

  // Route dependent: welcome, index, show, filter. Also create, and update routes
  const indicesSourceIsFilter = computed(() => {
    return current.value.name !== 'tag'
  })

  const indicesSourceIsTagger = computed(() => {
    return current.value.name === 'tag'
  })

  const availableGroupKeysByRoute = computed(() => {
    return indicesSourceIsFilter.value
      ? availableGroupKeys.value['Filter']
      : indicesSourceIsTagger.value
        ? availableGroupKeys.value['Tagger']
        : []
  })

  const selectedOptionKeysByRoute = computed(() => {
    return indicesSourceIsFilter.value
      ? filterAllOptionKeys.value
      : indicesSourceIsTagger.value
        ? taggerAllOptionKeys.value
        : []
  })

  // dependent on route and selectedKeys (filter or tag)
  const visibleCatIndices = computed(() => {
    const indices: number[] = []
    availableGroupKeysByRoute.value.forEach((x) => {
      const catIndex = trio.value.groupsObj[x]!.selectorCategoryIndex
      if (!indices.includes(catIndex)) {
        indices.push(catIndex)
      }
    })

    return indices
  })

  const selectorCategoryTabs = computed(() => {
    return visibleCatIndices.value.map((x) => {
      const cat = trio.value.categories[x]!

      return {
        catIndex: x,
        catName: cat.name,
        groupKeys: cat.groupKeys,
        selectedCount: cat.groupKeys.reduce((accumulator, groupKey) => {
          return accumulator + (availableGroupsSelectedCounterObj.value[groupKey]! ?? 0) // Avoid apparent race condition
        }, 0),
      }
    })
  })

  const selectorGroupTabs = computed(() => {
    return visibleGroupKeys.value.map((x) => {
      const group = trio.value.groupsObj[x]!
      if (indicesSourceIsFilter.value) {
        return {
          name: group.label,
          groupKey: x,
          groupType: group.code,
          selectedCount: availableGroupsSelectedCounterObj.value[x]!,
        }
      } else {
        return {
          name: group.label,
          groupKey: x,
          groupType: group.code,
          multiple: ['TG', 'TM'].includes(group.code) && (<TGroupTag>group).multiple,
          required: !['TG', 'TM'].includes(group.code),
          selectedCount: availableGroupsSelectedCounterObj.value[x]!,
        }
      }
    })
  })

  const availableGroupsSelectedCounterObj = computed(() => {
    const tmp: Record<string, number> = {}

    availableGroupKeysByRoute.value.forEach((x) => {
      const group = trio.value.groupsObj[x]!
      tmp[x] = selectedCount(group?.optionKeys, selectedOptionKeysByRoute.value)
    })
    return tmp
  })

  function selectedCount(arr1: string[], arr2: string[]) {
    return arr1.reduce((accumulator, option) => {
      return accumulator + (arr2.includes(option) ? 1 : 0)
    }, 0)
  }

  // Visible groupKeys depend on selectorCategoryIndex and can be either filter or tag.
  const visibleGroupKeys = computed(() => {
    const categoryGroupKeys =
      trio.value.categories[visibleCatIndices.value[selectorCategoryIndex.value]!]?.groupKeys ?? []
    return categoryGroupKeys.filter((x) => {
      return availableGroupKeys.value[indicesSourceIsTagger.value ? 'Tagger' : 'Filter'].includes(x)
    })
  })

  const currentGroup = computed(() => {
    return trio.value.groupsObj[visibleGroupKeys.value[selectorGroupIndex.value]!]
  })

  const selectorOptions = computed(() => {
    return currentGroup.value === undefined
      ? []
      : currentGroup.value.optionKeys.map((x) => {
          return {
            ...trio.value.optionsObj[x],
            selected: selectedOptionKeysByRoute.value.includes(x),
            key: x,
          }
        })
  })

  function displayedSelected(source: TrioSourceName, selected: string[]) {
    const groups: {
      groupKey: string
      label: string
      catIndex: number
      options: string[]
    }[] = []

    const cats: {
      myIndex: number
      label: string
      groups: { label: string; options: string[] }[]
    }[] = []

    // console.log(`displayedSelectedItem.selected: (${itemAllOptionKeys.value})`)
    // console.log(`labels: (${itemAllOptionKeys.value.map((x) => trio.value.optionsObj[x]?.text)})`)

    // Build groups
    selected.forEach((key) => {
      // console.log(
      //   `processing option: "${key}" => ${trio.value.optionsObj[key]!.text}\ngroup: "${trio.value.optionsObj[key]!.groupKey}" => ${trio.value.groupsObj[trio.value.optionsObj[key]!.groupKey]?.label}`,
      // )
      // console.log(`selected Groups: (${groups.map((x) => x.groupKey)}`)
      const index = groups.findIndex((x) => x.groupKey === trio.value.optionsObj[key]!.groupKey)
      if (index === -1) {
        // console.log(`Group Not Found`)
        const groupKey = trio.value.optionsObj[key]!.groupKey
        const group = trio.value.groupsObj[groupKey]!
        // console.log(`Group: ${JSON.stringify(group, null, 2)}`)
        groups.push({
          groupKey,
          label: group.label,
          catIndex: group.selectorCategoryIndex,
          options: [trio.value.optionsObj[key]!.text],
        })
        // console.log(
        //   `key(${key}) Not Found. Pushed ${JSON.stringify(groups[groups.length - 1], null, 2)}`,
        // )
      } else {
        // console.log(`key(${key}) Found. Index: ${index}`)
        groups[index]?.options.push(trio.value.optionsObj[key]!.text)
      }
    })

    // Build cats
    groups.forEach((group) => {
      const index = cats.findIndex((x) => x.myIndex === group.catIndex)
      if (index === -1) {
        const cat = trio.value.categories[group.catIndex]!
        cats.push({
          myIndex: group.catIndex,
          label: cat.name,
          groups: [{ label: group.label, options: group.options }],
        })
      } else {
        cats[index]?.groups.push({ label: group.label, options: [...group.options] })
      }
    })

    // return formated structure
    return cats.map((x) => {
      return { label: x.label, groups: x.groups }
    })
  }

  const displayedSelectedItem = computed(() => {
    return displayedSelected('Item', itemAllOptionKeys.value)
  })

  const displayedSelectedTagger = computed(() => {
    return displayedSelected('Tagger', taggerAllOptionKeys.value)
  })

  const displayedSelectedFilter = computed(() => {
    return displayedSelected('Filter', filterAllOptionKeys.value)
  })

  ////////////////// Display section - END //////////////////////

  // Item options

  // Get options from item's fields
  function itemFieldsOptions(fields: TFields) {
    const optionKeys: string[] = []
    const all: TFieldInfo[] = []
    let optionKey: string | undefined
    let val: TFieldValue = 0

    // console.log(`itemFieldsOptions() fields:${JSON.stringify(fields, null, 2)}`)

    Object.entries(itemFieldsToGroupKeyObj.value).forEach(([key, value]) => {
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
          console.log(
            `itemFieldsOptions() - Can't find value ${val} in ${group.label} field ${key}`,
          )
          throw new Error(
            `itemFieldsOptions() - Can't find value ${val} in ${group.label} field ${key}`,
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

    // console.log(`itemFieldsOptions() options: ${JSON.stringify(all, null, 2)}`)
    return all
  }

  function optionClicked(prmKey: string) {
    const option = trio.value.optionsObj[prmKey]!
    const group = trio.value.groupsObj[option.groupKey]!

    const isSelected = selectedOptionKeysByRoute.value.includes(prmKey)
    console.log(`TRIO.click(${prmKey}) "${option.text}" selected: ${isSelected}`)

    if (current.value.name === 'filter') {
      if (isSelected) {
        unSelectOption(prmKey)
      } else {
        selectOption(prmKey)
      }
      return
    }

    // Tagger
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
            const currentKey = selectedOptionKeysByRoute.value.find((x) => {
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
          const currentKey = selectedOptionKeysByRoute.value.find((x) => {
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
    const tmp = [...selectedOptionKeysByRoute.value]
    tmp.push(prmKey)
    tmp.sort((a, b) => {
      return a > b ? 1 : -1
    })
    if (current.value.name === 'filter') {
      filterAllOptionKeys.value = tmp
    } else {
      taggerAllOptionKeys.value = tmp
    }
  }

  function unSelectOption(optionKey: string) {
    const i = selectedOptionKeysByRoute.value.indexOf(optionKey)
    selectedOptionKeysByRoute.value.splice(i, 1)
    clearDependecies(optionKey)
  }

  //When unselecting a option, unselect dependencies.
  function clearDependecies(optionKey: string) {
    console.log(
      `*** trio clearDependecies option: ${optionKey} currently selected: ${selectedOptionKeysByRoute.value} ***`,
    )
    //We assume that this option was already removed from optionClickedSource (filterAllOptionKeys/taggerAllOptionKeys).

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
          return selectedOptionKeysByRoute.value.includes(x)
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
        if (selectedOptionKeysByRoute.value.includes(y)) {
          optionsToBeUnselected.push(y)
        }
      })
    })

    console.log(`Extra Options to be unselected: ${optionsToBeUnselected}`)

    //step 3 - for each optionsToBeUnselected - remove from selected, call clearDependecies() recuresively
    optionsToBeUnselected.forEach((x) => {
      const i = selectedOptionKeysByRoute.value.findIndex((y) => y === x)
      if (i === -1) {
        console.log(`ERRRRR - trying to remove option ${x} which is NOT selected`)
      } else {
        const option = trio.value.optionsObj[x]!
        const group = trio.value.groupsObj[option.groupKey]!
        if (current.value.name === 'tag' && group.code === 'FD') {
          //unselect required, single selection - replace with default (first entry in group.options[])
          selectedOptionKeysByRoute.value[i] = group.optionKeys[0]!
        } else {
          selectedOptionKeysByRoute.value.splice(i, 1)
        }
        if (selectedOptionKeysByRoute.value.length > 0) {
          clearDependecies(x)
        }
      }
    })
  }

  function filterClearOptions() {
    console.log(`trio.filterClearOptions`)
    resetCategoryAndGroupIndices()
    SearchTextClear()
    orderByClear()

    // clear filters
    filterAllOptionKeys.value = []
  }

  ////// Order By //////////////
  const orderByGroup = computed(() => {
    return trio.value.groupsObj[groupLabelToGroupKeyObj.value['Order By']!]
  })

  function orderByClear() {
    orderByGroup.value?.optionKeys.forEach((x) => {
      trio.value.optionsObj[x]!.text = ''
      if (filterAllOptionKeys.value.includes(x)) {
        const i = filterAllOptionKeys.value.indexOf(x)
        filterAllOptionKeys.value.splice(i, 1)
      }
    })
  }

  ////// Textual Search Clear //////////////
  function SearchTextClear(currentGroupOnly: boolean = false) {
    if (currentGroupOnly) {
      // Clear relevant options' text, and remove from filterAllOptionKeys
      assert(
        currentGroup.value?.code === 'FS',
        `SearchTextClear of not a FieldSearch group "${currentGroup.value?.label}"`,
      )

      currentGroup.value.optionKeys.forEach((x) => {
        if (filterAllOptionKeys.value.includes(x)) {
          const i = filterAllOptionKeys.value.indexOf(x)
          filterAllOptionKeys.value.splice(i, 1)
        }
        const param = trio.value.optionsObj[x]!
        param.text = ''
        param.extra = ''
      })
      return
    }

    // Clear only FieldSearch options' text. filterAllOptionKeys will be cleared by calling function filterClearOptions()
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
  }

  function resetCategoryAndGroupIndices() {
    console.log(`resetCategoryAndGroupIndices`)
    selectorGroupIndex.value = 0
    selectorCategoryIndex.value = 0
  }

  function itemSetAllOptionKeys(options: string[]) {
    itemAllOptionKeys.value = options.sort((a, b) => {
      return a > b ? 1 : -1
    })
  }

  function itemApiTagsToOptionKeys(apiTags: TApiTag[]) {
    // console.log(`SaveItem - Add extrnal (module and global) tags`)
    const tagOptionKey: string[] = []
    for (const x of apiTags) {
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[x.group_label]!]!
      // console.log(`Add Tag:  ${x.group_label} => "${x.tag_text}"`)
      const optionKey = group.optionKeys.find((y) => trio.value.optionsObj[y]!.text === x.tag_text)
      if (optionKey === undefined) {
        throw new Error(
          `getSelectedTagOptions() - Can't find tag ${x.tag_text} in group ${group.label}`,
        )
      }
      tagOptionKey.push(optionKey)
    }
    return tagOptionKey
  }

  // Tagger
  function taggerClearOptions() {
    resetCategoryAndGroupIndices()
    taggerAllOptionKeys.value = []
  }

  return {
    // Display selected
    displayedSelectedItem,
    displayedSelectedFilter,
    displayedSelectedTagger,

    // Item tags
    itemAllOptionKeys,
    itemFieldsToGroupKeyObj,
    itemApiTagsToOptionKeys,
    itemSetAllOptionKeys,
    itemFieldsOptions,

    // Selector
    selectorCategoryIndex,
    selectorGroupIndex,
    selectorCategoryTabs,
    selectorGroupTabs,
    selectorOptions,
    currentGroup,

    // Selector "tag" actions (all except text search & order by)
    optionClicked,
    resetCategoryAndGroupIndices,

    // Filter
    filterAllOptionKeys,
    orderByFieldNameAndLabel,
    orderByGroup,
    orderByClear,
    filterClearOptions,
    SearchTextClear,

    // Tagger
    taggerAllOptionKeys,
    taggerClearOptions,

    // Trio setup and data structures
    trio,
    groupLabelToGroupKeyObj,
    categorizer,
    clearTrio,
    setTrio,
  }
})
