// xhrTypes.ts
type TXhrMethod = 'get' | 'put' | 'post' | 'delete'
type TXhrResult<T> =
  | {
      success: true
      data: T
      message: string
      status: number
    }
  | {
      success: false
      message: string
      status: number
    }
type TXhrEmptyResult = { success: boolean; status: number; message: string }
type TAsyncSimpleReturn = Promise<{ success: true } | { success: false; message: string }>

export { TXhrMethod, TXhrResult, TXhrEmptyResult, TAsyncSimpleReturn }
