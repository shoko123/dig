<template>
  <template v-if="!isLoggedIn">
    <div class="text-subtitle-1 text-medium-emphasis">Email</div>
    <v-text-field
      v-model="data.email"
      readonly
      :error-messages="emailErrors"
      density="compact"
      placeholder="Email address"
      prepend-inner-icon="mdi-email-outline"
      variant="outlined"
    />

    <v-text-field
      v-model="data.password"
      :error-messages="passwordErrors"
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="visible ? 'text' : 'password'"
      density="compact"
      placeholder="Enter your new password"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      @click:append-inner="visible = !visible"
    />

    <v-text-field
      v-model="data.password_confirmation"
      :error-messages="password_confirmationErrors"
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="visible ? 'text' : 'password'"
      density="compact"
      placeholder="Enter new password confirmation"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      @click:append-inner="visible = !visible"
    />

    <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="sendResetPassword">
      Reset Password
    </v-btn>
  </template>
  <template v-else>
    <div class="text-h4">
      {{ problemText }}
    </div>
    <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="closeTab">
      Close Tab
    </v-btn>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../scripts/stores/auth'
import { useNotificationsStore } from '../../scripts/stores/notifications'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers, sameAs } from '@vuelidate/validators'

onMounted(() => {
  prefetch()
  const route = useRoute()
  data.email = <string>route.query.email
  data.token = <string>route.params.slug
  console.log(`ResetPasswordForm data:\n ${JSON.stringify(data, null, 2)}`)
})

let { showSnackbar } = useNotificationsStore()
let { resetPassword, getUser, openDialog } = useAuthStore()

const visible = ref(false)
let isLoggedIn = ref(false)

const data = reactive({
  email: '',
  password: '',
  password_confirmation: '',
  token: '',
})

async function prefetch() {
  const res = await getUser()
  if (res.success) {
    isLoggedIn.value = true
  }
}

const rules = computed(() => {
  return {
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
    token: { required },
  }
})

const v$ = useVuelidate(rules, data)

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

async function sendResetPassword() {
  await v$.value.$validate()
  if (v$.value.$error || v$.value.$silentErrors.length > 0) {
    showSnackbar('Please correct the marked errors!', 'orange')
    console.log(
      `validation errors: ${JSON.stringify(v$.value.$errors, null, 2)} silent: ${JSON.stringify(v$.value.$silentErrors, null, 2)}`,
    )
    return
  }

  const res = await resetPassword(data)

  if (res.success) {
    openDialog(
      `Your password was successfuly reset. Please close this tab and follow the instructions in the app to login.`,
    )
  } else {
    openDialog(`Password-reset request failed. Please close this tab and try later.`)
  }
}

async function closeTab() {
  window.close()
}

const problemText = computed(() => {
  return isLoggedIn.value
    ? `You are currently logged in and therefore can't reset your password.\
  Please close this tab and log out of the application before clicking the reset-password link in your email.`
    : ''
})
</script>
