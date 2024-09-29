<template>
  <template v-if="smAndDown">
    <AuthForm />
  </template>
  <template v-else>
    <v-img style="height: 95vh" :src="bgUrls.fullUrl" :lazy-src="bgUrls.tnUrl" :cover="true">
      <v-container fluid pa-0>
        <v-row justify="center" style="height: 100vh" dense>
          <v-col md="5" class="grey-lighten-2 fill-height d-flex flex-column justify-center">
            <AuthForm />
          </v-col>
        </v-row>
      </v-container>
    </v-img>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useMainStore } from '../../scripts/stores/main'
import AuthForm from '../auth/AuthForm.vue'

const { bucketUrl } = storeToRefs(useMainStore())
const { smAndDown } = useDisplay()

const bgUrls = computed(() => {
  return {
    fullUrl: `${bucketUrl.value}app/background/Auth.jpg`,
    tnUrl: `${bucketUrl.value}app/background/Auth-tn.jpg`,
  }
})
</script>
