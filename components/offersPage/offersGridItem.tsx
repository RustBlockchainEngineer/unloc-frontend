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
  const rangeSheetsCount = (sheetCount: number) => {
    if (sheetCount > 8) {
      return 'high'
    }
    if (sheetCount > 5) {
      return 'mid'
    }
    if (sheetCount > 2) {
      return 'low'
    }

    return 'none'
  }

  const getSheets = (count: number) => {
    let tick = 0
    if (count) {
      ;[...Array(count)].forEach((page, index) => {
        tick++
      })

      return ` grid-sheet-${rangeSheetsCount(tick)}`
    }
    return 'grid-sheet-none'
  }

  return (
    <div className={`offers-grid-item ${count ? getSheets(count) : ''}`} key={subOfferKey}>
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
          {image ? <Image src={image} alt='NFT Picture' layout='fill' /> : ''}
        </a>
      </Link>
    </div>
  )
}
