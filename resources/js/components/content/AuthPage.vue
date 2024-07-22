<template>
  <template v-if="smAndDown">
    <AuthForm />
  </template>
  <template v-else>
    <v-img
      style="height: 95vh"
      :src="backgroundImage?.fullUrl"
      :lazy-src="backgroundImage?.tnUrl"
      :cover="true"
    >
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
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useModuleStore } from '../../scripts/stores/module'
import AuthForm from '../auth/AuthForm.vue'

const { backgroundImage } = storeToRefs(useModuleStore())
const { smAndDown } = useDisplay()
</script>
