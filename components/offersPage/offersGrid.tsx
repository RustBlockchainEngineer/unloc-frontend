import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersGridItem } from './offersGridItem'
import { currencyMints } from '../../constants/currency'
import { asBigNumber } from '../../utils/asBigNumber'
import { removeDuplicatesByPropertyIndex } from '../../utils/removeDuplicatesByPropertyIndex'

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext)
  const { pageOfferData, pageNFTData, currentPage } = store.Offers

  return pageNFTData.length > 0 && pageOfferData.length > 0 ? (
    <div className='offers-grid'>
      {removeDuplicatesByPropertyIndex(pageNFTData, 'mint').map((nftData, index) => {
        return (
          <OffersGridItem
            key={`offer-${nftData.arweaveMetadata.name}`}
            subOfferKey={pageNFTData[index].mint}
            image={pageNFTData[index].arweaveMetadata.image}
            amount={pageOfferData[index].offerAmount.toNumber() / 1000000}
            apr={asBigNumber(pageOfferData[index].aprNumerator)}
            duration={Math.floor(pageOfferData[index].loanDuration.toNumber() / (3600 * 24))}
            currency={currencyMints[pageOfferData[index].offerMint.toBase58()]}
            count={pageOfferData[index].count}
          />
        )
      })}
      <button onClick={() => store.Offers.setCurrentPage(currentPage - 1)}>Prev Page</button>
      <button onClick={() => store.Offers.setCurrentPage(currentPage + 1)}>Next Page</button>
    </div>
  ) : (
    <div>LOADING</div>
  )
})
