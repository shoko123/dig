<template>
  <div>
    <v-container fluid class="ma-0">
      <v-row wrap dense>
        <v-col md="12" lg="3" class="d-flex flex-column">
          <TaggerSelected source="Tagger" />
        </v-col>
        <v-col md="12" lg="9" class="d-flex flex-column">
          <ItemTagger />
          <ItemCard class="mt-2" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import ItemCard from '../item/item-views/ItemCard.vue'
const ItemTagger = defineAsyncComponent(() => import('../trio/ItemTagger.vue'))
const TaggerSelected = defineAsyncComponent(() => import('../trio/TrioSelectedForm.vue'))
</script>
