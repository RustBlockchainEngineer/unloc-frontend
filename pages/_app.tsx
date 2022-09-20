import { useMemo, createContext, useEffect, useContext } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { extend } from "dayjs";
import duration from "dayjs/plugin/duration";
import { observer } from "mobx-react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

import { Footer } from "@components/layout/footer";
import { config } from "@constants/config";
import { localesHome } from "@constants/locales";
import { rootStore } from "@stores/Root.store";

import "react-toastify/dist/ReactToastify.css";
import "@styles/main.scss";

extend(duration);
export const StoreContext = createContext(rootStore);

const Unloc = observer(({ Component, pageProps }: AppProps) => {
  const store = useContext(StoreContext);
  const { endpoint } = store.GlobalState;

  const network =
    endpoint === "devnet" ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

  const endpointUrl = useMemo(() => {
    if (endpoint === "localnet") return "http://localhost:8899";
    else return clusterApiUrl(network);
  }, [endpoint, network]);
  const {
    Wallet: { handleWalletError },
  } = rootStore;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network],
  );

  useEffect(() => {
    document.documentElement.className = "";
    document.documentElement.classList.add("theme-dark");
  }, []);

  return (
    <ConnectionProvider endpoint={endpointUrl}>
      <WalletProvider wallets={wallets} autoConnect onError={handleWalletError}>
        <WalletModalProvider>
          <StoreContext.Provider value={rootStore}>
            <Head>
              <title>{localesHome.pageTitle}</title>
              <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
            </Head>
            {config.devnet && (
              <div className="devnet-container">
                <span className="devnet">
                  <i className="icon icon--smd icon--info" />
                  Devnet Version
                </span>
              </div>
            )}
            <div className="home-bg-top" />
            <div className="home-bg-bottom" />
            <Component {...pageProps} />
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <Footer />
          </StoreContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
});

export default Unloc;
