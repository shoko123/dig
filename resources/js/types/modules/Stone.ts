import type { TModuleInfo } from '@/js/types/moduleTypes'
type TStone<T extends TModuleInfo> = {
  url_name: 'stones'
  fields: {
    id: string
    id_year: number
    id_access_no: number
    id_object_no: number
    square: string
    context: string
    excavation_date: Date | null
    occupation_level: string
    cataloger_material: string
    whole: boolean
    cataloger_typology: string
    cataloger_description: string
    conservation_notes: string
    weight: string
    length: string
    width: string
    height: string
    diameter: string
    dimension_notes: string
    cultural_period: string
    excavation_object_id: string
    old_museum_id: string
    cataloger_id: number
    catalog_date: Date | null
    specialist_description: string
    specialist_date: Date | null
    thumbnail: string
    uri: string | null
    base_type_id: number
    material_id: number
  }
  FD: Pick<
    TStone<T>['fields'],
    'id_year' | 'base_type_id' | 'material_id' | 'cataloger_id' | 'whole' | 'old_museum_id'
  >
  categorizedFields: Pick<TStone<T>['FD'], 'old_museum_id'>
  TabularViewFields: Pick<
    TStone<T>['fields'],
    | 'id'
    | 'square'
    | 'context'
    | 'excavation_date'
    | 'cataloger_description'
    | 'specialist_description'
    | 'conservation_notes'
  >
}

export { TStone }
