<template>
  <v-row wrap dense>
    <v-col :cols="widths[0]">
      <ItemCard />
    </v-col>
    <v-col :cols="widths[1]">
      <ItemSelected source="Item" />
    </v-col>
  </v-row>
  <CollectionForm source="media" class="my-2" />
  <CollectionForm source="related" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import ItemCard from '../item-views/ItemCard.vue'
import CollectionForm from '../../collections/CollectionForm.vue'
const ItemSelected = defineAsyncComponent(() => import('../../trio/TrioSelectedForm.vue'))
const { smAndDown } = useDisplay()

const widths = computed(() => {
  return smAndDown.value ? [12, 12] : [9, 3]
})
</script>
