<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col :cols="widths[0]" :offset="widths[1]">
        <slot></slot>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()
const widths = computed(() => {
  return smAndDown.value ? [12, 0] : [8, 2]
})
</script>
