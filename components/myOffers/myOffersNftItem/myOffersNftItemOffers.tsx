import React, { useEffect, useState } from 'react'
import { IsubOfferData } from '../../../stores/Lightbox.store'

import { MyOffersNftOfferItem } from './myOffersNftOfferItem'

interface myOffersNftItemOffersProps {
  handleOfferEdit: (subOfferKey: string, values: IsubOfferData) => Promise<void>
  handleOfferCancel: (subOfferKey: string) => Promise<void>
  data?: any[]
}

export const MyOffersNftItemOffers: React.FC<myOffersNftItemOffersProps> = ({
  handleOfferEdit,
  handleOfferCancel,
  data
}) => {
  const [contentVisible, setContentVisible] = useState(false)

  const getOffersCount = () => {
    let counter = 0
    data?.forEach((offer) => {
      if (offer.state === 0) {
        counter++
      }
    })
    return counter
  }

  const renderHeadBar = () => {
    if (data && data.length && getOffersCount() > 0) {
      return (
        <div className='offers-list-headbar' onClick={() => setContentVisible(!contentVisible)}>
          Offers ({getOffersCount()})
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
          {data.map((offer) => {
            if (offer.state === 0) {
              return (
                <MyOffersNftOfferItem
                  key={offer.subOfferKey.toBase58()}
                  offerAmount={offer.offerAmount}
                  APR={offer.aprNumerator}
                  status={offer.state}
                  offerID={offer.subOfferKey}
                  duration={offer.loanDuration}
                  repaid={offer.minRepaidNumerator}
                  offerMint={offer.offerMint}
                  handleOfferEdit={handleOfferEdit}
                  handleOfferCancel={handleOfferCancel}
                />
              )
            }
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
