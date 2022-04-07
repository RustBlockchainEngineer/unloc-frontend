import React from 'react'
import { BN } from '@project-serum/anchor'
import { compressAddress } from '../../../utils/stringUtils/compressAdress'

interface MyOffersNftOfferItemProps {
  offerAmount: any
  offerID: string
  status: string
  APR: string
  duration: BN
  repaid: string
  classNames?: string
}

export const MyOffersNftOfferItem: React.FC<MyOffersNftOfferItemProps> = ({
  offerAmount,
  offerID,
  status,
  APR,
  duration,
  repaid,
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
    </div>
  )
}
