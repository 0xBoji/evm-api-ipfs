import Web3Provider from "./web3-provider"

interface Props {
  children: React.ReactElement
}

const Providers = ({ children }: Props) => {
  return <Web3Provider>{children}</Web3Provider>
}

export default Providers
