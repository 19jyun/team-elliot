import axios from 'axios'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
      console.log('Request headers:', config.headers)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 세션 만료 또는 권한 없음
      await signOut({ redirect: false })
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
