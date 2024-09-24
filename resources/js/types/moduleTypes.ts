import type { TApiTrio, TOption } from '@/types/trioTypes'
import type { TCName, TCollectionView } from '@/types/collectionTypes'
import type { TLocus } from '@/types/modules/Locus'
import type { TStone } from '@/types/modules/Stone'
import type { TCeramic } from '@/types/modules/Ceramic'

type TModuleInfo = {
  url_name: string
  fields: object
  FD: object
  categorizedFields: object
  TabularViewFields: object
}

type TAllModules<T extends TModuleInfo = TModuleInfo> = {
  Stone: TStone<T>
  Locus: TLocus<T>
  Ceramic: TCeramic<T>
}

type TAllByModule<M extends TModule> = TAllModules[M]

type AddModuleProperty<T extends TAllModules> = {
  [k in keyof T]: T[k] & { module: k }
}[keyof T]

type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k]
}

type AddTagAndSlugProperties<M> = M & { tag: string; slug: string }

type ModuleToUrlName<T extends TAllModules> = {
  [Key in keyof T]: T[Key] extends TModuleInfo ? T[Key]['url_name'] : never
}

type UrlModuleToModule<T extends TModuleToUrlName> = {
  [Key in keyof T as T[Key] extends string ? T[Key] : never]: Key
}

type TModuleToUrlName = ModuleToUrlName<TAllModules>
type TUrlModuleNameToModule = UrlModuleToModule<TModuleToUrlName>

type TModuleBtnsInfo = { title: string; module: TModule; url_module: TUrlModule }
type ModuleUnion = AddModuleProperty<TAllModules>
type TModule = keyof TAllModules

type TUrlModule = ModuleUnion['url_name']

type TCategorizedFields<M extends TModule = TModule> = TAllByModule<M>['categorizedFields']
type TFields<M extends TModule = TModule> = TAllByModule<M>['fields']
type TBespokeFields<M extends TModule = TModule> = TAllByModule<M>['FD']

type TApiFields = SwapDatesWithStrings<TFields>
type TFieldValue = string | number | boolean

type TFieldInfo = {
  fieldName: string
  fieldValue: TFieldValue
  optionKey: string
  optionLabel: string
  optionExtra: TFieldValue
  options: TOption[]
  index: number
}

type TTabular<M extends TModule = TModule> = TAllByModule<M>['TabularViewFields']
type TApiTabular<M extends TModule = TModule> = AddTagAndSlugProperties<TTabular<M>>

type TCategorizedFieldsByModule<M extends TModule> = TAllByModule<M>['categorizedFields']

type TObjCategorizerByFieldName<M extends TModule> = {
  [Key in keyof TCategorizedFieldsByModule<M>]: (val: TCategorizedFieldsByModule<M>[Key]) => number
}

type FuncCategorizer = (val: TFieldValue) => number
type TObjCategorizerFuncsByModule<M extends TModule> = Record<
  keyof TObjCategorizerByFieldName<M>,
  FuncCategorizer
>
type TObjAllCategorizerFuncs = TObjCategorizerFuncsByModule<TModule>
type TFuncIdToTagAndSlug = (id: string) => { slug: string; tag: string }

type TObjIdTagAndSlugFuncsByModule = Record<
  TModule,
  {
    idToSlugTag: TFuncIdToTagAndSlug
    regexp: RegExp
  }
>

type TItemsPerPageByView = Record<TCollectionView, number>

type TViewsForCollection = Record<TCName, TCollectionView[]>

type TApiModuleInit = {
  module: TModule
  counts: { items: number; media: number }
  first_id: string
  display_options: {
    item_views: string[]
    main_collection_views: TCollectionView[]
    related_collection_views: TCollectionView[]
    collection_views: TViewsForCollection
    items_per_page: TItemsPerPageByView
  }

  trio: TApiTrio
  welcome_text: string
}

export {
  TModuleInfo,
  TModule,
  TUrlModule,
  TModuleToUrlName,
  TUrlModuleNameToModule,
  TApiModuleInit,
  TViewsForCollection,
  TItemsPerPageByView,
  TModuleBtnsInfo,
  TApiTabular,
  TTabular,
  //item fields
  TFieldValue,
  TApiFields,
  TFields,
  TBespokeFields,
  TFieldInfo,
  TObjCategorizerByFieldName,
  TObjAllCategorizerFuncs,
  TCategorizedFieldsByModule,
  TCategorizedFields,
  TObjIdTagAndSlugFuncsByModule,
  TObjCategorizerFuncsByModule,
}
