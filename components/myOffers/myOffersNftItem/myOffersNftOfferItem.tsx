import React, { useEffect } from 'react'
import { BN } from '@project-serum/anchor'
import { compressAddress } from '../../../utils/stringUtils/compressAdress'
import { PublicKey } from '@solana/web3.js'

interface MyOffersNftOfferItemProps {
  offerAmount: any
  offerID: PublicKey
  status: string
  APR: string
  duration: BN
  repaid: string
  handleOfferEdit: (subOfferKey: string) => Promise<void>
  handleOfferCancel: (subOfferKey: string) => Promise<void>
  classNames?: string
}

export const MyOffersNftOfferItem: React.FC<MyOffersNftOfferItemProps> = ({
  offerAmount,
  offerID,
  status,
  APR,
  duration,
  repaid,
  handleOfferEdit,
  handleOfferCancel,
  classNames
}) => {
  const setStatus = (status: string) => {
    if (status === '0' || status === '6') {
      return <p style={{ color: 'green' }}>Proposed</p>
    }
    if (status === '1') {
      return <p style={{ color: 'orange' }}>Active</p>
    }
  }

  return (
    <div className={`my-offers-nft__offer ${classNames ? classNames : ''}`}>
      <div className='nft__offer-item'>
        <h4>Offer ID: </h4>
        <p>{compressAddress(4, offerID.toString())}</p>
      </div>
      <div className='nft__offer-item'>
        <h4>Status: </h4>
        {setStatus(status.toString())}
      </div>
      <div className='nft__offer-item'>
        <h4>Amount: </h4>
        <p>{offerAmount.toNumber() / 1000000} USDC</p>
      </div>

      <div className='nft__offer-item'>
        <h4>APR: </h4>
        <p>{APR.toString()}%</p>
      </div>
      <div className='nft__offer-item'>
        <h4>Duration: </h4>
        <p>{Number(duration.toString()) / 60 / 60 / 24} DAYS</p>
      </div>
      <div className='nft__offer-item'>
        <h4>Min repaid value: </h4>
        <p>{repaid.toString()}</p>
      </div>
      <div className='nft__offer-item'>
        <button className='btn btn--md btn--primary' onClick={() => handleOfferEdit(offerID.toBase58())}>
          Edit Offer
        </button>
        <button className='btn btn--md btn--bordered' onClick={() => handleOfferCancel(offerID.toBase58())}>
          Cancel Offer
        </button>
      </div>
    </div>
  )
}
