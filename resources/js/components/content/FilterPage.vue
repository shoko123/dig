<template>
  <div>
    <v-row wrap dense class="mt-1">
      <v-col :cols="widths[0]">
        <TagsForm2 source="Filter" />
      </v-col>
      <v-col :cols="widths[1]">
        <FilterSelector />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import FilterSelector from '../filter/FilterSelector.vue'
import TagsForm2 from '../trio/TrioSelectedForm.vue'
const widths = computed(() => {
  const { smAndDown } = useDisplay()
  return smAndDown.value ? [12, 12] : [3, 9]
})
</script>
