// API client with built-in error handling

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error. Please check your connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
}

async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new APIError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.code
      )
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timed out. Please try again.')
      }
      if (!navigator.onLine) {
        throw new NetworkError('You are offline. Please check your connection.')
      }
    }

    throw new NetworkError()
  }
}

export const api = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' })
  },

  post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' })
  },
}

// Helper to format error messages for display
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message
  }
  if (error instanceof NetworkError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
