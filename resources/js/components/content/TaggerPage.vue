<template>
  <div>
    <v-container fluid class="ma-0">
      <v-row wrap dense>
        <v-col md="12" lg="3" class="d-flex flex-column">
          <TagsForm source="New" />
        </v-col>
        <v-col md="12" lg="9" class="d-flex flex-column">
          <TagSelector />
          <ItemCard class="mt-2" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import TagSelector from '../trio/ItemTagger.vue'
import TagsForm from '../trio/TrioSelectedForm.vue'
import ItemCard from '../item/item-views/ItemCard.vue'
</script>
