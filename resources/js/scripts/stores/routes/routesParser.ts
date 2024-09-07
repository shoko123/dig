// routesStore.js
//handles the entire routing mechanism - parsing, loading resources, error handling

import { defineStore, storeToRefs } from 'pinia'
import type { TModule, TUrlModule } from '../../../types/moduleTypes'
import type { LocationQuery } from 'vue-router'
import type { TGroupBase } from '@/js/types/trioTypes'

import { useModuleStore } from '../module'
import { useMainStore } from '../main'

export const useRoutesParserStore = defineStore('routesParser', () => {
  const { urlModuleNameToModule } = storeToRefs(useMainStore())

  function parseModule(
    urlModule: string,
  ):
    | { success: true; module: TModule; url_module: TUrlModule }
    | { success: false; data: null; message: string } {
    switch (urlModule) {
      case 'loci':
      case 'ceramics':
      case 'stones':
        return {
          success: true,
          module: <TModule>urlModuleNameToModule.value[urlModule],
          url_module: urlModule,
        }

      default:
        console.log(`******* URL Parser error: Unsupported urlModule name "${urlModule}" *********`)
        return {
          success: false,
          data: null,
          message: `Error: unknown url module "${urlModule}"`,
        }
    }
  }

  function parseSlug(module: TModule, slug: string) {
    const { slugToId } = useModuleStore()
    return slugToId(module, slug)
  }

  async function parseUrlQuery(qp: LocationQuery) {
    const { useTrioStore } = await import('../trio/trio')
    //console.log(`urlQueryToApiFilters().urlQuery: ${JSON.stringify(qp, null, 2)}`);
    const { trio, groupLabelToGroupKeyObj, filterAllOptions } = storeToRefs(useTrioStore())

    if (qp === null) {
      return { success: true }
    }

    const selectedFilters: string[] = []
    for (const [key, value] of Object.entries(qp)) {
      if (value === null) {
        console.log(`group "${key} has no parameters!`)
        continue
      }

      // console.log(
      //   `urlQueryEntry(${key}) =>: ${JSON.stringify((<string>value).split(','), null, 2)}`,
      // )

      const undoUnderKey = key.replace(/_/g, ' ')
      if (undoUnderKey in groupLabelToGroupKeyObj.value === false) {
        return { success: false, message: `Unrecognized Url query optioneter "${undoUnderKey}"` }
      }
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[undoUnderKey]]
      const optionTexts = (<string>value).split(',')
      switch (group.code) {
        case 'OB':
          {
            const res = await processUrlOB(
              group,
              optionTexts.map((x) => x.replace(/_/g, ' ')),
              selectedFilters,
            )
            if (!res.success) {
              return res
            }
          }
          break

        case 'FS':
          {
            const res = await processUrlCS(group, optionTexts, selectedFilters)
            if (!res.success) {
              return res
            }
          }
          break

        default:
          {
            const res = await processUrlDefault(
              group,
              optionTexts.map((x) => x.replace(/_/g, ' ')),
              selectedFilters,
            )
            if (!res.success) {
              return res
            }
          }
          break
      }
    }
    filterAllOptions.value = selectedFilters
    return { success: true }
  }

  async function processUrlDefault(
    group: TGroupBase,
    optionTexts: string[],
    selectedFilters: string[],
  ) {
    const { useTrioStore } = await import('../trio/trio')
    const { trio } = storeToRefs(useTrioStore())
    for (const x of optionTexts) {
      const i = group.optionKeys.findIndex((y) => trio.value.optionsObj[y].text === x)
      if (i === -1) {
        return {
          success: false,
          message: `*** Url option "${x}" is illegal for optioneter "${group.label}".`,
        }
      }
      selectedFilters.push(group.optionKeys[i])
    }
    return { success: true }
  }

  async function processUrlOB(
    group: TGroupBase,
    optionTexts: string[],
    filterAllOptions: string[],
  ) {
    const { useTrioStore } = await import('../trio/trio')
    const { trio, orderByOptions } = storeToRefs(useTrioStore())
    const selected: string[] = []

    for (const x of optionTexts) {
      const nameOnly = x.slice(0, -2)
      const lastTwo = x.substring(x.length - 2)

      if (selected.some((y) => y === nameOnly)) {
        return { success: false, message: `Duplicate url Order By optioneter "${nameOnly}".` }
      }

      const ordeByIndex = orderByOptions.value.findIndex((y) => y.text === nameOnly)

      if (ordeByIndex === undefined || (lastTwo !== '.A' && lastTwo !== '.D')) {
        return { success: false, message: `Unrecognized url Order By optioneter "${x}".` }
      }

      const firstEmptyOptionKey = group.optionKeys.find((x) => trio.value.optionsObj[x].text === '')
      if (firstEmptyOptionKey === undefined) {
        return { success: false, message: `Problem with url Order By optioneter "${x}".` }
      }
      trio.value.optionsObj[firstEmptyOptionKey].text = x
      filterAllOptions.push(firstEmptyOptionKey)
      selected.push(nameOnly)
    }
    return { success: true }
  }

  async function processUrlCS(
    group: TGroupBase,
    optionTexts: string[],
    filterAllOptions: string[],
  ) {
    const { useTrioStore } = await import('../trio/trio')
    const { trio } = storeToRefs(useTrioStore())
    if (optionTexts.length > 6) {
      return {
        success: false,
        message: `Url query problem: Too many search terms for optioneter "${group.label}".`,
      }
    }
    for (const x of optionTexts) {
      const firstEmptyOptionKey = group.optionKeys.find((x) => trio.value.optionsObj[x].text === '')
      if (firstEmptyOptionKey === undefined) {
        return { success: false, message: `Problem with url search optioneter "${x}".` }
      }
      trio.value.optionsObj[firstEmptyOptionKey].text = x
      filterAllOptions.push(firstEmptyOptionKey)
    }
    return { success: true }
  }

  return { parseModule, parseSlug, parseUrlQuery }
})
