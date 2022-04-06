import React from 'react'
import { BN } from '@project-serum/anchor'
import { compressAddress } from '../../utils/stringUtils/compressAdress'
import { setOfferStatus } from '../../utils/stringUtils/offerStatusEnum'

interface MyOffersNftOfferProps {
  offerAmount: any
  offerID: string
  status: string
  APR: string
  duration: BN
  repaid: string
  classNames?: string
}

const setStatus = (status: string) => {
  if (status === '0') {
    return <p style={{ color: 'orange' }}>Proposed</p>
  }
  if (status === '1') {
    return <p style={{ color: 'green' }}>Active</p>
  }
}

export const MyOffersNftOffer: React.FC<MyOffersNftOfferProps> = ({
  offerAmount,
  offerID,
  status,
  APR,
  duration,
  repaid,
  classNames
}) => {
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
