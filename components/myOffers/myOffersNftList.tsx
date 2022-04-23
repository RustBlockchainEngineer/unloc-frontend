import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { MyOffersNftItem } from './myOffersNftItem/myOffersNftItem'
import { MyOffersNftDeposited } from './myOffersNftItem/myOffersNftDeposited'

type MyOffersNftListProps = {
  type: 'active' | 'deposited'
}

export const MyOffersNftList: React.FC<MyOffersNftListProps> = observer(({ type }) => {
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

      if (type == 'active' && offerSubOffers.length > 0) {
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
      }

      if (type == 'deposited' && offerSubOffers.length <= 0) {
        return (
          <MyOffersNftDeposited
            key={offerSanitized.offerKey}
            offerKey={offerSanitized.offerKey}
            name={offerSanitized.name}
            image={offerSanitized.image}
            nftMint={offerSanitized.nftMint}
            offers={offerSubOffers}
            state={offerSanitized.state}
          />
        )
      }

    })
  }

  return <div className={type == 'active' ? 'my-offers-nft-list' : 'nft-deposited'}>{renderOffers()}</div>
})
