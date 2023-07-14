'use client'

import Image from 'next/image'

const BOOK_WITH_HOTEL_PROVIDER_CODES = new Set([
  'boo',
  'fsb',
  'tck',
  'dys',
  'fbd',
  'mir',
  'mhs',
  'noz',
  'pho',
  'sab'
])

const BOFH_PROVIDER_CODES = new Set([
  'fht',
  'gar',
  'hbd',
  'ean',
  'eps',
  'ppn',
  'wbd',
  'smr',
  'btl',
  'fph',
  'nte',
  'wtm',
  'oly',
  'htr'
])

const VIO_PROVIDER_CODE = 'vio'

interface ProviderLogoProps {
  providerCode: string
}

function isBookWithHotelProvider(providerCode = '') {
  return BOOK_WITH_HOTEL_PROVIDER_CODES.has(providerCode)
}

export function ProviderLogo({providerCode}: ProviderLogoProps) {
  const lowerCaseCode = providerCode.toLowerCase()
  const isBookWithHotel = isBookWithHotelProvider(lowerCaseCode)

  const code = BOFH_PROVIDER_CODES.has(lowerCaseCode)
    ? VIO_PROVIDER_CODE
    : lowerCaseCode.toLowerCase()

  const src = process.env.NEXT_PUBLIC_PROVIDER_LOGO_PREFIX + `/svg/${code}.svg`

  if (isBookWithHotel) {
    return <div className="text-xs font-bold">Book with hotel</div>
  }

  return (
    <Image
      src={src}
      alt={`${providerCode}-logo`}
      className="object-cover"
      width={77}
      height={20}
      unoptimized
    />
  )
}
