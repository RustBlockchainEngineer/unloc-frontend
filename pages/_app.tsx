import { createContext, useContext, useEffect, useMemo } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SlopeWalletAdapter } from "@solana/wallet-adapter-slope";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { extend } from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { observer } from "mobx-react-lite";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

import { Airdrop } from "@components/Airdrop/Airdrop";
import { Footer } from "@components/layout/footer";
import { config } from "@constants/config";
import { localesHome } from "@constants/locales";
import { rootStore } from "@stores/Root.store";

import "@styles/main.scss";
import "react-toastify/dist/ReactToastify.css";

extend(duration);
extend(relativeTime);
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
      new GlowWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new LedgerWalletAdapter(),
      new SlopeWalletAdapter(),
    ],
    [network],
  );

  useEffect(() => {
    document.documentElement.className = "";
    document.documentElement.classList.add("theme-dark", "tw-theme-dark");
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
              <div>
                <div className="devnet-container">
                  <span className="devnet">
                    <i className="icon icon--smd icon--info" />
                    Devnet Version
                  </span>
                  <Airdrop />
                </div>
              </div>
            )}
            <div className="home-bg-top" />
            <div className="home-bg-bottom" />
            <Component {...pageProps} />
            <ToastContainer
              position="bottom-left"
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

// eslint-disable-next-line import/no-default-export
export default Unloc;
