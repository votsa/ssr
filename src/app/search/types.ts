export interface SearchParams {
  placeId: string
  checkIn: string
  checkOut: string
  rooms: string
  offset?: number
  pageSize?: number
  facilities?: number | number[]
  useOffers: string
  searchId?: string
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
