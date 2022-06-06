import React, { useCallback, useContext } from "react";
import { observer } from "mobx-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { StoreContext } from "@pages/_app";
import { MyOffersNftItemOffers } from "./myOffersNftItemOffers";
import { IsubOfferData } from "@stores/Lightbox.store";

interface MyOffersNftItemProps {
  offerKey: string;
  nftMint: string;
  name: string;
  image: string;
  offers?: any;
  state: number;
  classNames?: string;
  collection?: string;
}

export const MyOffersNftItem: React.FC<MyOffersNftItemProps> = observer(
  ({ nftMint, name, image, offers, state, classNames, offerKey, collection }) => {
    const store = useContext(StoreContext);

    const handleCancelOffer = useCallback(async (subOfferKey: string) => {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);
      try {
        await store.MyOffers.handleCancelSubOffer(subOfferKey);

        toast.success(`Offer canceled`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      } catch (e: any) {
        console.log(e);
        if (e.message === "User rejected the request.") {
          toast.error(`Transaction rejected`, {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else if ((e as Error).message.includes("503 Service Unavailable")) {
          toast.error("Solana RPC currently unavailable, please try again in a moment", {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(`Something went wrong`, {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } finally {
        store.MyOffers.refetchStoreData();
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      }
    }, []);

    const handleEditOffer = useCallback(async (subOfferKey: string, values: IsubOfferData) => {
      store.Lightbox.setActiveSubOffer(subOfferKey);
      store.Lightbox.setActiveSubOfferData(values);
      store.Lightbox.setContent("loanUpdate");
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(true);
    }, []);

    const handleAddOffer = useCallback(() => {
      store.MyOffers.setActiveNftMint(nftMint);
      store.Lightbox.setContent("loanCreate");
      store.Lightbox.setVisible(true);
    }, [nftMint]);

    const handleCancelCollateral = useCallback(async () => {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);

      try {
        await store.MyOffers.handleCancelCollateral(nftMint);
        toast.success(`NFT ${name} returned to the wallet`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      } catch (e: any) {
        console.log(e);
        if (e.message === "User rejected the request.") {
          toast.error(`Transaction rejected`, {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else if ((e as Error).message.includes("503 Service Unavailable")) {
          toast.error("Solana RPC currently unavailable, please try again in a moment", {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(`Something went wrong`, {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } finally {
        store.MyOffers.refetchStoreData();
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      }
    }, [nftMint]);

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className="nft-info-buttons">
            <button
              className="btn--md btn--primary active-offer--tooltip--parent"
              onClick={handleAddOffer}>
              +
              <div className="tooltip-container active-offer--tooltip">
                <span>Create a new Loan Offer with this NFT as Collateral</span>
              </div>
            </button>
            <button
              className="btn--md btn--bordered active-offer--tooltip--parent"
              onClick={() => handleCancelCollateral()}>
              &minus;
              <div className="tooltip-container active-offer--tooltip">
                <span>Return NFT to wallet</span>
              </div>
            </button>
          </div>
        );
      }

      if (status === 1) {
        return <div className={"nft-info-space"} />;
      }
      return;
    };

    return (
      <div className="nft-list-item">
        <div className={`my-offers-nft ${classNames ? classNames : ""}`}>
          {name && image ? (
            <div className="nft-item">
              <div className="nft-wrapper">
                <div className="nft-info">
                  <Image
                    src={image}
                    alt="NFT Image"
                    width="80px"
                    height="80px"
                    className="nft-img"
                  />
                  <div className="nft-info-inner">
                    <p className="info-name">{name}</p>
                    <div className="nft-metadata">
                      <p>Collection:</p>
                      <p>{collection}</p>
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
          handleAddOffer={handleAddOffer}
          handleCancelCollateral={handleCancelCollateral}
          nftMint={offerKey}
        />
      </div>
    );
  },
);
