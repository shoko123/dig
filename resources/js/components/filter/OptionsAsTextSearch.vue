<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" sm="8">
        <v-card class="mx-auto" variant="outlined">
          <v-card-item>
            <v-text-field v-for="(item, index) in textSearchValues" :key="index" v-model="textSearchValues[index]"
              :label="`term-${index + 1}`" :name="`search-${index + 1}`" filled
              @update:model-value="(val) => searchTextChanged(index, val)" />
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" sm="2">
        <v-btn class="ml-2" @click="searchTextClearCurrent"> Clear </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useFilterStore } from '../../scripts/stores/trio/filter'
import { useTrioStore } from '../../scripts/stores/trio/trio'
const { searchTextChanged, searchTextClearCurrent } = useFilterStore()
const { textSearchValues } = storeToRefs(useTrioStore())
</script>
