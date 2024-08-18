import type { TModuleInfo } from '@/js/types/moduleTypes'
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
  TabularViewFields: TLocus<T>['fields']
}

export { TLocus }
