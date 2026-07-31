export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  timeout?: number
  retryCondition?: (error: Error) => boolean
  delayStrategy?: 'exponential' | 'linear' | 'fixed'
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  logger?: Logger[keyof Logger],
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    timeout = 30000,
    retryCondition = () => true,
    delayStrategy = 'exponential',
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger?.info(`Operation attempt ${attempt}/${maxAttempts}`)

      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Operation timeout after ${timeout}ms`)),
            timeout,
          ),
        ),
      ])

      if (attempt > 1) {
        logger?.success(`Operation succeeded on attempt ${attempt}`)
      }
      return result
    } catch (error) {
      lastError = error as Error
      logger?.warn(`Attempt ${attempt} failed:`, error)

      const shouldRetry = attempt < maxAttempts && retryCondition(lastError)
      if (shouldRetry) {
        const delay = calculateDelay(
          attempt,
          baseDelay,
          maxDelay,
          delayStrategy,
        )
        logger?.info(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  logger?.error(`All ${maxAttempts} attempts failed`)
  throw lastError!
}

function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  strategy: 'exponential' | 'linear' | 'fixed',
): number {
  let delay: number

  switch (strategy) {
    case 'exponential':
      delay = baseDelay * Math.pow(2, attempt - 1)
      break
    case 'linear':
      delay = baseDelay * attempt
      break
    case 'fixed':
      delay = baseDelay
      break
    default:
      delay = baseDelay
  }

  return Math.min(delay, maxDelay)
}

export const RetryConditions = {
  networkErrors: (error: Error) => {
    const message = error.message.toLowerCase()
    if (
      message.includes('400') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404')
    ) {
      return false
    }
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    )
  },

  fileSystemErrors: (error: Error) => {
    const message = error.message.toLowerCase()
    if (
      message.includes('eacces') ||
      message.includes('enoent') ||
      message.includes('permission denied')
    ) {
      return false
    }
    return (
      message.includes('ebusy') ||
      message.includes('emfile') ||
      message.includes('enfile') ||
      message.includes('eagain')
    )
  },

  resourceErrors: (error: Error) => {
    const message = error.message.toLowerCase()
    return (
      message.includes('busy') ||
      message.includes('locked') ||
      message.includes('resource') ||
      message.includes('memory') ||
      message.includes('cpu')
    )
  },

  always: () => true,
  never: () => false,
}

export const RetryPresets = {
  fast: {
    maxAttempts: 3,
    baseDelay: 500,
    timeout: 5000,
    delayStrategy: 'exponential' as const,
  },

  standard: {
    maxAttempts: 3,
    baseDelay: 1000,
    timeout: 10000,
    delayStrategy: 'exponential' as const,
  },

  network: {
    maxAttempts: 3,
    baseDelay: 1000,
    timeout: 30000,
    delayStrategy: 'exponential' as const,
    retryCondition: RetryConditions.networkErrors,
  },

  fileSystem: {
    maxAttempts: 5,
    baseDelay: 500,
    timeout: 15000,
    delayStrategy: 'linear' as const,
    retryCondition: RetryConditions.fileSystemErrors,
  },

  slow: {
    maxAttempts: 3,
    baseDelay: 2000,
    timeout: 60000,
    delayStrategy: 'exponential' as const,
  },
}
