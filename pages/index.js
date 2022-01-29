import Head from 'next/head';
import styles from '../styles/Home.module.css';

import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist,setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();



  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId !==4){
      window.alert("Please connect to the Rinkeby testnet");
      throw new Error("Change network to Rinkeby");
    }
    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      
      const signer = await getProviderOrSigner(true);
     
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
     
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      
      await tx.wait();
      setLoading(false);
     
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
    };

    const getNumberOfWhitelisted = async () => {
      try{
        const provider = await getProviderOrSigner();
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          provider
        );
        const count = await whitelistContract.numAddressesWhitelisted();
        setNumberOfWhitelisted(count);
      }catch(e){
        console.error(e);

      }
    };

    const checkIfAddressInWhitelist = async () => {
      try{
        const signer = await getProviderOrSigner(true);
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          signer
        );
        const address = await signer.getAddress();
        const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
        setJoinedWhitelist(_joinedWhitelist);
      }catch(e){
        console.error(e);
      }
      };

      const connectWallet = async () => {
        try{
        await getProviderOrSigner();
        setWalletConnected(true);

        checkIfAddressInWhitelist();
        getNumberOfWhitelisted();
      } catch(e){
        console.error(e);
      }
      } ;
    

      const renderButton = () => {
        if(walletConnected){
          if(joinedWhitelist){
            return(
              <div className={styles.description}>
            Thank you for joining the whitelist!
          </div>
            );
          
          } else if(loading){
            return(
              <div className={styles.button}>
            Loading...
          </div>
            );
          }
        else {
        return(
          <div className={styles.button} onClick={addAddressToWhitelist}>
          Join Whitelist
        </div>
        );
        }
        } else {
          return(
            <div className={styles.button} onClick={connectWallet}>
            Connect Wallet
          </div>
          );
        }
      } ;
      
    useEffect(() => {
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network: "rinkeby", // optional
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
      }
    },[walletConnected]);
      
  

  return (

    <div> <style jsx global>{`
    body {
      margin: 0px;
      padding: 0px;
    }
  `}</style>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.heading}>Welcome to Crypto Devs !</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
      </div>
      
    </div>
  )
}
