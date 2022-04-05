import React, { useEffect } from 'react'
import { compressAddress } from '../../utils/stringUtils/compressAdress'
import arrowImg from '../../constants/icons/svg/Triangle.svg'
import Image from 'next/image'

import { MyOffersNftOffer } from './myOffersNftOffers'

interface MyOffersNftItemProps {
  nftMint: string
  name: string
  image: string
  offers?: any
  classNames?: string
}

export const MyOffersNftItem: React.FC<MyOffersNftItemProps> = ({ nftMint, name, image, offers, classNames }) => {
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
                      <p>{compressAddress(4, nftMint)}</p>
                    </div>
                    <img src='' width='18px' height='18px' />
                  </div>
                  <p className='info-name'>{name}</p>
                </div>
              </div>
              <div className='nft-info-buttons'>
                <button className=' btn--md btn--disabled'>NFT Locked, Loan Offer Taken</button>
                <button className=' btn--md btn--primary'>Create Offer</button>
              </div>
            </div>
            <div className='nft-metadata'>
              <div className='metadata-item'>
                <p>NFT mint</p>
                <p>{compressAddress(4, nftMint)}</p>
              </div>
              <div className='metadata-item'>
                <p>collection</p>
                <p>test</p>
              </div>
              <div className='metadata-item'>
                <p>status</p>
                <p>test</p>
              </div>
            </div>
          </div>
        ) : (
          <>Loading NFT Data</>
        )}
      </div>
      <div className='offers-list'>
        {offers && offers.length ? (
          offers.map((offer: any) => (
            <MyOffersNftOffer key={offer.subOfferKey.toBase58()} offerAmount={offer.offerAmount} />
          ))
        ) : (
          <div className='offers-reveal-btn'>
            <p>Offers for this NFT</p>
            <img src={arrowImg} />
          </div>
        )}
      </div>
    </div>
  )
}
