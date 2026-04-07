import { es } from '../locales/es'

type TranslationParams = { [key: string]: string }

export function useTranslation() {
  const t = (key: string, params?: TranslationParams): string => {
    const keys = key.split('.')
    let value: any = es
    
    for (const k of keys) {
      value = value?.[k]
      if (!value) break
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    if (!params) {
      return value
    }
    
    let result = value
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(`{${paramKey}}`, paramValue)
    })
    
    return result
  }
  
  return { t }
}

export default useTranslation
