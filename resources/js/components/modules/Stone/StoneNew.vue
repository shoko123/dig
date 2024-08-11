<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <template v-if="props.isCreate">
        <id-selector></id-selector>
      </template>
      <template v-else>
        <v-text-field v-model="newFields.id" label="Label" class="mr-1" filled disabled />
      </template>

      <v-text-field v-model="newFields.square" label="Square" :error-messages="squareErrors" class="mx-1" filled
        :disabled="inOC" />
      <v-text-field v-model="newFields.context" label="Context" :error-messages="contextErrors" class="mr-1" filled
        :disabled="inOC" />
      <v-text-field v-model="newFields.occupation_level" label="Occupation Level"
        :error-messages="occupation_levelErrors" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="newFields.excavation_object_id" label="Excavation Object Id"
        :error-messages="excavation_object_idErrors" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="newFields.old_museum_id" label="Old Museum Id" class="mr-1" filled :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-textarea v-model="newFields.cataloger_description" label="Cataloger Description" class="mr-1" filled
        :disabled="inOC" />
      <v-textarea v-model="newFields.conservation_notes" label="Conservation Notes" class="mr-1" filled
        :disabled="inOC" />
      <v-textarea v-model="newFields.dimension_notes" label="Dimension Notes" class="mr-1" filled :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="newFields.weight" label="Weight" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="newFields.length" label="Length" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="newFields.width" label="Width" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="newFields.diameter" label="Diameter" class="mr-1" filled :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="newFields.cultural_period" label="Cataloger Assumed Period" class="mr-1" filled
        :disabled="inOC" />
      <v-date-input v-model="newFields.excavation_date" label="Excavation Date" clearable :disabled="inOC"
        max-width="368" @click:clear="clearDate('Excavation')"></v-date-input>
      <template v-if="inOC">
        <v-text-field v-model="cataloger" label="Cataloger" class="mx-1" filled :disabled="inOC" />
        <v-date-input v-model="newFields.catalog_date" label="Catalog Date" clearable :disabled="inOC" max-width="368"
          @click:clear="clearDate('Catalog')"></v-date-input>
      </template>
    </v-row>

    <v-row wrap no-gutters>
      <v-textarea v-model="newFields.specialist_description" label="Specialist Description"
        :error-messages="specialist_descriptionErrors" class="mr-1" filled />
    </v-row>
    <slot :id="newFields.id" name="newItem" :v="v" :new-fields="newFields" />
  </v-container>
</template>

<script lang="ts" setup>
import { TFieldsByModule } from '@/js/types/moduleTypes'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useStoneStore } from '../../../scripts/stores/modules/Stone'
import { useItemStore } from '../../../scripts/stores/item'
import IdSelector from '../../form-elements/IdSelector.vue'

const props = defineProps<{
  isCreate: boolean
}>()

const { newFields, rules, inOC } = storeToRefs(useStoneStore())
let { cvColumns } = storeToRefs(useItemStore())

const v = useVuelidate(rules, newFields.value as TFieldsByModule<'Stone'>)

// const idErrors = computed(() => {
//   return <string>(v.value.id?.$error ? v.value.id.$errors[0].$message : undefined)
// })

const squareErrors = computed(() => {
  return <string>(v.value.square?.$error ? v.value.square.$errors[0].$message : undefined)
})

const contextErrors = computed(() => {
  return <string>(v.value.context?.$error ? v.value.context.$errors[0].$message : undefined)
})

const occupation_levelErrors = computed(() => {
  return <string>(v.value.occupation_level?.$error ? v.value.occupation_level.$errors[0].$message : undefined)
})

const excavation_object_idErrors = computed(() => {
  return <string>(v.value.excavation_object_id?.$error ? v.value.excavation_object_id.$errors[0].$message : undefined)
})

const specialist_descriptionErrors = computed(() => {
  return <string>(v.value.specialist_description?.$error ? v.value.specialist_description.$errors[0].$message : undefined)
})

// const specialist_dateErrors = computed(() => {
//   return <string>(v.value.specialist_date?.$error ? v.value.specialist_date.$errors[0].$message : undefined)
// })


const cataloger = computed(() => {
  return cvColumns.value!['cataloger_id']
})

function clearDate(field: string) {
  switch (field) {
    case 'Excavation':
      newFields.value.excavation_date = null
      break

    case 'Catalog':
      newFields.value.catalog_date = null
      break

    case 'Specialist':
      newFields.value.specialist_date = null
      break
    default:

  }

}
</script>
