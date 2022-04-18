import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '@pages/_app'
import { currencyMints } from '@constants/currency'
import { ShowOnHover } from '@components/layout/showOnHover'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'react-toastify'

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

  const canClaim = (duration: number, startTime: number) => {
    let output = false

    const currentDate = new Date()
    const startDate = new Date(startTime)

    const numberOfDays = Math.ceil(((startDate as any) - (currentDate as any)) / 8.64e7)

    const daysLeft = duration - numberOfDays * -1

    if (daysLeft > 0) {
      output = false
    } else {
      output = true
    }

    return output
  }

  const handleClaimCollateral = async (offerKey: PublicKey) => {
    store.Lightbox.setContent('processing')
    store.Lightbox.setCanClose(false)
    store.Lightbox.setVisible(true)

    try {
      await store.MyOffers.handleClaimCollateral(offerKey)
      toast.success(`NFT Claimed`, {
        autoClose: 3000,
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(false)
    } catch (e: any) {
      console.log(e)
      if (e.message === 'User rejected the request.') {
        toast.error(`Transaction rejected`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
      } else {
        toast.error(`Something went wrong`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
      }
    } finally {
      store.MyOffers.refetchStoreData()
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(false)
    }
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
          {canClaim(offer.loanDuration.toNumber() / 60 / 60 / 24, offer.loanStartedTime.toNumber() * 1000) ? (
            <div className='lined-info'>
              <button className='btn btn--md btn--primary' onClick={() => handleClaimCollateral(offer.offer)}>
                Claim NFT
              </button>
            </div>
          ) : (
            <></>
          )}
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
