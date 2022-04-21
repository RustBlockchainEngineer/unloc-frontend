import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { MyOffersNftItem } from './myOffersNftItem/myOffersNftItem'

export const MyOffersNftList: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { offers, nftData, subOffers } = store.MyOffers

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
            subOfferNumber,
            loanStartedTime
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
            subOfferNumber,
            loanStartedTime
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
        />
      )
    })
  }

  return <div className='my-offers-nft-list'>{renderOffers()}</div>
})
