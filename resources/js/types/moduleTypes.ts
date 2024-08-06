import type { TApiTrio } from '@/js/types/trioTypes'
import type { TCollectionView } from '@/js/types/collectionTypes'
import type { TLocus } from '@/js/types/modules/Locus'
import type { TStone } from '@/js/types/modules/Stone'
import type { TPottery } from '@/js/types/modules/Pottery'

type TModuleInfo = {
  url_name: string
  fields: object
  modify: { id: string }
  lookup: { id: string }
  tabular: { id: string }
}

type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k]
}
type TAllModules<T extends TModuleInfo = TModuleInfo> = {
  Stone: TStone<T>
  Locus: TLocus<T>
  Pottery: TPottery<T>
}

type TAddTagAndSlug<M> = M & { tag: string; slug: string }
type ModuleUnionA<T extends object> = {
  [k in keyof T]: T[k] & { module: k }
}[keyof T]

type ModuleUnionB = ModuleUnionA<TAllModules>
type TModule = keyof TAllModules
type TAllByName<TModuleName extends TModule> = TAllModules[TModuleName]

type TUrlModule = ModuleUnionB['url_name']
type TFieldsUnion = ModuleUnionB['fields']
type TApiFieldsUnion = SwapDatesWithStrings<TFieldsUnion>
type TModifyUnion = ModuleUnionB['modify']
type TLookupUnion = ModuleUnionB['lookup']
type TApiPageMainTabularUnion = ModuleUnionB['tabular'] & { slug: string }

type TFieldsByModule<ModuleName extends TModule> = TAllByName<ModuleName>['fields']
type TApiFieldsByModule<ModuleName extends TModule> = SwapDatesWithStrings<
  TFieldsByModule<ModuleName>
>

type FieldsAsBooleans<T> = {
  [k in keyof T]: boolean
}

type TModifyByModule<ModuleName extends TModule> = TAllByName<ModuleName>['modify']

type TTabularByModule<ModuleName extends TModule> = TAllByName<ModuleName>['tabular']
type TApiTabularByModule<ModuleName extends TModule> = TAddTagAndSlug<TTabularByModule<ModuleName>>

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
  date_columns: string[]
  lookups: { column_name: string; label: string }[]
  trio: TApiTrio
  welcome_text: string
}
export {
  TModuleInfo,
  TModule,
  TUrlModule,
  TFieldsUnion,
  TApiFieldsUnion,
  TModifyUnion,
  TLookupUnion,
  TApiPageMainTabularUnion,
  TFieldsByModule,
  TApiFieldsByModule,
  TModifyByModule,
  TApiTabularByModule,
  TTabularByModule,
  TApiModuleInit,
  FuncSlugToId,
  FieldsAsBooleans,
}
