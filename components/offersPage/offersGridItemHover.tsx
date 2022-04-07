import { observer } from 'mobx-react'
import Link from 'next/link'
import React, { useContext } from 'react'
import { toast } from 'react-toastify'
import { StoreContext } from '../../pages/_app'

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
}

const OffersGridItemHover: React.FC<IProps> = ({
  visible,
  apr,
  name,
  totalRepay,
  amount,
  onLend,
  duration,
  offerPublicKey,
  currency,
  subOfferKey,
  count
}) => {
  return (
    <div style={{ opacity: `${visible ? 1 : 0}` }} className='onHover-data'>
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
            <span className='label'>total repay amount</span>
            <span className='content'>{totalRepay}</span>
          </div>
        </div>
      </Link>
      <button onClick={() => onLend(offerPublicKey)}>Lend</button>
    </div>
  )
}

export default OffersGridItemHover
