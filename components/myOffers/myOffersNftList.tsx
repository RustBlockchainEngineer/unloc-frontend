import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'
import { toast } from 'react-toastify'

import { StoreContext } from '../../pages/_app'
import { MyOffersNftItem } from './myOffersNftItem/myOffersNftItem'

export const MyOffersNftList: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { offers, nftData, subOffers } = store.MyOffers
  const [reveal, setReveal] = useState<string>('')

  const onReveal = (key: string) => {
    if (key === reveal) {
      setReveal('')
      return
    }
    setReveal(key)
  }
  const handleCreateSubOffer = (nftMint: string): void => {
    // store.MyOffers.handleCreateSubOffer(nftMint) // needed for editing Loan
  }

  const handleRepayLoan = async (subOfferKey: string) => {
    store.Lightbox.setContent('processing')
    store.Lightbox.setCanClose(false)
    store.Lightbox.setVisible(true)

    await store.MyOffers.handleRepayLoan(subOfferKey)

    toast.success(`Loan Repayed, NFT is back in your wallet`, {
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
    store.MyOffers.refetchStoreData()
  }

  const renderOffers = () => {
    return offers.map((offer) => {
      let offerSanitized: any = {
        offerKey: offer.publicKey.toBase58(),
        nftMint: offer.account.nftMint.toBase58(),
        state: offer.account.state
      }
      const offerSubOffers: any[] = []

      nftData.forEach((nft) => {
        if (nft.mint === offerSanitized.nftMint) {
          const { description, external_url, image, name } = nft.arweaveMetadata
          offerSanitized = { ...offerSanitized, ...{ description, external_url, image, name } }
        }
      })

      subOffers.forEach((subOffer: any) => {
        if (subOffer.account.offer.toBase58() === offerSanitized.offerKey) {
          const {
            aprNumerator,
            borrower,
            lender,
            loanDuration,
            minRepaidNumerator,
            offerAmount,
            offerMint,
            offerVault,
            state,
            subOfferNumber
          } = subOffer.account
          offerSubOffers.push({
            subOfferKey: subOffer.publicKey,
            aprNumerator,
            borrower,
            lender,
            loanDuration,
            minRepaidNumerator,
            offerAmount,
            offerMint,
            offerVault,
            state,
            subOfferNumber
          })
        }
      })

      return (
        <MyOffersNftItem
          key={offerSanitized.offerKey}
          offerKey={offerSanitized.offerKey}
          name={offerSanitized.name}
          image={offerSanitized.image}
          nftMint={offerSanitized.nftMint}
          offers={offerSubOffers}
          state={offerSanitized.state}
          reveal={reveal === offerSanitized.offerKey}
          onReveal={onReveal}
          handleCreateSubOffer={handleCreateSubOffer}
          handleRepayLoan={handleRepayLoan}
        />
      )
    })
  }

  return <div className='my-offers-nft-list'>{renderOffers()}</div>
})
