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
import type { TApiFilters } from '@/types/routesTypes'
import type { TApiTag } from '@/types/itemTypes'
import { useTrioNormalizerStore } from './trioNormalizer'
import { useRoutesMainStore } from '../routes/routesMain'
import { useModuleStore } from '../module'

export const useTrioStore = defineStore('trio', () => {
  const { normalizetrio } = useTrioNormalizerStore()
  const { current } = storeToRefs(useRoutesMainStore())

  const trio = ref<TTrio>({ categories: [], groupsObj: {}, optionsObj: {} })
  const groupLabelToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const fieldsToGroupKeyObj = ref<TGroupOrFieldToKeyObj>({})
  const categorizer = ref<Record<string, (val: TFieldValue) => number>>({})
  const orderByOptions = ref<TApiOption[]>([])

  const taggerAllOptionKeys = ref<string[]>([])
  const filterAllOptionKeys = ref<string[]>([])
  const itemAllOptionKeys = ref<string[]>([])

  //current indices of visible categories/groups
  const categoryIndex = ref<number>(0)
  const groupIndex = ref<number>(0)

  // Setup trio
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

  function clearTrio() {
    console.log(`clearTrio()`)
    clearFilterOptions()
    taggerClearOptions()
    itemAllOptionKeys.value = []
    resetCategoryAndGroupIndices()
    trio.value = { categories: [], groupsObj: {}, optionsObj: {} }
    groupLabelToGroupKeyObj.value = {}
    orderByOptions.value = []
  }

  // Displayed options (Read Only)
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
    // TODO remove set implementation because order is not guranteed
    const set = new Set<number>()
    availableGroupKeysByRoute.value.forEach((x) => {
      const catIndex = trio.value.groupsObj[x]!.categoryIndex
      set.add(catIndex)
    })

    return [...set]
  })

  const trioSelectorCategoryTabs = computed(() => {
    return visibleCatIndices.value.map((x) => {
      const cat = trio.value.categories[x]!

      return {
        catIndex: x,
        catName: cat.name,
        groupKeys: cat.groupKeys,
        selectedCount: cat.groupKeys.reduce((accumulator, groupKey) => {
          return accumulator + availableGroupsSelectedCounterObj.value[groupKey]!
        }, 0),
      }
    })
  })

  const trioSelectorGroupTabs = computed(() => {
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

  // Visible groupKeys depend on categoryIndex and can be either filter or tag.
  const visibleGroupKeys = computed(() => {
    const categoryGroupKeys =
      trio.value.categories[visibleCatIndices.value[categoryIndex.value]!]!.groupKeys
    return categoryGroupKeys.filter((x) => {
      return availableGroupKeys.value[indicesSourceIsTagger.value ? 'Tagger' : 'Filter'].includes(x)
    })
  })

  const trioSelectorOptions = computed(() => {
    return currentGroup.value.optionKeys.map((x) => {
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
          catIndex: group.categoryIndex,
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
    selectedOptionKeysByRoute.value.push(prmKey)
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
      if (filterAllOptionKeys.value.includes(x)) {
        const i = filterAllOptionKeys.value.indexOf(x)
        filterAllOptionKeys.value.splice(i, 1)
      }
    })

    // clear filters
    filterAllOptionKeys.value = []
  }

  function assert(condition: unknown, msg?: string): asserts condition {
    if (condition === false) throw new Error(msg)
  }

  const currentGroup = computed(() => {
    return trio.value.groupsObj[visibleGroupKeys.value[groupIndex.value]!]!
  })

  const textSearchValues = computed(() => {
    if (currentGroup.value.code !== 'FS') {
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
    console.log(`resetCategoryAndGroupIndices`)
    groupIndex.value = 0
    categoryIndex.value = 0
  }

  function setItemAllOptionKeys(options: string[]) {
    itemAllOptionKeys.value = options
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
    filterAllOptionKeys.value.forEach((key) => {
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

  function convertApiTagsToOptionKeys(apiTags: TApiTag[]) {
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
  function taggerCopyItemOptionsToTagger() {
    taggerAllOptionKeys.value = [...itemAllOptionKeys.value]
  }

  function taggerSetDefaultOptions() {
    taggerAllOptionKeys.value = []
    // add fields dependent options (except 'Categorized') with default group.optionKeys[0]
    for (const x in fieldsToGroupKeyObj.value) {
      const group = trio.value.groupsObj[fieldsToGroupKeyObj.value[x]!]!
      if (group.code === 'FD' && (<TGroupField>group).tag_source !== 'Categorized') {
        taggerAllOptionKeys.value.push(group.optionKeys[0]!)
      }
      console.log(`Add Field Tag: ${group.label} => "${x}`)
    }
  }

  function taggerConvertSelectedToApi() {
    const optionsParams = {
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      fields: <{ field_name: string; val: TFieldValue }[]>[],
    }

    taggerAllOptionKeys.value.forEach((optionKey) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.optionsObj[optionKey]!.groupKey]
      switch (group.code) {
        case 'TG':
          optionsParams.global_tag_ids.push(<number>trio.value.optionsObj[optionKey]!.extra)
          break

        case 'TM':
          optionsParams.module_tag_ids.push(<number>trio.value.optionsObj[optionKey]!.extra)
          break

        case 'FD':
          {
            if (group.tag_source !== 'Categorized') {
              const option = trio.value.optionsObj[optionKey]!
              optionsParams.fields.push({
                field_name: group.field_name,
                val: option.extra,
              })
            }
          }
          break
      }
    })
    // console.log(`taggerConvertSelectedToApi: ${JSON.stringify(optionsParams, null, 2)}`)
    return optionsParams
  }

  function taggerClearOptions() {
    taggerAllOptionKeys.value = []
  }

  return {
    // Trio setup and data structures
    trio,
    groupLabelToGroupKeyObj,
    categorizer,
    clearTrio,
    setTrio,

    // Display selected
    displayedSelectedItem,
    displayedSelectedFilter,
    displayedSelectedTagger,

    // Item tags
    itemAllOptionKeys,
    fieldsToGroupKeyObj,
    convertApiTagsToOptionKeys,
    setItemAllOptionKeys,
    getFieldsOptions,

    // Selector Display
    categoryIndex,
    groupIndex,
    trioSelectorCategoryTabs,
    trioSelectorGroupTabs,
    trioSelectorOptions,
    currentGroup,

    // Selector actions
    optionClicked,
    resetCategoryAndGroupIndices,

    // Filter
    filterAllOptionKeys,
    orderByOptions,
    orderByGroup,
    orderByAvailable,
    orderBySelected,
    textSearchValues,
    clearFilterOptions,
    apiQueryPayload,

    // Tagger
    taggerCopyItemOptionsToTagger,
    taggerSetDefaultOptions,
    taggerConvertSelectedToApi,
    taggerClearOptions,
  }
})
