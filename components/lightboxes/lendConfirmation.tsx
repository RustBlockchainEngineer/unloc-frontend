import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import Image from 'next/image'
import { toast } from 'react-toastify'

import { StoreContext } from '@pages/_app'

export const LendConfirmation = observer(() => {
  const store = useContext(StoreContext)
  const { lendConfirmationData } = store.Lightbox
  const { nftData } = store.SingleOffer
  const { amount, duration, APR, totalRepay, currency, offerPublicKey } = lendConfirmationData

  const handleAcceptOffer = async (offerPublicKey: string) => {
    try {
      store.Lightbox.setContent('processing')
      store.Lightbox.setCanClose(false)
      store.Lightbox.setVisible(true)
      await store.Offers.handleAcceptOffer(offerPublicKey)
      toast.success(`Loan Accepted`, {
        autoClose: 3000,
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
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
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(false)
    }
  }

  return (
    <div className='lend-confirmation'>
      <h2>Lend Funds</h2>
      <div className='collateral'>
        <div className='label'>Collateral:</div>
        <div className='nft-pill'>
          <div className='nft-image-circled'>
            <Image alt='NFT Image' src={nftData.image} width={38} height={38} />
          </div>
          <div className='nft-name'>{nftData.name}</div>
        </div>
      </div>
      <div className='offer-data'>
        <div className='offer-data-top'>Your terms:</div>
        <div className='offer-data-liner'>
          <div className='title'>Amount</div>
          <div className='data'>
            {amount} {currency}
          </div>
        </div>
        <div className='offer-data-liner'>
          <div className='title'>APR</div>
          <div className='data'>{APR}</div>
        </div>
        <div className='offer-data-liner'>
          <div className='title'>Duration</div>
          <div className='data'>{duration}</div>
        </div>
        <div className='offer-data-liner'>
          <div className='title'>Total Repay Amount </div>
          <div className='data'>
            {totalRepay} {currency}
          </div>
        </div>
      </div>
      <button className='btn btn--md btn--primary' onClick={() => handleAcceptOffer(offerPublicKey)}>
        Confirm
      </button>
    </div>
  )
})
