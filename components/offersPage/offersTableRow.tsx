import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OffersTableItemInterface {
  subOfferKey: string
  image: string
  nftName: string
  apr: number
  amount: number
  duration: number
  currency: string
}

export const OffersTableRow = ({
  subOfferKey,
  image,
  nftName,
  apr,
  amount,
  duration,
  currency
}: OffersTableItemInterface) => {
  return (
    <div className='offers-table-row' key={subOfferKey}>
      <Link href={`/offers/${subOfferKey}`}>
        <a>
          <div className='row-cell'>
            {image ? <Image src={image} alt='NFT Picture' width={36} height={36} /> : ''}
            <span className='text-content'>{nftName}</span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>{apr} %</span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>
              {amount} {currency}
            </span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>{duration} Days</span>
          </div>
        </a>
      </Link>
    </div>
  )
}
