import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { toast } from 'react-toastify'
import { NFTMetadata } from '@integration/nftLoan'
import { StoreContext } from '@pages/_app'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { CollateralItem } from './collateralItem'
import { BlobLoader } from '@components/layout/blobLoader'
import { CustomSelect } from '@components/layout/customSelect'

export interface INFTCollateral {
  NFTAddress: string
  NFTCollection: string
  NFTId: string
  NFTImage: string
}

export const CreateCollateral: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const myOffers = store.MyOffers
  const { wallet, connection, walletKey } = store.Wallet

  const [itemMint, setItemMint] = useState('')
  const [sortOption, setSortOption] = useState('Default')
  const [data, setData] = useState<NFTMetadata[]>(myOffers.collaterables)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  const chooseNFT = (mint: any) => {
    if (mint === itemMint) {
      setItemMint('')
    } else {
      setItemMint(mint)
    }
  }

  const sortNFT = (option: string) => {
    setSortOption(option)
  }

  const createOffer = async (mint: string) => {
    try {
      store.Lightbox.setCanClose(false)
      setProcessing(true)

      await store.MyOffers.createCollateral(mint)

      store.Lightbox.setVisible(false)
      setProcessing(false)
      store.Lightbox.setCanClose(true)

      toast.success(`Collateral Created`, {
        autoClose: 3000,
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
    } catch (e) {
      setProcessing(false)
      store.Lightbox.setVisible(false)
      console.log(e)
      toast.error(`Transaction rejected`, {
        autoClose: 3000,
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      })
    }

    store.MyOffers.refetchStoreData()
  }

  useEffect(() => {
    if (data) {
      if (sortOption === '') {
        return
      }

      if (sortOption.toLowerCase() === 'name') {
        setData(
          data.sort((a, b) =>
            a.arweaveMetadata.name > b.arweaveMetadata.name ? 1 : b.arweaveMetadata.name > a.arweaveMetadata.name ? -1 : 0
          )
        )
      }
    }
  }, [sortOption])

  useEffect(() => {
    if (wallet && walletKey) {
      const fetchData = async () => {
        try {
          setLoading(true)
          await myOffers.getUserNFTs(walletKey)
          await myOffers.getNFTsData()
          setData(myOffers.collaterables)
          setLoading(false)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          setLoading(false)
        }
      }
  
      
      fetchData()
    }
  }, [wallet, connection, walletKey])

  return processing ? (
    <div className='create-offer-processing'>
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  ) : (
    <StoreDataAdapter>
      <div className='collateral-lightbox'>
        {!loading ?
          (data && data.length ? (
            <>
              <div className='NFT-lb-header'>
                <h1>Choose an NFT for collateral</h1>
                <label htmlFor='sort-select'>Sort by:
                  <CustomSelect
                    options={['Default', 'Name']}
                    selectedOption={sortOption}
                    setSelectedOption={sortNFT}
                    classNames={'sort-select'}
                  />
                </label>
              </div>
              <div className='NFT-lb-collateral-list'>
                {data?.map((item: NFTMetadata) => {
                  return (
                    <CollateralItem
                      key={item.mint}
                      data={item}
                      onClick={() => chooseNFT(item.mint)}
                      choosen={item.mint === itemMint}
                    />
                  )
                })}
              </div>
              <button
                onClick={() => {
                  createOffer(itemMint)
                }}
                className='lb-collateral-button'
              >
                Use as Collateral
              </button>
            </>
          ) : (
            <div className='collateral-empty'>
              <div></div>
              <h2>No whitelisted NFTs in your wallet</h2>
            </div>
          )
        ) : (
          <div className='collateral-loading'>
            <BlobLoader />
            <h2>Loading...</h2>
          </div>
        )}
      </div>
    </StoreDataAdapter>
  )
})
