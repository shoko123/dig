// routesStore.js
import type { TCollectionView } from '@/js/types/collectionTypes'
import type { TModule, TUrlModule } from '@/js/types/moduleTypes'

type TRoutes =
  | { name: 'home' }
  | { name: 'welcome'; params: { module: TUrlModule } }
  | { name: 'filter'; module: TModule; params: { module: TUrlModule } }
  | { name: 'index'; module: TModule; params: { module: TUrlModule; query: string } }
  | { name: 'show'; module: TModule; params: { module: TUrlModule; query: string; slug: string } }
  | { name: 'create'; module: TModule; params: { module: TUrlModule } }
  | {
      name: 'update'
      module: TModule
      params: { module: TUrlModule; slug: string; action: 'update' }
    }
  | { name: 'tag'; module: TModule; params: { module: TUrlModule; slug: string; action: 'tag' } }
  | { name: 'media'; media: TModule; params: { module: TUrlModule; slug: string; action: 'media' } }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'forgot-password' }
  | { name: 'reset-password' }
  | { name: 'reset-dashboard' }

type TPageName = TRoutes['name']

type TPlanAction =
  | 'module.load'
  | 'module.clear'
  | 'collection.item.load'
  | 'collection.load'
  | 'collection.clear'
  | 'item.load'
  | 'item.setIndexInCollection'
  | 'item.clear'
  | 'item.prepareForCreate'
  | 'item.prepareForUpdate'
  | 'item.prepareForTag'
  | 'item.prepareForMedia'
  | 'page.load' //load pageB1 according to current item
  | 'page.load1' //load pageB1 = 1

type TRouteInfo = {
  name: TPageName
  url_module: TUrlModule | undefined
  slug: string | undefined
  url_full_path: string | undefined
  module: TModule | undefined
  queryParams: object | undefined
  preLoginFullPath: string | undefined
}

type TSelectedFilterFromQuery = {
  param: string
  code: string
  extra: string
}

type TApiFilters = {
  model_tag_ids: number[]
  global_tag_ids: number[]
  field_value: { field_name: string; vals: (string | number | boolean)[] }[]
  field_search: { field_name: string; vals: string[] }[]
  media: string[]
  bespoke: { group_name: string; vals: string[] }[]
  order_by: { field_name: string; asc: boolean }[]
}

type TParseQuery = {
  success: boolean
  apiFilters: TApiFilters
  selectedFilters: TSelectedFilterFromQuery[]
  message: string
}

type TPlanResponse =
  | {
      success: true
      data: TPlanAction[]
    }
  | {
      success: false
      message: string
    }

type TFuncLoadPage = (
  pageNoB1: number,
  view: TCollectionView,
  length: number,
  module: TModule,
) => Promise<{ success: true; message: string } | { success: false; message: string }>

export {
  TPageName,
  TRouteInfo,
  TParseQuery,
  TApiFilters,
  TSelectedFilterFromQuery,
  TPlanResponse,
  TPlanAction,
  TFuncLoadPage,
}
