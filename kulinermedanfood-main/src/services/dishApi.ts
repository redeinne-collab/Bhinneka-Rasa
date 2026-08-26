import type { Food } from '../types/food'

import API_BASE_URL from '../config/api'

export async function fetchDishes(signal?: AbortSignal): Promise<Food[]> {
  const res = await fetch(`${API_BASE_URL}/dishes`, { signal })
  const result = await res.json()
  if (!result.success) throw new Error('Gagal mengambil data kuliner')
  return result.data
}

export async function fetchDishById(id: string | number): Promise<Food | null> {
  const res = await fetch(`${API_BASE_URL}/dishes/${id}`)
  const result = await res.json()
  if (!result.success) return null
  return result.data
}