<template>
  <v-parallax :src="backgroundUrl" height="750">
    <v-container class="d-flex flex-column fill-height justify-center align-center">
      <div>
        <v-row class="text-h2 font-weight-black text-brown">
          <v-col :cols="widths[0]" :offset="widths[1]">
            {{ header }}
          </v-col>
        </v-row>
        <v-row class="text-h5 font-weight-medium mb-2 text-white">
          <v-col :cols="widths[0]" :offset="widths[1]">
            {{ text }}
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-parallax>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()

const header = computed(() => {
  return `Welcome to open dig report's fake database website!`
})
const text = computed(() => {
  return `This website is shows the details of a fictitious archaeological excavation and showcases some of the features
        available when using the OpenDigReports software.`
})

const backgroundUrl = computed(() => {
  return `http://127.0.0.1:9090/dig/app/carousel/Dig1.jpg`
  // "https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
})

const widths = computed(() => {
  return smAndDown.value ? [6, 3] : [12, 0]
})
</script>

<style scoped>
.opac {
  background-color: rgba(92, 19, 19, 0.4) !important;
}
</style>
