import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OffersGridItemInterface {
  subOfferKey: string
  image: string
  apr: number
  amount: number
  duration: number
  currency: string
  count?: number
}

export const OffersGridItem = ({
  subOfferKey,
  image,
  apr,
  amount,
  duration,
  currency,
  count
}: OffersGridItemInterface) => {
  return (
    <div className='offers-grid-item' key={subOfferKey}>
      <Link href={`/offers/${subOfferKey}`}>
        <a>
          <div className='hover-data'>
            <div className='hover-data-item'>
              <span className='label'>APR</span>
              <span className='content'>{apr} %</span>
            </div>
            <div className='hover-data-item'>
              <span className='label'>Amount</span>
              <span className='content'>
                {amount} {currency}
              </span>
            </div>
            <div className='hover-data-item'>
              <span className='label'>Duration</span>
              <span className='content'>{duration} Days</span>
            </div>
            {count ? (
              <div className='hover-data-item'>
                <span className='label'>Offers</span>
                <span className='content'>{count}</span>
              </div>
            ) : (
              <></>
            )}
          </div>
          {image ? <Image src={image} alt='NFT Picture' width={500} height={500} /> : ''}
        </a>
      </Link>
    </div>
  )
}
