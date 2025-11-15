import { describe, it, expect } from 'vitest'
import { createClientLogger, getUserErrorMessage } from '../client-logger'

describe('client-logger', () => {
  describe('getUserErrorMessage', () => {
    it('should return custom message for fetch errors', () => {
      const error = new Error('Failed to fetch data')
      const message = getUserErrorMessage(error)
      expect(message).toBe('Erreur de connexion. Veuillez vérifier votre connexion internet.')
    })

    it('should return custom message for 401 errors', () => {
      const error = new Error('401 Unauthorized')
      const message = getUserErrorMessage(error)
      expect(message).toBe("Vous n'êtes pas autorisé à effectuer cette action.")
    })

    it('should return custom message for 403 errors', () => {
      const error = new Error('403 Forbidden')
      const message = getUserErrorMessage(error)
      expect(message).toBe("Vous n'êtes pas autorisé à effectuer cette action.")
    })

    it('should return custom message for 404 errors', () => {
      const error = new Error('404 Not Found')
      const message = getUserErrorMessage(error)
      expect(message).toBe('Ressource non trouvée.')
    })

    it('should return custom message for 500 errors', () => {
      const error = new Error('500 Internal Server Error')
      const message = getUserErrorMessage(error)
      expect(message).toBe('Erreur serveur. Veuillez réessayer plus tard.')
    })

    it('should return error message if it is short and user-friendly', () => {
      const error = new Error('Invalid email address')
      const message = getUserErrorMessage(error)
      expect(message).toBe('Invalid email address')
    })

    it('should return generic message for long errors', () => {
      const error = new Error('a'.repeat(150))
      const message = getUserErrorMessage(error)
      expect(message).toBe('Une erreur est survenue. Veuillez réessayer.')
    })

    it('should return generic message for unknown errors', () => {
      const message = getUserErrorMessage('some string error')
      expect(message).toBe('Une erreur est survenue. Veuillez réessayer.')
    })

    it('should return generic message for null or undefined', () => {
      const message = getUserErrorMessage(null)
      expect(message).toBe('Une erreur est survenue. Veuillez réessayer.')
    })
  })

  describe('createClientLogger', () => {
    it('should create a logger with default context', () => {
      const logger = createClientLogger({ component: 'TestComponent' })
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('info')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.info).toBe('function')
    })

    it('should create logger with action context', () => {
      const logger = createClientLogger({
        component: 'TestComponent',
        action: 'testAction'
      })
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('info')
    })
  })
})
