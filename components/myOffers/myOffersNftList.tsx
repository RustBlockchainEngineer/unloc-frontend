import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { MyOffersNftItem } from './myOffersNftItem/myOffersNftItem'
import { MyOffersNftDeposited } from './myOffersNftItem/myOffersNftDeposited'
import { usePopperTooltip } from 'react-popper-tooltip'

type MyOffersNftListProps = {
  type: 'active' | 'deposited'
  listVisible: boolean
}

export const MyOffersNftList: React.FC<MyOffersNftListProps> = observer(({ type, listVisible }) => {
  const store = useContext(StoreContext)
  const { offers, nftData, subOffers } = store.MyOffers

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

  const renderOffers = () => {
    const mappedOffers = offers.map((offer) => {
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
      } else if (type == 'deposited' && offerSubOffers.length <= 0) {
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
    }).filter((item) => item !== undefined && item !== null)

    if (type === 'active') {
      store.MyOffers.setActiveHideable(mappedOffers.length > 0)
    } else if (type === 'deposited') {
      store.MyOffers.setDepositedHideable(mappedOffers.length > 0)
    }

    return mappedOffers.length > 0 ? mappedOffers : (
      type === 'active' ? '' : <div className='no-offers'>
        <button
          ref={setTriggerRef}
          className='btn btn--xl btn--rounded btn--primary'
          onClick={() => {
            store.Lightbox.setContent('collateral')
            store.Lightbox.setVisible(true)
          }}
        >Deposit NFT</button>
        {visible && (
          <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
            Create a new Collateral from a NFT
          </div>
        )}
        </div>
    )
  }

  return (
    <div className={`${type == 'active' ? 'my-offers-nft-list' : 'nft-deposited'} ${!listVisible ? 'hidden' : ''}`}>
      {renderOffers()}
    </div>
  )
})
