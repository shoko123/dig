<template>
  <v-btn variant="outlined" @click="toFilter">
    Filters
    <v-tooltip activator="parent" location="bottom left">
      <v-text-field>{{ tip }}</v-text-field>
      <TagsForm source="Filter" />
    </v-tooltip>
  </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import TagsForm from '../../../trio/TrioSelectedForm.vue'

const { routerPush } = useRoutesMainStore()

const tip = computed(() => {
  return `Go to filters`
})

function toFilter() {
  routerPush('filter')
}
</script>
