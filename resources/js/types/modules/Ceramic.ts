import type { TModuleInfo } from '@/js/types/moduleTypes'

type TCeramic<T extends TModuleInfo> = {
  url_name: 'ceramics'
  fields: {
    id: string
    id_year: string
    id_object_no: string
    field_description: string
    specialist_description: string
    base_type_id: number
  }
  FD: Pick<TCeramic<T>['fields'], 'id_object_no' | 'id_year'>
  TabularViewFields: TCeramic<T>['fields']
}

export { TCeramic }
