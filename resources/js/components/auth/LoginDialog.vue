<template>
  <v-btn color="primary" block @click="checkIfVerified"> Continue (After verification) </v-btn>
</template>

<script setup lang="ts">
//This form is only shown if after login, user is found to be not verified -
//proceed only after email verification!

import { useAuthStore } from '../../scripts/stores/auth'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const { getUser, resetAndGoTo } = useAuthStore()
const { showSnackbar } = useNotificationsStore()

async function checkIfVerified() {
  const res = await getUser()
  if (res.success) {
    if (res.data.is_verified) {
      showSnackbar(
        'Thank you for completing your email verification! You are redirected to the login page',
      )
      resetAndGoTo('login')
    } else {
      showSnackbar('Your email has not been verified! Please check email and verify!')
    }
  } else {
    showSnackbar('get-user request failed. Redirected to the home page')
    resetAndGoTo('home')
  }
}
</script>
