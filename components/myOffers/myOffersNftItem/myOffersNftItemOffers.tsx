import React, { useState } from 'react'

import { MyOffersNftOfferItem } from './myOffersNftOfferItem'

interface myOffersNftItemOffersProps {
  handleOfferEdit: () => any
  handleOfferCancel: () => any
  data?: any[]
}

export const MyOffersNftItemOffers: React.FC<myOffersNftItemOffersProps> = ({
  handleOfferEdit,
  handleOfferCancel,
  data
}) => {
  const [contentVisible, setContentVisible] = useState(false)

  const renderHeadBar = () => {
    if (data && data.length) {
      return (
        <div className='offers-list-headbar' onClick={() => setContentVisible(!contentVisible)}>
          Offers ({data.length})
        </div>
      )
    }

    return <div className='offers-list-headbar'>No offers created for this collateral</div>
  }

  return (
    <div className='offers-list'>
      {renderHeadBar()}
      {data && data.length && contentVisible ? (
        <div className='offers-list-content'>
          {data.map((offer) => (
            <MyOffersNftOfferItem
              key={offer.subOfferKey.toBase58()}
              offerAmount={offer.offerAmount}
              APR={offer.aprNumerator}
              status={offer.state}
              offerID={offer.subOfferKey}
              duration={offer.loanDuration}
              repaid={offer.minRepaidNumerator}
            />
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
