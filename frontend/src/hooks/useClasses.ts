import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useClasses(filters?: {
  dayOfWeek?: string
  teacherId?: number
}) {
  return useQuery({
    queryKey: ['classes', filters],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/classes`,
        {
          params: filters,
        },
      )
      return response.data
    },
  })
}

export function useMyClasses() {
  return useQuery({
    queryKey: ['my-classes'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/student/classes`,
      )
      return response.data
    },
  })
}
