import type { TApiTrio } from '@/js/types/trioTypes'
import type { TCollectionView } from '@/js/types/collectionTypes'
import type { TLocus } from '@/js/types/modules/Locus'
import type { TStone } from '@/js/types/modules/Stone'
import type { TCeramic } from '@/js/types/modules/Ceramic'

type TModuleInfo = {
  url_name: string
  fields: object
  CV: object
  TabularViewFields: object
}

type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k]
}

type TAllModules<T extends TModuleInfo = TModuleInfo> = {
  Stone: TStone<T>
  Locus: TLocus<T>
  Ceramic: TCeramic<T>
}

type AddTagAndSlugProperties<M> = M & { tag: string; slug: string }

type AddModuleProperty<T extends TAllModules> = {
  [k in keyof T]: T[k] & { module: k }
}[keyof T]

type ModuleToUrlName<T extends TAllModules> = {
  [Property in keyof T]: T[Property] extends TModuleInfo ? T[Property]['url_name'] : never
}

type UrlModuleToModule<T extends TModuleToUrlName> = {
  [Key in keyof T as T[Key] extends string ? T[Key] : never]: Key
}

type TModuleBtnsInfo = { title: string; module: TModule; url_module: TUrlModule }
type ModuleUnion = AddModuleProperty<TAllModules>
type TModule = keyof TAllModules

type TAllByName<TModuleName extends TModule> = TAllModules[TModuleName]

type TUrlModule = ModuleUnion['url_name']
type TFieldsUnion = ModuleUnion['fields']
type TFieldsByModule<ModuleName extends TModule> = TAllByName<ModuleName>['fields']
type TDiscreteColumnUnion = ModuleUnion['CV']
type TDiscreteColumnsByModule<ModuleName extends TModule> = TAllByName<ModuleName>['CV']

type TApiFieldsUnion = SwapDatesWithStrings<TFieldsUnion>
type TApiPageMainTabularUnion = ModuleUnion['TabularViewFields'] & { slug: string }

type TModuleToUrlName = ModuleToUrlName<TAllModules>
type TUrlModuleNameToModule = UrlModuleToModule<TModuleToUrlName>
type FieldsAsBooleans<T> = {
  [k in keyof T]: boolean
}

type TTabularByModule<ModuleName extends TModule> = TAllByName<ModuleName>['TabularViewFields']
type TApiTabularByModule<ModuleName extends TModule> = AddTagAndSlugProperties<
  TTabularByModule<ModuleName>
>

type FuncSlugToId = (
  slug: string,
) => { success: true; id: string } | { success: false; message: string }

type TApiModuleInit = {
  counts: { items: number; media: number }
  first_id: string
  display_options: {
    item_views: string[]
    main_collection_views: TCollectionView[]
    related_collection_views: TCollectionView[]
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
  TModuleBtnsInfo,
  TFieldsUnion,
  TDiscreteColumnUnion,
  TApiFieldsUnion,
  TApiPageMainTabularUnion,
  TFieldsByModule,
  TApiTabularByModule,
  TTabularByModule,
  TApiModuleInit,
  FuncSlugToId,
  FieldsAsBooleans,
  TDiscreteColumnsByModule,
}
