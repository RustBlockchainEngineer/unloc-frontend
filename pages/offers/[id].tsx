import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'react-toastify'
import { LayoutTop } from '@components/layout/layoutTop'
import { Header } from '@components/singleOffer/Header/Header'
import { Offer } from '@components/singleOffer/Offer/Offer'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { getQueryParamAsString } from '@utils/getQueryParamsAsString'
import { StoreContext } from '@pages/_app'
import { BlobLoader } from '@components/layout/blobLoader'
import Footer from '@components/layout/footer'
import { currencyMints } from '@constants/currency'

interface IOffer {
  amount: string
  apr: number
  currency: string
  duration: number
  id: string
  offerMint: string
  publicKey: PublicKey
  status: number
  totalRepay?: any
}

const SingleNftPage: NextPage = observer(({ }) => {
  const router = useRouter()
  const store = useContext(StoreContext)

  const { connected, wallet } = store.Wallet
  const { nftData, loansData, isYours } = store.SingleOffer
  const [hasActive, setHasActive] = useState(false)

  console.log(nftData)
  const handleData = async () => {
    try {
      if (connected && wallet && router.query.id) {
        await store.SingleOffer.fetchNft(getQueryParamAsString(router.query.id))
        await store.SingleOffer.fetchSubOffers(getQueryParamAsString(router.query.id))
        await store.SingleOffer.getOffersByWallet()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  const handleConfirmOffer = async (offer: any) => {
    try {
      store.Lightbox.setLendConfirmationData(offer)
      store.Lightbox.setContent('lendConfirmation')
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(true)
    } catch (e) {
      console.log(e)
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
  }

  useEffect(() => {
    handleData()
  }, [router.query.id, connected, wallet])

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      store.SingleOffer.setNftData({
        collection: '',
        mint: '',
        image: '',
        name: '',
        external_url: ''
      })
      store.SingleOffer.setLoansData([])
      store.Offers.clearFilters()
    })
  }, [router.events, store.SingleOffer])

  useEffect(() => {
    if (loansData && loansData.length) {
      loansData.forEach((loan) => {
        if (loan.status === 1) {
          setHasActive(true)
        }
      })
    }
  }, [loansData])

  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        {nftData ? (
          <Header
            collectionName={nftData.collection}
            nftAddress={nftData.mint}
            nftImage={nftData.image}
            nftName={nftData.name}
            website={nftData.external_url}
            isYours={isYours}
          />
        ) : (
          <></>
        )}
        {hasActive ? (
          <h2 className='single-offer-active'>Loan Active, can&apos;t claim any offers right now</h2>
        ) : loansData && loansData.length ? (
          <div className='offer-grid'>
            {loansData.map((offer: IOffer) => {
              if (offer.status === 0) {
                return (
                  <Offer
                    key={offer.id}
                    offerID={offer.id}
                    offerMint={offer.offerMint}
                    offerPublicKey={offer.publicKey.toBase58()}
                    status={offer.status.toString()}
                    amount={offer.amount}
                    token={currencyMints[offer.offerMint.toString()]}
                    duration={offer.duration.toString()}
                    // durationRemaning='20' // TODO: include date of offer creation in Program data
                    APR={offer.apr}
                    totalRepay={offer.totalRepay}
                    btnMessage={'Lend Tokens'}
                    handleConfirmOffer={handleConfirmOffer}
                    isYours={isYours}
                  />
                )
              } else {
                return <></>
              }
            })}
          </div>
        ) : (
          <div className='offer-grid-empty'>
            <BlobLoader />
          </div>
        )}
        <Footer />
      </div>
      <div className='home-bg-bottom' />
    </StoreDataAdapter>
  )
})

export default SingleNftPage
