import React, { useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OffersTableItemInterface {
  subOfferKey: string
  image: string
  nftName: string
  apr: number
  amount: string
  duration: number
  currency: string
  onLend: (pubkey: string) => Promise<void>
  offerPublicKey: string
  count?: number
  isYours: boolean
}

export const OffersTableRow = ({
  subOfferKey,
  image,
  nftName,
  apr,
  onLend,
  offerPublicKey,
  amount,
  duration,
  currency,
  count,
  isYours
}: OffersTableItemInterface) => {
  const handlePrevent = useCallback((e: React.FormEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    onLend(offerPublicKey)
  }, [offerPublicKey, onLend])
  return (
    <div className='offers-table-row' key={subOfferKey}>
      <Link href={`/offers/${subOfferKey}`}>
        <a>
          <div className='row-cell'>
            {isYours ? (<div className='owner-indicator'><i className='icon icon--owner' /></div>) : ''}
            {image ? <Image src={image} alt='NFT Picture' width={36} height={36} /> : ''}
            <span className='text-content'>{nftName}</span>
          </div>
          <div className='row-cell'>
            <button className={isYours ? 'deactivated' : ''} onClick={(e) => { if (!isYours) { handlePrevent(e) } }}>{isYours ? 'Can\'t lend' : `Lend ${currency}`}</button>
          </div>
          <div className='row-cell'>
            <span className='text-content'>
              {amount}
            </span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>
              <i className={`icon icon--sm icon--currency--${currency}`}></i>
            </span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>{apr} %</span>
          </div>
          <div className='row-cell'>
            <span className='text-content'>{duration} Days</span>
          </div>
        </a>
      </Link>
    </div>
  )
}
