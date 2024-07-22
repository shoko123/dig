<template>
  <div class="text-subtitle-1 text-medium-emphasis">User Name</div>

  <v-text-field
    v-model="data.name"
    :error-messages="nameErrors"
    density="compact"
    placeholder="Enter user name"
    prepend-inner-icon="mdi-account"
    variant="outlined"
  />

  <div class="text-subtitle-1 text-medium-emphasis">Email</div>

  <v-text-field
    v-model="data.email"
    :error-messages="emailErrors"
    density="compact"
    placeholder="Email address"
    prepend-inner-icon="mdi-email-outline"
    variant="outlined"
  />

  <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
    Password
  </div>

  <v-text-field
    v-model="data.password"
    :error-messages="passwordErrors"
    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
    :type="visible ? 'text' : 'password'"
    density="compact"
    placeholder="Enter your password"
    prepend-inner-icon="mdi-lock-outline"
    variant="outlined"
    @click:append-inner="visible = !visible"
  />

  <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
    Password Confirmation
  </div>

  <v-text-field
    v-model="data.password_confirmation"
    :error-messages="password_confirmationErrors"
    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
    :type="visible ? 'text' : 'password'"
    density="compact"
    placeholder="Enter password confirmation"
    prepend-inner-icon="mdi-lock-outline"
    variant="outlined"
    @click:append-inner="visible = !visible"
  />

  <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="register1">
    Register
  </v-btn>

  <div class="d-flex justify-center">
    <a class="text-blue text-decoration-none" @click="goToLogin">
      To Login Page<v-icon icon="mdi-chevron-right" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useAuthStore } from '../../scripts/stores/auth'
import { useNotificationsStore } from '../../scripts/stores/notifications'

const { showSnackbar } = useNotificationsStore()
const { logout, register, resetAndGoTo, openDialog } = useAuthStore()

import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, maxLength, helpers, sameAs } from '@vuelidate/validators'

const data = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const rules = computed(() => {
  return {
    name: { required, minValue: minLength(4), maxValue: maxLength(40) },
    email: { required, email },
    password: {
      required,
      minLength: minLength(8),
      containsPasswordRequirement: helpers.withMessage(
        () => `The password requires an uppercase, lowercase, and a number`,
        (value) => /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(<string>value),
      ),
    },
    password_confirmation: { required, sameAsPassword: sameAs(data.password) },
  }
})

const v$ = useVuelidate(rules, data)

const nameErrors = computed(() => {
  return <string>(v$.value.name.$error ? v$.value.name.$errors[0].$message : undefined)
})

const emailErrors = computed(() => {
  return <string>(v$.value.email.$error ? v$.value.email.$errors[0].$message : undefined)
})

const passwordErrors = computed(() => {
  return <string>(v$.value.password.$error ? v$.value.password.$errors[0].$message : undefined)
})

const password_confirmationErrors = computed(() => {
  return <string>(
    (v$.value.password_confirmation.$error
      ? v$.value.password_confirmation.$errors[0].$message
      : undefined)
  )
})

const visible = ref(false)

async function register1() {
  await v$.value.$validate()
  if (v$.value.$error || v$.value.$silentErrors.length > 0) {
    showSnackbar('Please correct the marked errors!', 'orange')
    console.log(
      `validation errors: ${JSON.stringify(v$.value.$errors, null, 2)} silent: ${JSON.stringify(v$.value.$silentErrors, null, 2)}`,
    )
    return
  }

  //before attempting to register, logout
  const res1 = await logout()
  if (!res1.success) {
    showSnackbar('Logout failed. Redirected to Home Page')
    resetAndGoTo('home')
  }

  const res2 = await register(data)

  if (res2.success) {
    //if successful, a verification email was sent by laravel. Verification handeling is done in the dialog form.
    openDialog(
      `A verification email has been sent to ${data.email}. After verifying your email please click below to close this tab`,
    )
  } else {
    if (res2.status === 422) {
      showSnackbar(<string>res2.message)
    } else {
      showSnackbar(`Registration Error: ${<string>res2.message} Redirected to home page.`)
      resetAndGoTo('home')
    }
  }
}

function goToLogin() {
  resetAndGoTo('login')
}
</script>
