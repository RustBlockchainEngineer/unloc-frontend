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

        const handleCancelCollateral = async () => {
            store.Lightbox.setContent('processing')
            store.Lightbox.setCanClose(false)
            store.Lightbox.setVisible(true)

            try {
                await store.MyOffers.handleCancelCollateral(nftMint)
                toast.success(`NFT ${name} returned to the wallet`, {
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
                store.MyOffers.refetchStoreData()
                store.Lightbox.setCanClose(true)
                store.Lightbox.setVisible(false)
            }
        }

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
                        <p>Collateral ID</p>
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
                        <button className='btn btn--md btn--bordered' onClick={() => handleCancelCollateral()}>
                            Cancel Collateral
                        </button>
                        <button
                            ref={setTriggerRef}
                            className='btn btn--md btn--primary'
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