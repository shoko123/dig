//showTypes.ts
//types returned from 'show' api route
import { TArrayByCName } from '@/js/types/collectionTypes'
import { TApiFieldsUnion } from '@/js/types/moduleTypes'

type TApiTag = { group_label: string; tag_text: string }
type TApiItemShow<F extends TApiFieldsUnion> = {
  fields: F
  model_tags: TApiTag[]
  global_tags: TApiTag[]
  media: TArrayByCName<'media'>[]
  related: TArrayByCName<'related'>[]
  slug: string
  short: string
}

type TApiItemUpdate = {
  fields: TApiFieldsUnion
  slug: string
}

export { TApiItemShow, TApiTag, TApiItemUpdate }
