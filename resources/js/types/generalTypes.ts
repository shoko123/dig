// generalTypes.ts
interface IStringObject {
  [key: string]: string
}

type TXhrMethod = 'get' | 'put' | 'post' | 'delete'
type TXhrResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      message: string
      status: number
    }
type TXhrEmptyResult = { success: boolean }
type TAsyncSimpleReturn = Promise<{ success: true } | { success: false; message: string }>

export { TXhrMethod, TXhrResult, TXhrEmptyResult, IStringObject, TAsyncSimpleReturn }
