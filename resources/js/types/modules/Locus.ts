import type { TModuleInfo } from '@/types/moduleTypes'
type TLocus<T extends TModuleInfo> = {
  url_name: 'loci'
  fields: {
    id: string
    category: string
    a: number
    b: number
    oc_label: string
    square: string
    uri: string
    context_uri: string
    published_date: string
    updated_date: string
  }
  FD: Pick<TLocus<T>['fields'], 'category'>
  categorizedFields: Pick<TLocus<T>['FD'], never>
  TabularViewFields: TLocus<T>['fields']
}

export { TLocus }
