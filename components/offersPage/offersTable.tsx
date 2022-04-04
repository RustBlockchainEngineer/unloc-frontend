import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersTableRow } from './offersTableRow'
import { currencyMints } from '../../constants/currency'
import { asBigNumber } from '../../utils/asBigNumber'
import { removeDuplicatesByPropertyIndex } from '../../utils/removeDuplicatesByPropertyIndex'

export const OffersTable = observer(() => {
  const store = useContext(StoreContext)
  const { pageOfferData, pageNFTData } = store.Offers

  return pageNFTData.length > 0 && pageOfferData.length > 0 ? (
    <div className='offers-table'>
      <div className='offers-table-heading'>
        <div className='row-cell'>Name</div>
        <div className='row-cell'>APR</div>
        <div className='row-cell'>Amount</div>
        <div className='row-cell'>Duration</div>
        <div className='row-cell'>Offers</div>
      </div>
      {removeDuplicatesByPropertyIndex(pageNFTData, 'mint').map((nftData, index) => {
        return (
          <OffersTableRow
            key={`offer-${nftData.arweaveMetadata.name}`}
            subOfferKey={pageNFTData[index].mint}
            image={nftData.arweaveMetadata.image}
            nftName={nftData.arweaveMetadata.name}
            amount={pageOfferData[index].offerAmount.toNumber() / 1000000}
            apr={asBigNumber(pageOfferData[index].aprNumerator)}
            duration={Math.floor(pageOfferData[index].loanDuration.toNumber() / (3600 * 24))}
            currency={currencyMints[pageOfferData[index].offerMint.toBase58()]}
            count={pageOfferData[index].count}
          />
        )
      })}
    </div>
  ) : (
    <div>LOADING</div>
  )
})
