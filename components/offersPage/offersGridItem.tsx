import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OffersGridItemInterface {
  subOfferKey: string
  image: string
}

export const OffersGridItem = ({ subOfferKey, image }: OffersGridItemInterface) => {
  return (
    <div className='offers-grid-item' key={subOfferKey}>
      <Link href={`/offers/${subOfferKey}`}>
        <a>
          <div className='hover-data'></div>
          {image ? <Image src={image} alt='NFT Picture' width={500} height={500} /> : ''}
        </a>
      </Link>
    </div>
  )
}
