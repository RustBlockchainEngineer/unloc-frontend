import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { OffersGridItem } from './offersGridItem'
import { currencyMints } from '@constants/currency'
import { asBigNumber } from '@utils/asBigNumber'
import { BlobLoader } from '@components/layout/blobLoader'
import { toast } from 'react-toastify'
import { getDecimalsForLoanAmountAsString, getDecimalsForOfferMint } from '@integration/getDecimalForLoanAmount'
import { calculateRepayValue } from '@utils/calculateRepayValue'

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext)
  const { walletKey } = store.Wallet
  const { pageOfferData, pageNFTData, currentPage, maxPage, itemsPerPage, offersEmpty } = store.Offers
  const generateEmptyFields = () => {
    const count = (itemsPerPage - pageNFTData.length) as number
    return [...Array(count)].map((_page, index) => {
      return <div key={`offers-${index}`} className='offers-empty'></div>
    })
  }
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
      } else if ((e as Error).message.includes('503 Service Unavailable')) {
        toast.error('Solana RPC currently unavailable, please try again in a moment', {
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
      await store.MyOffers.refetchStoreData()
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(false)
    }
  }

  return offersEmpty ? (
    <div className='offers-grid--empty'>
      <h2 className='no-offers'>No Offers Created yet</h2>
    </div>
  ) : pageOfferData.length > 0 ? (
    <>
      <div className='offers-grid'>
        {pageOfferData.map((offerData, index) => {
          if (offerData.state === 0 || offerData.state === 6) {
            return (
              <OffersGridItem
                key={`offer-${offerData.nftData.arweaveMetadata.name}-${index}`}
                subOfferKey={offerData.nftData.mint}
                image={offerData.nftData.arweaveMetadata.image}
                amount={getDecimalsForLoanAmountAsString(offerData.offerAmount, offerData.offerMint.toString(), 0)}
                apr={asBigNumber(offerData.aprNumerator)}
                offerPublicKey={offerData.subOfferKey.toString()}
                name={offerData.nftData.arweaveMetadata.name}
                onLend={handleAcceptOffer}
                totalRepay={
                  calculateRepayValue(
                    offerData.offerAmount.toNumber() / getDecimalsForOfferMint(offerData.offerMint),
                    asBigNumber(offerData.aprNumerator),
                    offerData.loanDuration.toNumber() / (3600 * 24),
                    store.GlobalState.denominator
                  )
                }
                duration={Math.floor(offerData.loanDuration.toNumber() / (3600 * 24))}
                currency={currencyMints[offerData.offerMint.toBase58()]}
                count={offerData.count}
                collection={offerData.collection}
                isYours={offerData.borrower.equals(walletKey)}
              />
            )
          }
        })}
        {generateEmptyFields()}
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
    <div className='offers-grid--empty'>
      <BlobLoader />
    </div>
  )
})
