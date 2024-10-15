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
                    <v-btn prepend-icon="mdi-arrow-up" @click="orderOptionClicked(index, true)">
                      Add
                    </v-btn>
                  </td>
                  <td>
                    <v-btn prepend-icon="mdi-arrow-down" @click="orderOptionClicked(index, false)">
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
import { useTrioStore } from '../../scripts/stores/trio/trio'

const trioStore = useTrioStore()

const orderBySelected = computed(() => {
  if (trioStore.orderByGroup === undefined) {
    return []
  }

  return trioStore.orderByGroup.optionKeys
    .filter((x) => {
      const label = trioStore.trio.optionsObj[x]!.text
      return label !== ''
    })
    .map((x) => {
      return { label: trioStore.trio.optionsObj[x]!.text, key: x }
    })
})

const orderByAvailable = computed(() => {
  if (trioStore.orderByGroup === undefined) {
    return []
  }

  return trioStore.orderByFieldNameAndLabel.filter((x) => {
    return !orderBySelected.value.some((y) => y.label.slice(0, -2) === x.text)
  })
})

const selected = computed(() => {
  return orderBySelected.value.map((x) => {
    return { name: x.label.slice(0, -2), asc: x.label.slice(-1) === 'A' }
  })
})

function orderOptionClicked(index: number, asc: boolean) {
  const orderByFieldNameAndLabel = trioStore.orderByGroup?.optionKeys.map((x) => {
    return { ...trioStore.trio.optionsObj[x], key: x }
  })

  if (orderByFieldNameAndLabel === undefined) {
    console.log(`serious error - abort *********`)
    return
  }

  const firstEmptyOption = orderByFieldNameAndLabel.find((x) => x.text === '')
  if (firstEmptyOption === undefined) {
    console.log(`serious error - abort *********`)
    return
  }

  const label = `${orderByAvailable.value[index]!.text}.${asc ? 'A' : 'D'}`
  // console.log(`optionClicked(${index}) asc: ${asc} options:  ${JSON.stringify(orderByFieldNameAndLabel, null, 2)} key: ${firstEmptyOption.key} label: ${label}`)

  trioStore.trio.optionsObj[firstEmptyOption.key]!.text = label
  trioStore.filterAllOptionKeys.push(firstEmptyOption.key)
}

function orderByClear() {
  trioStore.orderByClear()
}
</script>
