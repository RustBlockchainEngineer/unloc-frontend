import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '@pages/_app'
import { currencyMints } from '@constants/currency'
import { ShowOnHover } from '@components/layout/showOnHover'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { compressAddress } from '@utils/stringUtils/compressAdress'
import { getDecimalsForLoanAmountAsString } from '@integration/getDecimalForLoanAmount'
import { BlobLoader } from '@components/layout/blobLoader'

export const MyLendingList = observer(() => {
  const store = useContext(StoreContext)
  const { lendingList } = store.MyOffers
  const [isFetchingUserLended, setIsFetchingUserLended] = useState(true)

  const handleTimeLeft = (duration: number, startTime: number, formated: boolean) => {
    let output: string | number
    const currentDate = new Date()
    const startDate = new Date(startTime)
    const numberOfDays = Math.ceil(((startDate as any) - (currentDate as any)) / 8.64e7)
    const daysLeft = duration - numberOfDays * -1

    if (daysLeft > 0 && formated) {
      return `${daysLeft} Day(s)`
    } else if (formated) {
      return `${daysLeft * -1} Day(s) late!`
    }

    return daysLeft
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
      } else if ((e as Error).message.includes('503 Service Unavailable')) {
        toast.error('Solana RPC currently unavailable, please try again in a moment', {
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

  const setStatus = (status: string) => {
    if (status === '1') {
      return <p className={'loan-containers__status'}>Loan Offer Given</p>
    }
  }

  const renderLoansGiven = () => {
    return lendingList.map((offer) => {
      const daysDuration = offer.loanDuration.toNumber() / 60 / 60 / 24
      //const daysDuration = 0 //css testing
      const timeClassNames = `${daysDuration <= 0 ? 'red' : ''}${daysDuration > 0 && daysDuration <= 3 ? 'yellow' : ''}${daysDuration > 3 ? 'green' : ''}`

      return (
        <div key={offer.nftData.arweaveMetadata.name} className={`loan-given ${timeClassNames}`}>

          <div className='loan__row'>
            <div className={`loan__row--item header`} >
              <Image src={offer.nftData.arweaveMetadata.image} alt='NFT Picture' width={50} height={50} />
              <div className={`item__title`}>
                <div className='name'> {offer.nftData.arweaveMetadata.name}</div>
                <div className='collection'> Collection: <b>{offer.nftData.arweaveMetadata.description}</b></div>
              </div>
            </div>

            <div className={`loan__row--item loan-time ${timeClassNames}`} >
              <span>  Time left  </span>
              <p className='loan-time--left'>{handleTimeLeft(daysDuration, offer.loanStartedTime.toNumber() * 1000, true)}</p>
            </div>

          </div>

          <div className='loan__row'>
            <div className='loan__row--item'>
              <h4>Borrower ID</h4>
              <ShowOnHover label={compressAddress(4, offer.borrower.toBase58())} classNames='loan-containers__id'>
                <ClipboardButton data={offer.borrower} />
                <SolscanExplorerIcon type={'token'} address={offer.borrower} />
              </ShowOnHover>
            </div>
            <div className={`loan__row--item ${timeClassNames} status`}>
              <h4>Status</h4>
              {setStatus(offer.state.toString())}
            </div>
            <div className='loan__row--item'>
              <h4>NFT Mint</h4>
              <ShowOnHover label={compressAddress(4, offer.nftMint.toString())} classNames='loan-containers__mint'>
                <ClipboardButton data={offer.nftMint} />
                <SolscanExplorerIcon type={'token'} address={offer.nftMint} />
              </ShowOnHover>
            </div>
          </div>

          <div className='loan__row details'>
            <div className='loan__row--item'>
              <h4>Amount</h4>
              <p>{`${getDecimalsForLoanAmountAsString(offer.offerAmount.toNumber(), offer.offerMint.toBase58(), 0)} ${currencyMints[offer.offerMint.toBase58()]}`}</p>
            </div>

            <div className='loan__row--item'>
              <h4>APR</h4>
              <p>{offer.aprNumerator.toString()}%</p>
            </div>

            {/* <div className='loan__row--item'>
              <h4>Min repaid value</h4>
              <p>{offer.minRepaidNumerator.toString()}</p>
            </div> */}
          </div>

          {canClaim(offer.loanDuration.toNumber() / 60 / 60 / 24, offer.loanStartedTime.toNumber() * 1000) ? (
            <div className='loan__row'>
              <button className='btn btn--md btn--primary claim-nft--button' onClick={() => handleClaimCollateral(offer.subOfferKey)}>
                Claim NFT
              </button>
            </div>
          ) : (
            <div className='loan__row'>
              <button className='btn btn--md btn--primary disabled loan-not-repaid-button'>
                Loan not Repaid yet
              </button>
            </div>
          )}
        </div>
      )
    })
  }

  useEffect(() => {
    const fetchUserLended = async () => {
    if (store.Wallet.connected && store.Wallet.wallet) {
        setIsFetchingUserLended(true)
        await store.MyOffers.fetchUserLendedOffers()
        setIsFetchingUserLended(false)
    }
    }
    fetchUserLended()
  }, [store.Wallet.connected, store.Wallet.wallet])

  if (isFetchingUserLended) {
    return (
      <div className='my-lending-nft-list-loading'>
        <BlobLoader />
      </div>
    )
  }

  return lendingList && lendingList.length ? (
    <div className='my-lending-nft-list'>
      <h1>Loans given</h1>
      <div className='my-lending-nft-list__inner'>{lendingList && lendingList.length ? renderLoansGiven() : <></>}</div>
    </div>
  ) : (
    <div className='my-lending-nft-list empty'>
      <h1>No loans given yet</h1>
    </div>
  )
})
