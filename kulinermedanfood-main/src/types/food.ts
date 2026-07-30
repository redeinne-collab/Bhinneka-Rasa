export interface RecommendedPlace {
  name: string
  address: string
  rating: number
  hours: string
  priceRange: string
  mapsUrl: string
}

export interface NutritionInfo {
  calories: string
  fat: string
  carbs: string
  protein: string
  other?: string
}

export interface Food {
  id: number
  name: string
  description: string
  price: number
  rating: number
  image: string
  category: string
  isPopular: boolean
  ingredients: string[]
  location: string
  history?: string
  journey?: string
  spices?: string[]
  nutrition?: NutritionInfo
  recommendedPlaces?: RecommendedPlace[]
}