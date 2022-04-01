import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersGridItem } from './offersGridItem'
import { currencyMints } from '../../constants/currency'

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext)
  const { offers } = store.Offers

  return (
    <div className='offers-grid'>
      {offers.map((offer) => {
        console.log(offer)
        const offerKey = offer.account.offer.toBase58()
        return (
          <OffersGridItem
            key={offerKey}
            subOfferKey={offer.nftMeta.mint}
            image={offer.nftMeta.arweaveMetadata.image}
            amount={offer.account.offerAmount.toNumber() / 1000000}
            apr={offer.account.aprNumerator.toNumber()}
            duration={Math.floor(offer.account.loanDuration.toNumber() / (3600 * 24))}
            currency={currencyMints[offer.account.offerMint.toBase58()]}
          />
        )
      })}
    </div>
  )
})
