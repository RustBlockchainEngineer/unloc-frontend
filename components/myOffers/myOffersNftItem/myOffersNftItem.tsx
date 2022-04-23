import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import Image from 'next/image'
import { usePopperTooltip } from 'react-popper-tooltip'
import { toast } from 'react-toastify'
import { StoreContext } from '@pages/_app'
import { compressAddress } from '@utils/stringUtils/compressAdress'
import { ShowOnHover } from '@components/layout/showOnHover'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { MyOffersNftItemOffers } from './myOffersNftItemOffers'
import { IsubOfferData } from '@stores/Lightbox.store'

interface MyOffersNftItemProps {
  offerKey: string
  nftMint: string
  name: string
  image: string
  offers?: any
  state: number
  classNames?: string
}

export const MyOffersNftItem: React.FC<MyOffersNftItemProps> = observer(
  ({ nftMint, name, image, offers, state, classNames, offerKey }) => {
    const store = useContext(StoreContext)
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

    const handleRepayLoan = async (subOfferKey: string) => {
      store.Lightbox.setContent('processing')
      store.Lightbox.setCanClose(false)
      store.Lightbox.setVisible(true)

      try {
        await store.MyOffers.handleRepayLoan(subOfferKey)

        toast.success(`Loan Repayed, NFT is back in your wallet`, {
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
        store.MyOffers.refetchStoreData()
      }
    }

    const handleCancelOffer = async (subOfferKey: string) => {
      store.Lightbox.setContent('processing')
      store.Lightbox.setCanClose(false)
      store.Lightbox.setVisible(true)
      try {
        await store.MyOffers.handleCancelSubOffer(subOfferKey)

        toast.success(`Offer canceled`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
        store.Lightbox.setCanClose(true)
        store.Lightbox.setVisible(false)
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
        store.MyOffers.refetchStoreData()
        store.Lightbox.setCanClose(true)
        store.Lightbox.setVisible(false)
      }
    }

    const handleEditOffer = async (subOfferKey: string, values: IsubOfferData) => {
      store.Lightbox.setActiveSubOffer(subOfferKey)
      store.Lightbox.setActiveSubOfferData(values)
      store.Lightbox.setContent('loanUpdate')
      store.Lightbox.setCanClose(true)
      store.Lightbox.setVisible(true)
    }

    const getActiveSubOffer = () => {
      let output = ''
      offers.forEach((offer: any) => {
        if (offer.state === 1) {
          // is it possible to have more than one active loan? i hope not
          output = offer.subOfferKey.toBase58()
        }
      })

      return output
    }

    const handleCancelCollateral = async () => {
      store.Lightbox.setContent('processing')
      store.Lightbox.setCanClose(false)
      store.Lightbox.setVisible(true)

      try {
        await store.MyOffers.handleCancelCollateral(nftMint)
        toast.success(`Collateral canceled`, {
          autoClose: 3000,
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        })
        store.Lightbox.setCanClose(true)
        store.Lightbox.setVisible(false)
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
        store.MyOffers.refetchStoreData()
        store.Lightbox.setCanClose(true)
        store.Lightbox.setVisible(false)
      }
    }

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className='nft-info-buttons'>
            <button
              ref={setTriggerRef}
              className='btn--md btn--primary'
              onClick={() => {
                store.MyOffers.setActiveNftMint(nftMint)
                store.Lightbox.setContent('loanCreate')
                store.Lightbox.setVisible(true)
              }}
            >
              +
            </button>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                Create a new Loan Offer using this NFT as Collateral
              </div>
            )}
            <button className='btn--md btn--bordered' onClick={() => handleCancelCollateral()}>
              -
            </button>
          </div>
        )
      }
      if (status === 1) {
        return (
          <div className='nft-info-buttons'>
            <button className=' btn--md btn--disabled'>NFT Locked, Loan Offer Taken</button>
            <button
              ref={setTriggerRef}
              className=' btn--md btn--primary'
              onClick={() => handleRepayLoan(getActiveSubOffer())}
            >
              Repay Loan
            </button>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                Repay the Loan and get your NFT back
              </div>
            )}
          </div>
        )
      }
    }

    return (
      <div className='nft-list-item'>
        <div className={`my-offers-nft ${classNames ? classNames : ''}`}>
          {name && image ? (
            <div className='nft-item'>
              <div className='nft-wrapper'>
                <div className='nft-info'>
                  <Image src={image} alt='NFT Image' width='80px' height='80px' className='nft-img' />
                  <div className='nft-info-inner'>
                    <p className='info-name'>{name}</p>
                    <div className='nft-metadata'>
                      {/*
                  <ShowOnHover label={`#${compressAddress(4, nftMint)}`}>
                    <ClipboardButton data={nftMint} />
                    <SolscanExplorerIcon type={'token'} address={nftMint} />
                  </ShowOnHover>
                  */}
                      <p>Collection:</p>
                      <p>Example</p>
                    </div>
                  </div>
                  {setNFTActions(state)}
                </div>
              </div>
            </div>
          ) : (
            <>Loading NFT Data</>
          )}
        </div>
        <MyOffersNftItemOffers
          data={offers}
          handleOfferEdit={handleEditOffer}
          status={state}
          handleOfferCancel={handleCancelOffer}
          nftMint={offerKey}
        />
      </div>
    )
  }
)
