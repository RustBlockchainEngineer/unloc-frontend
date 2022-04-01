import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersTableRow } from './offersTableRow'
import { currencyMints } from '../../constants/currency'

export const OffersTable = observer(() => {
  const store = useContext(StoreContext)
  const { offers } = store.Offers

  return (
    <div className='offers-table'>
      <div className='offers-table-heading'>
        <div className='row-cell'>Name</div>
        <div className='row-cell'>APR</div>
        <div className='row-cell'>Amount</div>
        <div className='row-cell'>Duration</div>
      </div>
      {offers.map((offer) => {
        const offerKey = offer.account.offer.toBase58()
        return (
          <OffersTableRow
            key={offerKey}
            subOfferKey={offer.publicKey.toBase58()}
            image={offer.nftMeta.arweaveMetadata.image}
            nftName={offer.nftMeta.arweaveMetadata.name}
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
