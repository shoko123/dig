<template>
  <v-card class="mx-auto" min-width="800" max-width="900">
    <v-card-text>
      <v-row>
        <v-select v-model="year" label="Year" item-title="text" item-value="extra" :items="yearInfo.options"
          class="mx-2" @update:model-value="yearSelected"></v-select>
        <v-select v-model="objectNo" label="Object No." item-title="text" item-value="extra" :items="availableObjectNos"
          @update:model-value="objNoSelected"></v-select>
      </v-row>
      <v-row>
        <v-btn class="ma-5" :disabled="!ready" @click="accept">{{ label }}</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields, TFieldInfo } from '@/types/moduleTypes'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

onMounted(() => {
  year.value = nf.value.id_year
  if (availableObjectNos.value.length > 0) {
    objectNo.value = nf.value.id_object_no
  }
})

const { openIdSelectorModal, newFields, fieldsWithOptions, currentIds } = storeToRefs(useItemNewStore())

// We define local values for year & objectNo (rather than using values in newFields) to handle
// the cases when there are no objectNo options for a specific year.
const year = ref<number>(20)
const objectNo = ref<number | undefined>(undefined)

const nf = computed(() => {
  return newFields.value as TFields<'Ceramic'>
})

const ceramicFieldsWithOptions = computed(() => {
  return fieldsWithOptions.value as Partial<Record<keyof TFields<'Ceramic'>, TFieldInfo>>
})

const yearInfo = computed(() => {
  return ceramicFieldsWithOptions.value['id_year']!
})

const ready = computed(() => {
  return objectNo.value !== undefined
})

const label = computed(() => {
  return ready.value ? `20${year.value}.${objectNo.value}` : `ID not set`
})

const availableObjectNos = computed(() => {
  const itemNos = currentIds.value
    .filter((x) => {
      const sections = x.split('.')
      return sections[0] === year.value.toString()
    })
    .map((x) => {
      const sections = x.split('.')
      return parseInt(sections[1]!)
    })

  const all = [...Array(9).keys()].map((i) => i + 1)

  return all.filter((x) => {
    return !itemNos.includes(x)
  })
})

function yearSelected(selected: number) {
  console.log(`yearSelected(${selected})`)
  year.value = selected
  if (availableObjectNos.value.length > 0) {
    objectNo.value = availableObjectNos.value[0]!
  } else {
    objectNo.value = undefined
  }
}

function objNoSelected(selected: number) {
  console.log(`objNoSelected(${selected})`)
  objectNo.value = selected
}

function accept() {
  nf.value.id_year = year.value
  nf.value.id_object_no = objectNo.value!
  nf.value.id = `${year.value}.${objectNo.value}`
  openIdSelectorModal.value = false
  console.log(`id accepted: ${newFields.value.id}`)
}
</script>
