import React from 'react'

import { ShowOnHover } from '../../layout/showOnHover'
import { ClipboardButton } from '../../layout/clipboardButton'
import { SolscanExplorerIcon } from '../../layout/solscanExplorerIcon'

type IProps = {
  offerID: string
  offerMint: string
  status: string
  amount: string
  token: string
  duration: string
  durationRemaning?: string
  APR: number
  totalRepay: string
  btnMessage: string
  handleAcceptOffer: (offerPublicKey: string) => void
  offerPublicKey: string
}

export const Offer: React.FC<IProps> = ({
  offerID,
  offerMint,
  status,
  amount,
  token,
  duration,
  durationRemaning,
  APR,
  totalRepay,
  btnMessage,
  handleAcceptOffer,
  offerPublicKey
}) => {
  return (
    <div className='offer-root'>
      <div className='offer-container'>
        <div className='offer-header'>
          <div className='offer-ID'>
            <p>Offer ID</p>
            <ShowOnHover label={`#${offerID}`}>
              <ClipboardButton data={offerID} />
              <SolscanExplorerIcon type={'account'} address={offerID} />
            </ShowOnHover>
          </div>
          <div className='offer-status'>
            <p>Status</p>
            <p>{status}</p>
          </div>
        </div>
        <div className='offer-info'>
          <div className='info-item'>
            <div className='item-box'>
              <p>Amount</p>
              <p>
                {amount} {token}
              </p>
            </div>
            <div className='item-box'>
              <p>APR</p>
              <p>{APR} %</p>
            </div>
          </div>
          <div className='info-item'>
            <div className='item-box'>
              <p>Duration</p>
              <p>
                {duration} days {durationRemaning ? `${durationRemaning} days left` : ''}
              </p>
            </div>
            <div className='item-box'>
              <p>Total repay amount</p>
              <p>
                {totalRepay} {token}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='offer-lend'>
        <button className='lend-btn' onClick={() => handleAcceptOffer(offerPublicKey)}>
          {btnMessage}
        </button>
      </div>
    </div>
  )
}
