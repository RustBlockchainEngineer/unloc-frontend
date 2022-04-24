import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { OffersTableRow } from './offersTableRow'
import { currencyMints } from '@constants/currency'
import { asBigNumber } from '@utils/asBigNumber'
import { BlobLoader } from '@components/layout/blobLoader'
import { toast } from 'react-toastify'

export const OffersTable = observer(() => {
  const store = useContext(StoreContext)
  const { connected, walletKey } = store.Wallet
  const { pageOfferData, pageNFTData, currentPage, maxPage } = store.Offers

  const handleAcceptOffer = async (offerPublicKey: string) => {
    try {
      store.Lightbox.setContent('processing')
      store.Lightbox.setCanClose(false)
      store.Lightbox.setVisible(true)
      await store.Offers.handleAcceptOffer(offerPublicKey)
      toast.success(`Loan Accepted`, {
        autoClose: 3000,
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
    } catch (e: any) {
      console.log(e)

      if (e.message === 'User rejected the request.') {
        toast.error(`Transaction rejected`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
      } else {
        toast.error(`Something went wrong`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
      }
    } finally {
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(false)
    }
  }

  return pageNFTData.length > 0 && pageOfferData.length > 0 ? (
    <>
      <div className='offers-table'>
        <div className='offers-table-heading'>
          <div className='row-cell'>Name</div>
          <div className='row-cell'></div>
          <div className='row-cell'>APR</div>
          <div className='row-cell'>Amount</div>
          <div className='row-cell'>Currency</div>
          <div className='row-cell'>Duration</div>
        </div>
        {pageOfferData.map((offerData, index) => {
          return (
            <OffersTableRow
              key={`offer-${offerData.nftData.arweaveMetadata.name}-${index}`}
              subOfferKey={offerData.nftData.mint}
              image={offerData.nftData.arweaveMetadata.image}
              nftName={offerData.nftData.arweaveMetadata.name}
              amount={offerData.offerAmount.toNumber() / 1000000}
              onLend={handleAcceptOffer}
              offerPublicKey={offerData.subOfferKey.toString()}
              apr={asBigNumber(offerData.aprNumerator)}
              duration={Math.floor(offerData.loanDuration.toNumber() / (3600 * 24))}
              currency={currencyMints[offerData.offerMint.toBase58()]}
              count={offerData.count}
              isYours={offerData.borrower.toBase58() == walletKey?.toBase58()}
            />
          )
        })}
      </div>
      <div className='offers-pagination'>
        <div>
          <button disabled={currentPage === 1} onClick={() => store.Offers.setCurrentPage(currentPage - 1)}>
            <i className='icon icon--sm icon--paginator--left' />
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
            <i className='icon icon--sm icon--paginator--right' />
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className='offers-table--empty'>
      <BlobLoader />
    </div>
  )
})
