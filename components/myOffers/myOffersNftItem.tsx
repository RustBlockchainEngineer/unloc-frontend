import React, { useEffect } from 'react'
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
    <div className={`my-offers-nft ${classNames ? classNames : ''}`}>
      {name && image ? (
        <div className='nft-info'>
          <Image src={image} alt='NFT Image' width='50px' height='50px' />
          <div className='nft-info-inner'>
            <span>{name}</span>
            <span>{nftMint}</span>
            <button className='btn btn--md btn--primary'>Create Offer</button>
          </div>
        </div>
      ) : (
        <>Loading NFT Data</>
      )}
      {offers && offers.length ? (
        <div className='offers-list'>
          {offers.map((offer: any) => (
            <MyOffersNftOffer key={offer.subOfferKey.toBase58()} offerAmount={offer.offerAmount} />
          ))}
        </div>
      ) : (
        <>No Offers yet for this Collateral</>
      )}
    </div>
  )
}
