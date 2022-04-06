import React, { useContext, useEffect } from 'react'
import { compressAddress } from '../../utils/stringUtils/compressAdress'
import arrowImg from '../../constants/icons/png/Vector.png'
import icons from '../../constants/icons/icons'
import Image from 'next/image'

import { MyOffersNftOffer } from './myOffersNftOffers'
import { StoreContext } from '../../pages/_app'
import { Lightbox } from '../lightboxes/lightbox'
import CreateLoan from '../lightboxes/createLoan/createLoan'
import { observer } from 'mobx-react'
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

const setNFTState = (status: number) => {
  if (status === 0) return <p style={{ color: 'red' }}>Proposed</p>
  if (status === 1) return <p style={{ color: 'green' }}>Accepted</p>
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
    const { showLightboxLoan, setShowLightboxLoan } = store.Lightbox

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className='nft-info-buttons'>
            <button className=' btn--md btn--primary' onClick={() => store.Lightbox.setShowLightboxLoan('create')}>
              Create Offer
            </button>
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
                        <p>{compressAddress(4, offerKey)}</p>
                      </div>
                      <Image
                        src={icons.copy}
                        width='18px'
                        height='18px'
                        className='clipboard-button'
                        onClick={() => navigator.clipboard.writeText(offerKey)}
                      />
                    </div>
                    <p className='info-name'>{name}</p>
                  </div>
                </div>
                {setNFTActions(state)}
              </div>
              <div className='nft-metadata'>
                <div className='metadata-item'>
                  <p>NFT mint</p>
                  <p>{compressAddress(4, nftMint)}</p>
                </div>
                <div className='metadata-item'>
                  <p>collection</p>
                  <p></p>
                </div>
                <div className='metadata-item'>
                  <p>status</p>
                  {setNFTState(state)}
                </div>
              </div>
            </div>
          ) : (
            <>Loading NFT Data</>
          )}
        </div>
        <div
          className='offers-list'
          style={{ maxHeight: `${reveal ? '1000px' : '22px'}`, backgroundColor: `${reveal ? '#482688' : ''}` }}
          onClick={() => onReveal(offerKey)}
        >
          <div className='offers-reveal-btn'>
            <p>{reveal ? 'Active Loan' : 'Offers for this NFT'}</p>
            <Image src={icons.reveal} />
          </div>
          <div className='offers-items'>
            {offers && offers.length ? (
              offers.map((offer: any) => (
                <MyOffersNftOffer
                  key={offer.subOfferKey.toBase58()}
                  offerAmount={offer.offerAmount}
                  APR={offer.aprNumerator}
                  status={offer.state}
                  offerID={offer.subOfferKey}
                  duration={offer.loanDuration}
                  repaid={offer.minRepaidNumerator}
                />
              ))
            ) : (
              <div className={`my-offers-no__offers ${classNames ? classNames : ''}`}>
                <p>You have no offers yet</p>
              </div>
            )}
          </div>
        </div>
        {console.log(showLightboxLoan)}
        {showLightboxLoan !== null ? (
          <Lightbox classNames='create-loan-lightbox'>
            <CreateLoan onClick={() => {}} />
          </Lightbox>
        ) : null}
      </div>
    )
  }
)
