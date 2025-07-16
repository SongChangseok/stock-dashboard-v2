import { useState, useCallback } from 'react'
import { FormErrors, FormData } from '../types/components'

interface ValidationRules {
  [key: string]: {
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: string | number) => string | null
  }
}

interface UseFormValidationReturn {
  errors: FormErrors
  validateField: (name: string, value: string | number) => boolean
  validateForm: (data: FormData) => boolean
  clearError: (name: string) => void
  clearAllErrors: () => void
  hasErrors: boolean
}

export const useFormValidation = (rules: ValidationRules): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({})

  const validateField = useCallback((name: string, value: string | number): boolean => {
    const rule = rules[name]
    if (!rule) return true

    let error: string | null = null

    // Required validation
    if (rule.required && (!value || value === '')) {
      error = 'This field is required'
    }

    // Min validation for numbers
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      error = `Value must be at least ${rule.min}`
    }

    // Max validation for numbers
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      error = `Value must be at most ${rule.max}`
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      error = 'Invalid format'
    }

    // Custom validation
    if (rule.custom && !error) {
      error = rule.custom(value)
    }

    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    } else {
      setErrors(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = prev
        return rest
      })
    }

    return !error
  }, [rules])

  const validateForm = useCallback((data: FormData): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(rules).forEach(name => {
      const rule = rules[name]
      const value = data[name]
      let error: string | null = null

      // Required validation
      if (rule.required && (!value || value === '')) {
        error = 'This field is required'
        isValid = false
      }

      // Min validation for numbers
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        error = `Value must be at least ${rule.min}`
        isValid = false
      }

      // Max validation for numbers
      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        error = `Value must be at most ${rule.max}`
        isValid = false
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        error = 'Invalid format'
        isValid = false
      }

      // Custom validation
      if (rule.custom && !error) {
        error = rule.custom(value)
        if (error) isValid = false
      }

      if (error) {
        newErrors[name] = error
      }
    })

    setErrors(newErrors)
    return isValid
  }, [rules])

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...newErrors } = prev
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    hasErrors
  }
}