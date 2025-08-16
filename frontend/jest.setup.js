import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for MSW
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock API client
jest.mock('./lib/api/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))

// Mock individual API modules
jest.mock('./lib/api/authApi', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  refreshToken: jest.fn(),
}))

jest.mock('./lib/api/journalApi', () => ({
  getJournals: jest.fn(),
  getJournal: jest.fn(),
  createJournal: jest.fn(),
  updateJournal: jest.fn(),
  deleteJournal: jest.fn(),
  getJournalStats: jest.fn(),
}))

jest.mock('./lib/api/photoApi', () => ({
  getPhotos: jest.fn(),
  getPhoto: jest.fn(),
  uploadPhoto: jest.fn(),
  updatePhoto: jest.fn(),
  deletePhoto: jest.fn(),
  getJournalPhotos: jest.fn(),
}))

jest.mock('./lib/api/analyticsApi', () => ({
  getOverview: jest.fn(),
  getJournalAnalytics: jest.fn(),
  getProgress: jest.fn(),
}))

jest.mock('./lib/api/timelapseApi', () => ({
  generateTimelapse: jest.fn(),
  getTimelapse: jest.fn(),
  getTimelapses: jest.fn(),
  deleteTimelapse: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock File and FileReader for file upload tests
global.File = class File {
  constructor(fileBits, fileName, options) {
    this.name = fileName
    this.size = fileBits.length
    this.type = options?.type || ''
    this.lastModified = Date.now()
  }
}

global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0
    this.result = null
  }
  
  readAsDataURL() {
    this.readyState = 2
    this.result = 'data:image/jpeg;base64,fake-base64-data'
    if (this.onload) this.onload()
  }
  
  readAsText() {
    this.readyState = 2
    this.result = 'fake file content'
    if (this.onload) this.onload()
  }
}

// Suppress console errors during tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})