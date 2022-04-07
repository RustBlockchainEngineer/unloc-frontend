import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import Image from 'next/image'
import { usePopperTooltip } from 'react-popper-tooltip'

import { StoreContext } from '../../../pages/_app'
import { compressAddress } from '../../../utils/stringUtils/compressAdress'
import { ShowOnHover } from '../../layout/showOnHover'
import { SolscanExplorerIcon } from '../../layout/solscanExplorerIcon'
import { ClipboardButton } from '../../layout/clipboardButton'
import { MyOffersNftItemOffers } from './myOffersNftItemOffers'

interface MyOffersNftItemProps {
  offerKey: string
  nftMint: string
  name: string
  image: string
  handleCreateSubOffer: (nftMint: string) => void
  handleRepayLoan: (subOfferKey: string) => void
  offers?: any
  state: number
  classNames?: string
  reveal: boolean
  onReveal: (key: string) => void
}

export const MyOffersNftItem: React.FC<MyOffersNftItemProps> = observer(
  ({
    nftMint,
    name,
    image,
    offers,
    state,
    classNames,
    reveal,
    offerKey,
    onReveal,
    handleCreateSubOffer,
    handleRepayLoan
  }) => {
    const store = useContext(StoreContext)
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className='nft-info-buttons'>
            <button
              ref={setTriggerRef}
              className=' btn--md btn--primary'
              onClick={() => {
                store.MyOffers.setActiveNftMint(nftMint)
                store.Lightbox.setContent('loanCreate')
                store.Lightbox.setVisible(true)
              }}
            >
              Create Offer
            </button>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                Create a new Loan Offer using this NFT as Collateral
              </div>
            )}
          </div>
        )
      }
      if (status === 1) {
        return (
          <div className='nft-info-buttons'>
            <button className=' btn--md btn--disabled'>NFT Locked, Loan Offer Taken</button>
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
                  <Image src={image} alt='NFT Image' width='50px' height='50px' className='nft-img' />
                  <div className='nft-info-inner'>
                    <div className='nft-info-inner-mainData'>
                      <div className='info-description'>
                        <p>Offer ID:</p>
                        <ShowOnHover label={`#${compressAddress(4, offerKey)}`}>
                          <ClipboardButton data={offerKey} />
                          <SolscanExplorerIcon type={'account'} address={offerKey} />
                        </ShowOnHover>
                      </div>
                    </div>
                    <p className='info-name'>{name}</p>
                  </div>
                </div>
                {setNFTActions(state)}
              </div>
              <div className='nft-metadata'>
                <div className='metadata-item'>
                  <p>NFT mint</p>
                  <ShowOnHover label={`#${compressAddress(4, nftMint)}`}>
                    <ClipboardButton data={nftMint} />
                    <SolscanExplorerIcon type={'token'} address={nftMint} />
                  </ShowOnHover>
                </div>
                <div className='metadata-item'>
                  <p>collection</p>
                  <p></p>
                </div>
              </div>
            </div>
          ) : (
            <>Loading NFT Data</>
          )}
        </div>
        <MyOffersNftItemOffers data={offers} handleOfferEdit={() => {}} handleOfferCancel={() => {}} />
      </div>
    )
  }
)
