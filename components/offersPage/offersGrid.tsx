import React, { useContext } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersGridItem } from './offersGridItem'
import { currencyMints } from '../../constants/currency'
import { asBigNumber } from '../../utils/asBigNumber'
import { BlobLoader } from '../layout/blobLoader'

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext)
  const { pageOfferData, pageNFTData, currentPage, maxPage, itemsPerPage, offersEmpty } = store.Offers

  const generateEmptyFields = () => {
    const count = (itemsPerPage - pageNFTData.length) as number
    return [...Array(count)].map((page, index) => {
      return <div key={`offers-${index}`} className='offers-empty'></div>
    })
  }

  return offersEmpty ? (
    <div className='offers-grid--empty'>
      <h2 className='no-offers'>No Offers Created yet</h2>
    </div>
  ) : pageNFTData.length > 0 && pageOfferData.length > 0 ? (
    <>
      <div className='offers-grid'>
        {pageNFTData.map((nftData, index) => {
          return (
            <OffersGridItem
              key={`offer-${nftData.arweaveMetadata.name}-${index}`}
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
        {generateEmptyFields()}
      </div>
      <div className='offers-pagination'>
        <div>
          <button disabled={currentPage === 1} onClick={() => store.Offers.setCurrentPage(currentPage - 1)}>
            Previous
          </button>
        </div>
        <div className='offers-pagination__pages'>
          {[...Array(maxPage)].map((page, index) => (
            <button
              key={`${page}-${index}`}
              className={`page ${index + 1 === currentPage ? 'active' : ''}`}
              onClick={() => store.Offers.setCurrentPage(index + 1)}
            >
              <b>{index + 1}</b>
            </button>
          ))}
        </div>
        <div>
          <button disabled={currentPage === maxPage} onClick={() => store.Offers.setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className='offers-grid--empty'>
      <BlobLoader />
    </div>
  )
})
