type TLoginForm = {
  email: string
  password: string
}

type TRegistrationForm = {
  email: string
  password: string
}

type TForgotPasswordForm = {
  email: string
}

type TResetPasswordForm = {
  email: string
  password: string
  password_confirmation: string
  token: string
}

type TUser = {
  name: string
  id: number
  is_verified: boolean
  permissions: string[]
}

export { TLoginForm, TRegistrationForm, TForgotPasswordForm, TResetPasswordForm, TUser }
