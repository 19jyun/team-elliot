// Jest 설정 파일
require('@testing-library/jest-dom')

// 통합 테스트 환경 변수 설정
process.env.TEST_TYPE = 'integration'

// Node.js 환경에서 필요한 전역 객체 polyfill
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// MSW v2를 위한 추가 polyfill
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = require('stream/web')
  global.TransformStream = TransformStream
}

if (typeof global.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web')
  global.ReadableStream = ReadableStream
}

if (typeof global.WritableStream === 'undefined') {
  const { WritableStream } = require('stream/web')
  global.WritableStream = WritableStream
}

// MSW를 위한 fetch API polyfill
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map(Object.entries(init.headers || {}))
    }
    
    json() {
      return Promise.resolve(JSON.parse(this.body))
    }
    
    text() {
      return Promise.resolve(this.body)
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0))
    }
  }
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.body = init.body
      this.signal = init.signal
    }
    
    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: new Map(this.headers),
        body: this.body,
        signal: this.signal
      })
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0))
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init))
    }
    
    get(name) {
      return this.map.get(name.toLowerCase())
    }
    
    set(name, value) {
      this.map.set(name.toLowerCase(), value)
    }
  }
}

// MSW를 위한 추가 polyfill
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name
      this.listeners = []
    }
    
    postMessage(data) {
      // Mock implementation
    }
    
    addEventListener(type, listener) {
      this.listeners.push(listener)
    }
    
    removeEventListener(type, listener) {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
    
    close() {
      this.listeners = []
    }
  }
}

// MSW (Mock Service Worker) 설정 - 통합 테스트에서만 사용
// MSW 서버 설정 (모든 테스트에서 사용)
const { server } = require('./src/__mocks__/server')

// 통합 테스트에서만 MSW 서버 사용
const isIntegrationTest = process.env.TEST_TYPE === 'integration'

if (isIntegrationTest) {
  // 테스트 전에 MSW 서버 시작
  beforeAll(() => {
    console.log('Starting MSW server...')
    server.listen({ 
      onUnhandledRequest: 'warn',
      // 성능 최적화를 위한 설정
      quiet: true
    })
  })

  // 각 테스트 후에 핸들러를 초기 상태로 리셋
  afterEach(() => {
    server.resetHandlers()
  })

  // 모든 테스트 후에 MSW 서버 정리
  afterAll(() => {
    console.log('Closing MSW server...')
    server.close()
  })
}

// 전역 모킹 설정
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// IntersectionObserver 모킹
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// matchMedia 모킹 (반응형 테스트용)
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

// localStorage 모킹
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// sessionStorage 모킹
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// fetch 모킹
global.fetch = jest.fn()

// console 경고 억제 (테스트 중 불필요한 경고 제거)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
