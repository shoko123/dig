<template>
  <v-card fluid outlined>
    <v-card-title class="bg-grey-lighten-3 text-black title mb-2"> Location </v-card-title>

    <v-card-text class="text-body-1 mb-2">
      The fake site is located in the fertile valley of so and so...
      <GoogleMap :api-key="googleMapsApiKey" style="width: 100%; height: 700px" :zoom="17" :center="center"
        map-type-id="satellite" :street-view-control="false" :map-id="mapId">
        <AdvancedMarker :options="{ position: center }" />
      </GoogleMap>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'
import { useMainStore } from '../../scripts/stores/main'

const { googleMapsApiKey } = storeToRefs(useMainStore())
const center = { lat: 32.55864, lng: 35.33668 }
const mapId = 'my_map_id'
</script>
