export interface UserRequestParams {
  placeId?: string
  hotelId?: string
  checkIn: string
  checkOut: string
  rooms: string
  offset? :number
  facilities?: number | number[]
}

export interface SearchParams extends UserRequestParams {
  offset: number
  searchId: string
  pageSize?: number
  attributes?: string
}

export interface RateBreakDown {
  base: number
  hotelFees: number
  taxes: number
}

export interface Offer {
  id: string
  roomID: string
  providerCode: string
  currency: string
  url: string
  rate: RateBreakDown
}

interface Room {
  name: string
}

export interface OfferEntity {
  id: string
  offers: Offer[]
  rooms: Record<string, Room>
}

export interface Hotel {
  objectID: string
  hotelName: string
  placeDisplayName: string
  imageURIs: string[]
  starRating: number
}
