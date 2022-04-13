import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '@pages/_app'
import { currencyMints } from '@constants/currency'
import { ShowOnHover } from '@components/layout/showOnHover'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'

export const MyLendingList = observer(() => {
  const store = useContext(StoreContext)
  const { lendingList } = store.MyOffers

  const handleTimeLeft = (duration: number, startTime: number) => {
    let output = ''

    const currentDate = new Date()
    const startDate = new Date(startTime)

    const numberOfDays = Math.ceil(((startDate as any) - (currentDate as any)) / 8.64e7)

    const daysLeft = duration - numberOfDays * -1

    if (daysLeft > 0) {
      output = `${daysLeft} Day(s)`
    } else {
      output = `${daysLeft * -1} Day(s) late!`
    }

    return output
  }

  const renderLoansGiven = () => {
    return lendingList.map((offer) => {
      return (
        <div key={offer.offer.toBase58()} className='loan-given'>
          <div className='lined-info'>
            <div className='info-title'>Borrower</div>
            <div className='info-content'>
              <ShowOnHover label={`#${offer.borrower.toBase58()}`}>
                <ClipboardButton data={offer.borrower.toBase58()} />
                <SolscanExplorerIcon type={'account'} address={offer.borrower.toBase58()} />
              </ShowOnHover>
            </div>
          </div>
          <div className='lined-info'>
            <div className='info-title'>Amount</div>
            <div className='info-content'>
              {offer.offerAmount.toNumber() / 1000000}
              {currencyMints[offer.offerMint.toBase58()]}
            </div>
          </div>
          <div className='lined-info'>
            <div className='info-title'>Duration</div>
            <div className='info-content'>{offer.loanDuration.toNumber() / 60 / 60 / 24} Day(s)</div>
          </div>
          <div className='lined-info'>
            <div className='info-title'>Time left</div>
            <div className='info-content'>
              {handleTimeLeft(offer.loanDuration.toNumber() / 60 / 60 / 24, offer.loanStartedTime.toNumber() * 1000)}
            </div>
          </div>
        </div>
      )
    })
  }

  useEffect(() => {
    if (store.Wallet.connected && store.Wallet.wallet) {
      store.MyOffers.fetchUserLendedOffers()
    }
  }, [store.Wallet.connected, store.Wallet.wallet])

  return lendingList && lendingList.length ? (
    <div className='my-lending-nft-list'>
      <h1>Loans given</h1>
      <div className='my-lending-nft-list__inner'>{lendingList && lendingList.length ? renderLoansGiven() : <></>}</div>
    </div>
  ) : (
    <></>
  )
})
