// collectionTypes.ts

type TView = 'Media' | 'Chips' | 'Table'
type TSource = 'main' | 'media' | 'related'
type TElement = 'array' | 'page' | 'viewIndex'

type TItemsPerPage = {
        Media: number,
        Chips: number,
        Table: number
}

//'main' array items
type TArrayItem = { id: number, url_id: string }

//raw data received from DB (from 'main, page('media') & page('table'))
interface IPage {
        id: number, 
        url_id: string, 
        description?: string,
        primaryMedia?: { full: string, tn: string } | null
}

//conversions ready for consumption for 'Media', 'Chip', and 'Table' views
interface IChipItem {
        id: number
        tag: string,
}

interface IMediaItem {
        id: number
        tag: string,
        description: string
        hasMedia: boolean,        
        urls: { full: string, tn: string }
}

interface ITableItem {
        id: number,
        tag: string
        description: string
}
//union of the above
type IPageItem = IMediaItem | IChipItem | ITableItem


//all the data kept in a specific collection
type TCollection = {
        length: number,
        index: number,
        pageNoB1: number,
        views: TView[],
        viewIndex: number,
        ready: { array: boolean, index: boolean, page: boolean }
}

type TCollectionMeta = {
        views: string[],
        viewIndex: number,
        pageNoB1: number,
        noOfItems: number,
        noOfPages: number,
        noOfItemsInCurrentPage: number,
        firstItemNo: number,
        lastItemNo: number
}


export { TView, TCollection, TElement, TSource, IPage, TItemsPerPage, TCollectionMeta, IPageItem, TArrayItem, IChipItem, IMediaItem, ITableItem }