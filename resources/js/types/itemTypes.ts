//showTypes.ts
//types returned from 'show' api route
import { TApiArray } from '@/js/types/collectionTypes'
import { TApiFieldsUnion } from '@/js/types/moduleTypes'

type TApiItemShow<F extends TApiFieldsUnion> = {
  fields: F
  model_tags: { group_label: string; tag_text: string }[]
  global_tags: { group_label: string; tag_text: string }[]
  media: TApiArray<'media'>[]
  related: TApiArray<'related'>[]
  slug: string
  short: string
}

type TApiItemUpdate = {
  fields: TApiFieldsUnion
  slug: string
}

export { TApiItemShow, TApiItemUpdate }
