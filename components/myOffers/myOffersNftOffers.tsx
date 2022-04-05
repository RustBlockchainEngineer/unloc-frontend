import React, { useEffect } from 'react'

interface MyOffersNftOfferProps {
  offerAmount: any
  classNames?: string
}

export const MyOffersNftOffer: React.FC<MyOffersNftOfferProps> = ({ offerAmount, classNames }) => {
  return (
    <div className={`my-offers-nft__offer ${classNames ? classNames : ''}`}>
      <h4>Amount: {offerAmount.toNumber() / 1000000}</h4>
    </div>
  )
}
