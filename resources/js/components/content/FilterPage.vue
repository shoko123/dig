<template>
  <div>
    <v-row wrap dense class="mt-1">
      <v-col :cols="widths[0]">
        <Suspense>
          <FilterSelected source="Filter" />
        </Suspense>
      </v-col>
      <v-col :cols="widths[1]">
        <Suspense>
          <FilterSelector />
        </Suspense>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
const FilterSelector = defineAsyncComponent(() => import('../filter/FilterSelector.vue'))
const FilterSelected = defineAsyncComponent(() => import('../trio/TrioSelectedForm.vue'))

const widths = computed(() => {
  const { smAndDown } = useDisplay()
  return smAndDown.value ? [12, 12] : [3, 9]
})
</script>
