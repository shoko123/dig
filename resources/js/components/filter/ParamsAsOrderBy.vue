<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" sm="6">
        <v-card class="mx-auto" variant="outlined">
          <v-card-title class="bg-grey text-black py-0 mb-4"> OPTIONS </v-card-title>
          <v-card-item>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Add Ascend</th>
                  <th class="text-left">Add Descend</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in orderByAvailable" :key="index">
                  <td>{{ item.text }}</td>
                  <td>
                    <v-btn prepend-icon="mdi-arrow-up" @click="orderParamClicked(index, true)">
                      Add
                    </v-btn>
                  </td>
                  <td>
                    <v-btn prepend-icon="mdi-arrow-down" @click="orderParamClicked(index, false)">
                      Add
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" sm="1">
        <v-row justify="center">
          <v-btn class="ma-2" @click="orderByClear"> Clear </v-btn>
        </v-row>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card class="mx-auto" variant="outlined">
          <v-card-title class="bg-grey text-black py-0 mb-4"> SELECTED </v-card-title>
          <v-card-item>
            <v-table>
              <!-- <thead>
                <tr>
                  <th class="text-left">
                    Name
                  </th>
                </tr>
              </thead> -->
              <tbody>
                <tr v-for="(item, index) in selected" :key="index">
                  <td>
                    <v-btn :prepend-icon="item.asc ? 'mdi-arrow-up' : 'mdi-arrow-down'">
                      {{ item.name }}
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '../../scripts/stores/trio/filter'
import { useTrioStore } from '../../scripts/stores/trio/trio'
let { orderByAvailable, orderBySelected } = storeToRefs(useTrioStore())
let { orderParamClicked, orderByClear } = useFilterStore()

const selected = computed(() => {
  // return orderBySelected
  return orderBySelected.value.map((x) => {
    return { name: x.label.slice(0, -2), asc: x.label.slice(-1) === 'A' }
  })
})
</script>
