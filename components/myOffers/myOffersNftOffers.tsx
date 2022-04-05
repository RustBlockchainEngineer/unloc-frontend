import React, { useEffect } from 'react'

interface MyOffersNftOfferProps {
  offerAmount: any
  publicKey: string
  handleRepayLoan: (subOfferKey: string) => void
  classNames?: string
}

export const MyOffersNftOffer: React.FC<MyOffersNftOfferProps> = ({
  offerAmount,
  publicKey,
  handleRepayLoan,
  classNames
}) => {
  return (
    <div className={`my-offers-nft__offer ${classNames ? classNames : ''}`} onClick={() => handleRepayLoan(publicKey)}>
      <h4>Amount: {offerAmount.toNumber() / 1000000}</h4>
    </div>
  )
}
