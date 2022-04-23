import React, { useState } from 'react'
import { IsubOfferData } from '@stores/Lightbox.store'

import { MyOffersNftOfferItem } from './myOffersNftOfferItem'
import { currencyMints } from '@constants/currency'

interface myOffersNftItemOffersProps {
  handleOfferEdit: (subOfferKey: string, values: IsubOfferData) => Promise<void>
  handleOfferCancel: (subOfferKey: string) => Promise<void>
  status: number
  data?: any[]
  nftMint: string
}

export const MyOffersNftItemOffers: React.FC<myOffersNftItemOffersProps> = ({
  handleOfferEdit,
  handleOfferCancel,
  status,
  data,
  nftMint
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

  const getAmountSentence = (amount: { toNumber: () => number }, mint: { toBase58: () => string | number }) => {
    return (
      <span>
        You owe {amount.toNumber() / 1000000} {currencyMints[mint.toBase58()]}
      </span>
    )
  }

  const handleTimeLeft = (duration: number, startTime: number) => {
    let output = ''
    let state = 'late'

    const currentDate = new Date()
    const startDate = new Date(startTime)

    const numberOfDays = Math.ceil(((startDate as any) - (currentDate as any)) / 8.64e7)

    const daysLeft = duration - numberOfDays * -1

    if (daysLeft > 0) {
      output = `${daysLeft} Day(s)`
      state = 'awaiting'
    } else {
      output = `${daysLeft * -1} Day(s) late!`
      state = 'late'
    }

    return { output, state }
  }

  const getDurationSentence = (output: {} | null | undefined, state: string | undefined) => {
    if (state === 'awaiting') {
      return <span>and you have {output} left</span>
    } else {
      return <span>and you are {output}</span>
    }
  }

  const getInfoSentence = () => {
    if (data && data.length) {
      const activeOffer: any = data.filter((obj) => {
        return obj.state === 1
      })

      if (activeOffer && activeOffer[0]) {
        const loanTime = handleTimeLeft(
          activeOffer[0].loanDuration.toNumber() / 60 / 60 / 24,
          activeOffer[0].loanStartedTime.toNumber() * 1000
        )

        return (
          <div className={`active-loan-info ${loanTime.state === 'late' ? 'loan--late' : 'loan--active'}`}>
            {getAmountSentence(activeOffer[0].offerAmount, activeOffer[0].offerMint)}
            {getDurationSentence(loanTime.output, loanTime.state)}
          </div>
        )
      }
    }
  }

  const renderHeadBar = () => {
    if (status === 1) {
      console.log(data)
      return (
        <div className='offers-list-headbar offers-list-headbar--active'>
          <h4>Loan active</h4>
          <div className='active-loan-info'>{getInfoSentence()}</div>
        </div>
      )
    }
    if (data && data.length && getOffersCount() > 0) {
      return (
        <div className='offers-list-headbar' onClick={() => setContentVisible(!contentVisible)} >
          {/* Offers ({getOffersCount()}) */}
        </div>
      )
    }

    // return <div className='offers-list-headbar'>No offers created for this collateral</div>
    return <></>
  }

  return (
    (data && data.length <= 0) ? <></> :
      <div className='offers-list' onClick={() => { if (data && data.length && getOffersCount() > 0) { setContentVisible(!contentVisible) } }}>
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
                    nftMint={nftMint}
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
