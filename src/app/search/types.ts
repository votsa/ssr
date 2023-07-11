export interface UserRequestParams {
  placeId: string
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

export interface Offer {
  id: string
  providerCode: string
  currency: string
  url: string
  rate: {
    base: number
  }
}

export interface OfferEntity {
  id: string
  offers: Offer[]
}

export interface Hotel {
  objectID: string
  hotelName: string
  placeDisplayName: string
  imageURIs: string[]
}
