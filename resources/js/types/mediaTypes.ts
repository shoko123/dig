// mediaTypes.ts
import { TModule } from '@/js/types/moduleTypes'
import { TApiPage, TPage, TCollectionName } from '@/js/types/collectionTypes'

type TMediaUrls = { full: string; tn: string }

//When an item has no related media, we use a placeholder media urls.
type TMediaOfItem = {
  hasMedia: boolean
  urls: TMediaUrls
}

type CarouselAll = {
  main: {
    api: { id: string; slug: string; short: string; urls: TMediaUrls | null; module: TModule }
    item: {
      id: string
      slug: string
      short: string
      media: TMediaOfItem
      module: TModule
      tag: string
    }
  }
  media: {
    api: {
      id: number
      urls: TMediaUrls
      size: number
      collection_name: string
      file_name: string
      order_column: number
      title: string
      text: string
    }
    item: {
      id: number
      tag: string
      media: TMediaOfItem
      size: string
      collection_name: string
      file_name: string
      order_column: number
      title?: string
      text?: string
    }
  }
  related: { api: TApiPage<'related', 'Gallery'>; item: TPage<'related', 'Gallery'> }
}

type TApiCarouselUnion = CarouselAll[keyof CarouselAll]['api']
type TCarouselUnion = CarouselAll[keyof CarouselAll]['item']
type TApiCarousel<C extends TCollectionName> = CarouselAll[C]['api']
type TCarousel<C extends TCollectionName> = CarouselAll[C]['item']

export { TMediaUrls, TMediaOfItem, TApiCarousel, TApiCarouselUnion, TCarousel, TCarouselUnion }
