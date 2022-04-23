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

interface MyOffersNftDepositedProps {
    offerKey: string
    nftMint: string
    name: string
    image: string
    offers?: any
    state: number
    classNames?: string
}

export const MyOffersNftDeposited: React.FC<MyOffersNftDepositedProps> = observer(
    ({ nftMint, name, image, offers, state, classNames, offerKey }) => {
        const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()
        const store = useContext(StoreContext)

        return (
            <div className='nft-deposited-item'>
                <div className='nft-deposited-item__row'>
                    {name && image ?
                        <>
                            <Image src={image} alt='NFT Image' width='60px' height='60px' className='nft-img' />
                            <p className='info-name'>{name}</p>
                        </>
                        :
                        <p> Loading NFT Data </p>
                    }
                </div>
                <div className='nft-deposited-item__row'>
                    <div className='row--item'>
                        <p>Offer ID</p>
                        <div className='id'>{compressAddress(4, offerKey)}</div>
                    </div>
                    <div className='row--item'>
                        <p>NFT Mint</p>
                        <div className='mint'>{compressAddress(4, nftMint)}</div>
                    </div>
                    <div className='row--item'>
                        <p>Collection</p>
                        <div className='collection'>Example</div>
                    </div>
                </div>
                <div className='nft-deposited-item__row'>
                    <div className='buttons'>
                        <button className='btn--md btn--bordered' onClick={() => handleCancelCollateral()}>
                            Cancel Collateral
                        </button>
                        <button
                            ref={setTriggerRef}
                            className='btn--md btn--primary'
                            onClick={() => {
                                store.MyOffers.setActiveNftMint(nftMint)
                                store.Lightbox.setContent('loanCreate')
                                store.Lightbox.setVisible(true)
                            }}
                        >
                            Create Loan
                        </button>
                        {visible && (
                            <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                                Create a new Loan Offer using this NFT as Collateral
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
)


// <div className={`my-offers-nft ${classNames ? classNames : ''}`}>
// {name && image ? (
//   <div className='nft-item'>
//     <div className='nft-wrapper'>
//       <div className='nft-info'>
//         <Image src={image} alt='NFT Image' width='80px' height='80px' className='nft-img' />
//         <div className='nft-info-inner'>
//           <p className='info-name'>{name}</p>
//           <div className='nft-metadata'>
//             {/*
//         <ShowOnHover label={`#${compressAddress(4, nftMint)}`}>
//           <ClipboardButton data={nftMint} />
//           <SolscanExplorerIcon type={'token'} address={nftMint} />
//         </ShowOnHover>
//         */}
//             <p>Collection:</p>
//             <p>Example</p>
//           </div>
//         </div>
//         {setNFTActions(state)}
//       </div>
//     </div>
//   </div>
// ) : (
//   <>Loading NFT Data</>
// )}
// </div>
// <MyOffersNftItemOffers
// data={offers}
// handleOfferEdit={handleEditOffer}
// status={state}
// handleOfferCancel={handleCancelOffer}
// nftMint={offerKey}
// />