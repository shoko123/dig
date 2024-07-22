import type { RouteLocationNormalized } from 'vue-router'

//catch Navigation Failures (supress logging to console.)
export default function navigationErrorHandler(
  error: Error,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) {
  console.log(
    `navigationErrorHandler error: ${JSON.stringify(error, null, 2)}\nfrom: ${from.path}\nto: ${to.path}`,
  )
  return false
}
