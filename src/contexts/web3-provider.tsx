import React, { useEffect } from "react"
import { Wallet } from "../near/near-wallet"
import { Contract } from "../near/near-interface"

interface Web3Value {
  wallet: Wallet | null
  contract: Contract | null
  isSignedIn?: boolean | null
}

export const Web3Context = React.createContext<Web3Value>({
  wallet: null,
  contract: null,
  isSignedIn: null,
})

interface Props {
  children: React.ReactElement
}

interface PropsWeb3 {}

// const CONTRACT_ID: string | undefined = process.env.CONTRACT_ID
const CONTRACT_ID: string = "dev-1673256990748-99909988391461"

const Web3Provider = ({ children }: Props) => {
  const [web3, setWeb3] = React.useState<Web3Value>()

  useEffect(() => {
    async function loadProvider() {
      const wallet: Wallet = await new Wallet({
        createAccessKeyFor: CONTRACT_ID,
        network: "testnet",
      })

      const contract = await new Contract({
        contractId: CONTRACT_ID,
        walletToUse: wallet,
      })

      let isSignedIn = await wallet.startUp()
      console.log("isSignedIn :>> ", isSignedIn)

      console.log("here")
      setWeb3({ wallet, contract, isSignedIn })
    }

    loadProvider()
  }, [])

  return (
    <Web3Context.Provider
      value={{
        wallet: web3?.wallet as Wallet | null,
        contract: web3?.contract as Contract | null,
        isSignedIn: web3?.isSignedIn,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider
