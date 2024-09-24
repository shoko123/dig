<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <template v-if="props.isCreate">
        <id-selector></id-selector>
      </template>
      <template v-else>
        <v-text-field v-model="nf.id" label="Label" class="mr-1" filled disabled />
      </template>

      <v-text-field v-model="nf.square" label="Square" :error-messages="squareErrors" class="mx-1" filled
        :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.context" label="Context" :error-messages="contextErrors" class="mr-1" filled
        :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.occupation_level" label="Occupation Level" :error-messages="occupation_levelErrors"
        class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.excavation_object_id" label="Excavation Object Id"
        :error-messages="excavation_object_idErrors" class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.old_museum_id" label="Old Museum Id" class="mr-1" filled :disabled="newItemIsInOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-select v-model="nf.cataloger_id" label="Select" item-title="text" item-value="extra"
        :items="catalogerInfo.options"></v-select>

      <v-select v-model="nf.material_id" label="Select" item-title="text" item-value="extra"
        :items="materialInfo.options"></v-select>

      <v-select v-model="nf.base_type_id" label="Select" item-title="text" item-value="extra"
        :items="typologyInfo.options"></v-select>
    </v-row>

    <v-row wrap no-gutters>
      <v-textarea v-model="nf.cataloger_description" label="Cataloger Description" class="mr-1" filled
        :disabled="newItemIsInOC" />
      <v-textarea v-model="nf.conservation_notes" label="Conservation Notes" class="mr-1" filled
        :disabled="newItemIsInOC" />
      <v-textarea v-model="nf.dimension_notes" label="Dimension Notes" class="mr-1" filled :disabled="newItemIsInOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="nf.weight" label="Weight" class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.length" label="Length" class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.width" label="Width" class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.diameter" label="Diameter" class="mr-1" filled :disabled="newItemIsInOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="nf.cultural_period" label="Cataloger Assumed Period" class="mr-1" filled
        :disabled="newItemIsInOC" />
      <v-date-input v-model="nf.excavation_date" label="Excavation Date" clearable :disabled="newItemIsInOC"
        max-width="368" @click:clear="clearDate('Excavation')"></v-date-input>
      <template v-if="newItemIsInOC">
        <!-- <v-text-field v-model="catalogerInfo." label="Cataloger" class="mx-1" filled :disabled="newItemIsInOC" /> -->
        <v-date-input v-model="nf.catalog_date" label="Catalog Date" clearable :disabled="newItemIsInOC" max-width="368"
          @click:clear="clearDate('Catalog')"></v-date-input>
      </template>
    </v-row>
    <v-row wrap no-gutters>
      <v-textarea v-model="nf.specialist_description" label="Specialist Description"
        :error-messages="specialist_descriptionErrors" class="mr-1" filled />
    </v-row>
    <slot :id="nf.id" name="newItem" :v="v$" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { TFieldsByModule } from '@/types/moduleTypes'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useStoneStore } from '../../../scripts/stores/modules/Stone'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
import IdSelector from '../../form-elements/IdSelector.vue'

const props = defineProps<{
  isCreate: boolean
}>()

const { rules, newItemIsInOC } = storeToRefs(useStoneStore())
let { itemNewFieldsToOptionsObj, newFields } = storeToRefs(useItemNewStore())



const v$ = useVuelidate(rules, newFields.value as TFieldsByModule<'Stone'>, { $autoDirty: true })
const nf = computed(() => {
  return newFields.value as TFieldsByModule<'Stone'>
})

// const idErrors = computed(() => {
//   return <string>(v$.value.id?.$error ? v$.value.id.$errors[0].$message : undefined)
// })

const squareErrors = computed(() => {
  return v$.value.square?.$errors.map(x => x.$message) as string[]
})

const contextErrors = computed(() => {
  return v$.value.context?.$errors.map(x => x.$message) as string[]

})

const occupation_levelErrors = computed(() => {
  return v$.value.occupation_level?.$errors.map(x => x.$message) as string[]
})

const excavation_object_idErrors = computed(() => {
  return v$.value.excavation_object_id?.$errors.map(x => x.$message) as string[]
})

const specialist_descriptionErrors = computed(() => {
  return v$.value.specialist_description?.$errors.map(x => x.$message) as string[]
})

const catalogerInfo = computed(() => {
  return itemNewFieldsToOptionsObj.value['cataloger_id']!
})

const materialInfo = computed(() => {
  return itemNewFieldsToOptionsObj.value['material_id']!
})

const typologyInfo = computed(() => {
  return itemNewFieldsToOptionsObj.value['base_type_id']!
})

function clearDate(field: string) {
  switch (field) {
    case 'Excavation':
      nf.value.excavation_date = null
      break

    case 'Catalog':
      nf.value.catalog_date = null
      break

    case 'Specialist':
      nf.value.specialist_date = null
      break
    default:
  }
}
</script>
