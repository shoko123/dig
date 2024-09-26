<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <template v-if="props.isCreate">
        <id-selector></id-selector>
      </template>
      <template v-else>
        <v-text-field v-model="nf.id" label="Label" class="mr-1" filled disabled />
      </template>

      <v-text-field v-model="nf.square" label="Square" :error-messages="errors.square" class="mx-1" filled
        :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.context" label="Context" :error-messages="errors.context" class="mr-1" filled
        :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.occupation_level" label="Occupation Level" :error-messages="errors.occupation_level"
        class="mr-1" filled :disabled="newItemIsInOC" />
      <v-text-field v-model="nf.excavation_object_id" label="Excavation Object Id"
        :error-messages="errors.excavation_object_id" class="mr-1" filled :disabled="newItemIsInOC" />
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
        :error-messages="errors.specialist_description" class="mr-1" filled />
    </v-row>
    <slot :id="nf.id" name="newItem" :v="v$" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { TFields } from '@/types/moduleTypes'
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

const { rulesObj, newItemIsInOC } = storeToRefs(useStoneStore())
let { itemNewFieldsToOptionsObj, newFields } = storeToRefs(useItemNewStore())

const v$ = useVuelidate(rulesObj.value, newFields.value, { $autoDirty: true })
// val$.value = useVuelidate(rulesObj.value, newFields.value as TFields<'Stone'>, { $autoDirty: true })
const nf = computed(() => {
  return newFields.value as TFields<'Stone'>
})

const errors = computed(() => {
  let errorObj: Partial<Record<keyof TFields<'Stone'>, string>> = {}
  for (const key in newFields.value) {
    errorObj[key as keyof TFields<'Stone'>] = v$.value[key].$errors.map(x => x.$message) as string
  }
  return errorObj as unknown as TFields<'Stone'>
})

// console.log(`v$: ${JSON.stringify(errors.value, null, 2)}`)

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
