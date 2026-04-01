

const isDev = import.meta.env.DEV
const isProduction = import.meta.env.PROD


export const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args)
  }
}


export const logError = (message: string, error?: any, context?: Record<string, any>) => {
  if (isDev) {
    console.error(`[ERROR] ${message}`, error, context || '')
  }
  
  
  
  
  
}


export const logWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args)
  }
}


export const logDebug = (...args: any[]) => {
  if (isDev) {
    console.debug(...args)
  }
}


export const logRequest = (method: string, url: string, data?: any) => {
  if (isDev) {
    console.log(` [${method.toUpperCase()}] ${url}`, data || '')
  }
}


export const logResponse = (method: string, url: string, status: number, data?: any) => {
  if (isDev) {
    const emoji = status >= 200 && status < 300 ? '' : ''
    console.log(`${emoji} [${method.toUpperCase()}] ${url} - ${status}`, data || '')
  }
}

export default {
  log,
  logError,
  logWarn,
  logDebug,
  logRequest,
  logResponse,
}
