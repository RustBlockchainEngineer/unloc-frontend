import React, { useContext, useEffect, useState } from 'react'
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
  const [sanitizedOffers, setSanitizedOffers] = useState<any[]>([])

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

  useEffect(() => {
    const sanitized: any[] = offers.map((offer) => {
      let offerSanitized: any = {
        offerKey: offer.publicKey.toBase58(),
        nftMint: offer.account.nftMint.toBase58(),
        state: offer.account.state,
        subOffers: []
      }

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

          offerSanitized.subOffers.push({
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

      if (
        (type == 'active' && offerSanitized.subOffers.length > 0) ||
        (type == 'deposited' && offerSanitized.subOffers.length === 0)
      ) {
        return offerSanitized
      }

      return null
    }).filter((item) => item !== null)

    if (type === 'active') {
      store.MyOffers.setActiveHideable(sanitized.length > 0)
    } else if (type === 'deposited') {
      store.MyOffers.setDepositedHideable(sanitized.length > 0)
    }

    setSanitizedOffers(sanitized)
  }, [offers, nftData, subOffers])

  const renderOffers = () => {
    const mappedOffers = sanitizedOffers.map((offer) => {
      if (type === 'deposited') {
        return <MyOffersNftDeposited
          key={offer.offerKey}
          offerKey={offer.offerKey}
          name={offer.name}
          image={offer.image}
          nftMint={offer.nftMint}
          offers={offer}
          state={offer.state}
        />
      } else if (type === 'active') {
        return <MyOffersNftItem
          key={offer.offerKey}
          offerKey={offer.offerKey}
          name={offer.name}
          image={offer.image}
          nftMint={offer.nftMint}
          offers={offer.subOffers}
          state={offer.state}
        />
      }
    })

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
