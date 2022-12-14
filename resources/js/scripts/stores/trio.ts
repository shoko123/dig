// stores/trio.js
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { useRoutesStore } from './routes/routesMain'
import { TGroupTag, Trio, TrioSourceName, TmpGroup } from '../../types/trioTypes'

import normalizeTrio from './trioNormalizer'

type TViewParam = { paramKey: string, id: number, name: string, selected: boolean }
type TViewGroup = { groupKey: string, name: string, visible: boolean, params: string[], selectedCount: number }
type TViewCategory = { name: string, visible: boolean, selectedCount: number }

export const useTrioStore = defineStore('trio', () => {
  let trio = ref<Trio>({
    entities: {
      categories: {},
      groups: {},
      params: {}
    }, result: []
  })

  let selectedFilterParams = ref<string[]>([])
  let selectedItemParams = ref<string[]>([])
  let selectedNewItemParams = ref<string[]>([])

  let groupIndex = ref<number>(0)
  let categoryIndex = ref<number>(0)

  //A category is visible if at least one of its groups is viewable 
  function visibleCategories(sourceName: TrioSourceName): TViewCategory[] {
    let allCategories = trio.value.result.map(x => {
      let category = trio.value.entities.categories[x]
      let selected = selectedParamGroups(sourceName)
      //sum the  counts of all selected params (per category)
      let selectedCount = category.groups.reduce((accumulator, groupKey) => {
        let index = selected.findIndex(y => y.groupName === groupKey)
        let toAdd = index === -1 ? 0 : selected[index].selectedCount
        return accumulator + toAdd
      }, 0);

      let acgs = activeGroups(sourceName)
      //is category visible?
      let visible = category.groups.some(y => {
        return acgs.includes(y)
      })
      return { name: category.name, visible, selectedCount }
    })

    //filter
    return allCategories.filter(x => x.visible)
  }

  function visibleGroups(sourceName: TrioSourceName): TViewGroup[] {
    if (trio.value.result.length === 0) { return [] }
    let groupKeys = <string[]>trio.value.entities.categories[trio.value.result[categoryIndex.value]].groups

    let selected = selectedParamGroups(sourceName)
    let acgs = activeGroups(sourceName)
    let allGroupsPerCategory = groupKeys.map(x => {
      let group = trio.value.entities.groups[x]
      let index = selected.findIndex(y => y.groupName === group.group_name)
      let selectedCount = index === -1 ? 0 : selected[index].selectedCount

      return {
        name: trio.value.entities.groups[x].group_name,
        groupKey: x,
        visible: acgs.includes(group.group_name),
        selectedCount,
        params: trio.value.entities.groups[x].params
      }
    })

    //filter
    return allGroupsPerCategory.filter(x => x.visible)
  }

  function visibleParams(sourceName: TrioSourceName): TViewParam[] {
    if (trio.value.result.length === 0) { return [] }
    let visGroups = visibleGroups(sourceName)
    let selected = getSource(sourceName)
    let paramKeys = visGroups[groupIndex.value].params
    return paramKeys.map(x => { return { ...trio.value.entities.params[x], selected: selected?.value.includes(x) } })
  }

  function activeGroups(sourceName: TrioSourceName) {
    if (trio.value.result.length === 0) { return [] }
    let ags: string[] = []
    let selected = getSource(sourceName)
    for (const [key, value] of Object.entries(trio.value.entities.groups)) {
      if (!["TG", "TM"].includes(value.group_type_code)) {
        ags.push(value.group_name)
        continue
      }
      let tagGroup = <TGroupTag>value
      if (tagGroup.dependency === null || tagGroup.dependency.some(x => {
        return (selected.value.includes(x))
      })) {
        ags.push(value.group_name)
        continue
      }
    }
    return ags
  }

  function getSource(sourceName: TrioSourceName) {
    let source = null
    source = sourceName === 'Item' ?
      selectedItemParams : (sourceName === 'New' ? selectedNewItemParams : (sourceName === 'Filter' ? selectedFilterParams : null))
    if (source === null) {
      alert(`Wrong source supplied: ${sourceName}`)
      return selectedItemParams
    }
    return source
  }

  function selectedParamGroups(sourceName: TrioSourceName): TmpGroup[] {
    if (trio.value.result.length === 0) { return [] }
    let groups: TmpGroup[] = []
    let source = getSource(sourceName)

    source?.value.forEach(x => {
      let pieces = x.split('.')
      let group = pieces[0]
      let param = pieces[1]

      let i = groups.findIndex(x => x.groupName === group)
      if (i === -1) {
        let params: string[] = [param]
        groups.push({ groupName: group, params: params, selectedCount: 1 })
      } else {
        groups[i].params.push(param)
        groups[i].selectedCount++
      }
    })
    return groups
  }

  const selectedFiltersByGroup = computed(() => {
    if (trio.value.result.length === 0) { return [] }
    let groups: TmpGroup[] = []

    selectedFilterParams.value.forEach(x => {
      let pieces = x.split('.')
      let group = pieces[0]
      let param = pieces[1]

      let i = groups.findIndex(x => x.groupName === group)
      if (i === -1) {
        let params: string[] = [param]
        groups.push({ groupName: group, params: params, selectedCount: 1 })
      } else {
        groups[i].params.push(param)
        groups[i].selectedCount++
      }
    })
    return groups
  })

  function selectedTrio(sourceName: TrioSourceName) {
    if (trio.value.result.length === 0) { return [] }
    //Assign each "selected" group to a category
    let catsWithGroups: { catName: string, groups: TmpGroup[] }[] = []

    let groups = selectedParamGroups(sourceName)
    groups.forEach(g => {
      let i = catsWithGroups.findIndex(y => {
        return trio.value.entities.groups[g.groupName].categoryKey === y.catName
      })

      if (i === -1) {
        catsWithGroups.push({ catName: trio.value.entities.groups[g.groupName].categoryKey, groups: [g] })
      } else {
        catsWithGroups[i].groups.push(g)
      }
    })
    return catsWithGroups
  }

  function paramClicked(sourceName: TrioSourceName, groupIndex: number, paramIndex: number) {
    console.log(`TRIO.paramClicked() GroupIndex ${groupIndex}: ParamIndex: ${paramIndex} clicked`)

    let visParams = visibleParams(sourceName)
    let paramInfo = visParams[paramIndex]

    let selectedParams = getSource(sourceName)
    let i = selectedParams.value.findIndex((x) => x === paramInfo.paramKey)
    if (i === -1) {
      selectedParams.value.push(paramInfo.paramKey)
      selectedParams.value.sort((a, b) => { return trio.value.entities.params[a].order - trio.value.entities.params[b].order })
    } else {
      selectedParams.value.splice(i, 1)
      clearDependecies(sourceName, paramInfo.paramKey)
    }
  }

  //When unselecting a param, we must check and possibly unselect dependencies.
  function clearDependecies(sourceName: TrioSourceName, paramKey: string) {
    console.log(`clearDependecies param: ${paramKey}`)
    //We assume that this param was already removed from paramClickedSource (selectedFilterParams/selectedNewItemParams).

    let selected = getSource(sourceName)

    //step 1 - collect all affected groups by unselecting this param
    let groupsToBeUnselectable: TGroupTag[] = []
    for (const [key, value] of Object.entries(trio.value.entities.groups)) {
      //only Tag groups may be dependent
      if (!["TG", "TM"].includes(value.group_type_code)) {
        continue
      }

      //collect only those whose dependency includes paramKey
      let group = <TGroupTag>value
      if (group.dependency === null || !group.dependency.includes(paramKey)) {
        continue
      }

      //check if dependency holds or not
      let groupIstoBeUnselected = !group.dependency.some(x => {
        return (selected.value.includes(x))
      })

      if (groupIstoBeUnselected) {
        //console.log(`Pushing Group ${group.group_name} to groupsToBeUnselectable`);
        groupsToBeUnselectable.push(group)
      }
    }

    console.log(`Groups to be unselectable: ${groupsToBeUnselectable.map(x => x.group_name)}`)

    //step 2 - collect all params to be unselected
    let paramsToBeUnselected: string[] = []
    groupsToBeUnselectable.forEach(x => {
      x.params.forEach(y => {
        if (selected.value.includes(y)) {
          paramsToBeUnselected.push(y)
        }
      });
    })

    console.log(`Params to be unselected: ${paramsToBeUnselected}`)

    //step 3 - for each paramsToBeUnselected - remove from selected, call clearDependecies() recuresively
    paramsToBeUnselected.forEach(x => {
      let i = selected.value.findIndex((y) => y === x)
      if (i === -1) {
        console.log(`ERRRRR - trying to remove param ${x} which is NOT selected`)
      } else {
        selected.value.splice(i, 1)
        clearDependecies(sourceName, x)
      }
    })
  }

  function setTrio(res: object) {
    resetTrio()
    trio.value = normalizeTrio(res);
  }

  function resetTrio() {
    groupIndex.value = 0
    categoryIndex.value = 0
    trio.value.result.length = 0
    trio.value = {
      entities: {
        categories: {},
        groups: {},
        params: {}
      }, result: []
    }
  }

  function initFilters() {
    for (const [key, value] of Object.entries(trio.value.entities.groups)) {
      //console.log(`${key}: ${value}`);
      //groupsFilter.value.push(key)
    }
  }

  function clearFilters() {
    groupIndex.value = 0
    categoryIndex.value = 0
    selectedFilterParams.value = []
  }

  return { clearFilters, paramClicked, setTrio, selectedTrio, visibleCategories, visibleGroups, visibleParams, trio, categoryIndex, groupIndex, selectedParamGroups }
})