import axios from 'axios'

export const axiosPublic = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/`,
  withCredentials: true,
})

export const axiosPrivate = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/`,
  headers: { 'Content-Type': 'application/json' },
})
