import Link from 'next/link'
import React from 'react'

interface IProps {
  visible: boolean
  apr: number
  name: string
  totalRepay: any
  amount: number
  onLend: (Pubkey: string) => Promise<void>
  offerPublicKey: string
  duration: number
  currency: string
  subOfferKey: string
  count?: number
  collection: string
  isYours: boolean
}

const OffersGridItemHover: React.FC<IProps> = ({
  visible,
  apr,
  name,
  amount,
  onLend,
  duration,
  offerPublicKey,
  currency,
  subOfferKey,
  count,
  collection,
  isYours
}) => {
  return (
    <div className={`onHover-data ${visible ? '' : 'hide'}`}>
      <Link href={`/offers/${subOfferKey}`}>
        <div className='onHover-link'>
          <div className='data-item'>
            <span className='item-name'>{name}</span>
            {count ? (
              <div className=''>
                <span className='label'>Offers</span>
                <span className='content'>{count}</span>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className='data-item'>
            <span className='label'>APR</span>
            <span className='content'>{apr} %</span>
          </div>
          <div className='data-item'>
            <span className='label'>Amount</span>
            <span className='content'>
              {amount} {currency}
            </span>
          </div>
          <div className='data-item'>
            <span className='label'>Duration</span>
            <span className='content'>{duration} Days</span>
          </div>
          <div className='data-item'>
            <span className='label'>Collection</span>
            <span className='content'>{collection}</span>
          </div>
        </div>
      </Link>
      <button className={isYours ? 'deactivated' : ''} onClick={() => { if (!isYours) { onLend(offerPublicKey) } }}>{isYours ? 'Can\'t Lend' : 'Lend Token'}</button>
    </div>
  )
}

export default OffersGridItemHover
