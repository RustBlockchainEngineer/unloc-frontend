import React, { useState } from 'react'
import OffersGridItemHover from './offersGridItemHover'
import Image from 'next/image'
import Link from 'next/link'

interface OffersGridItemInterface {
  subOfferKey: string
  image: string
  apr: number
  offerPublicKey: string
  name: string
  onLend: (pubkey: string) => Promise<void>
  totalRepay: any
  amount: number
  duration: number
  currency: string
  count?: number
  collection: string
  isYours: boolean
}

export const OffersGridItem = ({
  subOfferKey,
  image,
  apr,
  offerPublicKey,
  name,
  onLend,
  totalRepay,
  amount,
  duration,
  currency,
  count,
  collection,
  isYours
}: OffersGridItemInterface) => {
  const [hover, setHover] = useState<boolean>(false)
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
    <div
      className={`offers-grid-item ${getSheets(count !== undefined ? count : 0)}`}
      key={subOfferKey}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {isYours ? (<div className='owner-indicator'><i className='icon icon--owner' /></div>) : ''}
      <OffersGridItemHover
        visible={hover}
        apr={apr}
        name={name}
        totalRepay={totalRepay}
        amount={amount}
        onLend={onLend}
        offerPublicKey={offerPublicKey}
        duration={duration}
        currency={currency}
        subOfferKey={subOfferKey}
        count={count}
        collection={collection}
      />
      <Link href={`/offers/${subOfferKey}`}>
        <a>
          <div className='hover-data' style={{ visibility: `${hover ? 'hidden' : 'visible'}` }}>
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
