import type { TModuleInfo } from '@/js/types/moduleTypes'

type TPottery<T extends TModuleInfo> = {
  url_name: 'pottery'
  fields: {
    id: string
    name: string
    area: string
  }
  modify: Pick<TPottery<T>['fields'], 'id' | 'area'>
  lookup: Pick<TPottery<T>['fields'], 'id'>
  tabular: TPottery<T>['fields']
}

export { TPottery }
