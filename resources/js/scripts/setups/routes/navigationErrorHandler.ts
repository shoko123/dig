import type { RouteLocationNormalized }  from 'vue-router'
 
//catch Navigation Failures (supress logging to console.)
export default function navigationErrorHandler(error: any, to: RouteLocationNormalized, from: RouteLocationNormalized) {
    console.log(`navigationErrorHandler error: $${JSON.stringify(error, null, 2)} to: ${to.path}`);
    return false
}