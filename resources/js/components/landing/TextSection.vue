<template>
  <v-card fluid outlined>
    <v-card-title class="bg-grey-lighten-3 text-black title mb-2">
      {{ header }}
    </v-card-title>

    <v-card-text class="text-body-1 mb-2 text-black pt-4">
      <v-list lines="two">
        <v-list-item v-for="item in paragraphs" :key="item.title">
          <div class="text-h6">{{ item.title }}</div>
          <v-spacer></v-spacer>
          <div class="text-body-1">{{ item.text }}</div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLandingStore } from '../../scripts/stores/landing'
const { aboutExcavation, aboutWebsite } = useLandingStore()

const props = defineProps<{ sectionName: string }>()

const section = computed(() => {
  switch (props.sectionName) {
    case 'excavation':
      return aboutExcavation

    case 'website':
      return aboutWebsite

    default:
      return { title: `Default Title`, paragraphs: [] }
  }
})

const header = computed(() => {
  return section.value.title
})

const paragraphs = computed(() => {
  return section.value.paragraphs
})
</script>
