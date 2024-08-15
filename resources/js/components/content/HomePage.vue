<template>
  <greeting />

  <responsive-card>
    <text-section section-name="excavation" />
  </responsive-card>

  <responsive-card>
    <text-section section-name="website" />
  </responsive-card>

  <responsive-card>
    <carousel />
  </responsive-card>

  <my-footer />

</template>

<script setup lang="ts">

import Carousel from '../landing/CarouselSection.vue'
import ResponsiveCard from '../landing/ResponsiveCard.vue'
import MyFooter from '../landing/MyFooter.vue'
import Greeting from '../landing/GreetingSection.vue'
import TextSection from '../landing/TextSection.vue'

</script>
