  import { WalletSelector } from "@near-wallet-selector/core";
  import { ref} from "vue";
  import senderIconUrl from "@near-wallet-selector/sender/assets/sender-icon.png";
  import nearWalletIconUrl from "@near-wallet-selector/near-wallet/assets/near-wallet-icon.png";
  const networksNear: Record<string, any> = {}; 

  const authNear: any = {}; 

  const defaultNetworkNear: any = Object.keys(networksNear)[0];

  const stateNear = ref({
    account: "",
    network: networksNear[defaultNetworkNear],
    authLoading: false,
    walletConnectType: null,
    accounts: [] as WalletInfo[],
  });

  export async function useNear() {
    const walletSelector = new WalletSelector({
      network: "testnet",
      contractId: "trustcore.testnet", 
      wallets: [
        WalletSelector.setupWallet({
          type: "near",
          iconUrl: nearWalletIconUrl,
        }),
        WalletSelector.setupWallet({
          type: "sender",
          iconUrl: senderIconUrl,
        }),
      ],
    });

    const login = async (connector: string = "injected") => {
      authNear.authLoading = true;
      const newAccounts = await walletSelector.getAccounts();
      await syncAccountState(localStorage.getItem("accountId"), newAccounts);

      authNear.authLoading = false;
    };

    const syncAccountState = async (currentAccountId: string | null, newAccounts: WalletInfo[]) => {
      if (!newAccounts.length) {
        localStorage.removeItem("accountId");
        stateNear.value.account = "";
        stateNear.value.accounts = [];

        return;
      }

      const validAccountId =
        currentAccountId &&
        newAccounts.some((x) => x.accountId === currentAccountId);
      const newAccountId = validAccountId
        ? currentAccountId
        : newAccounts[0].accountId;

      localStorage.setItem("accountId", newAccountId);
      stateNear.value.account = newAccountId;
      stateNear.value.accounts = newAccounts;
    };

    const logout = () => {
      authNear.logout();
      stateNear.value.account = "";
    };

    const loadProvider = async () => {
      try {
        if (authNear.provider.removeAllListeners && !authNear.provider.isTorus)
          authNear.provider.removeAllListeners();
        if (authNear.provider.on) {
          try {
            authNear.provider.on("chainChanged", async (chainId: any) => {
              handleChainChanged(parseInt(chainId));
            });
            authNear.provider.on("accountsChanged", async (accounts: WalletInfo[]) => {
              if (accounts.length !== 0) {
                await login();
              }
            });
          } catch (e) {
            console.log(`failed to subscribe to events for provider: ${e}`);
          }
        }
        console.log("Provider", authNear.provider);
        let network: any, accounts: WalletInfo[] = [];
        try {
          const connector = authNear.provider.value?.connectorName;
        } catch (e) {
          console.log(e);
        }
        console.log("Network", network);
        console.log("Accounts", accounts);
        handleChainChanged(network.chainId);
        const acc = accounts.length > 0 ? accounts[0] : null;

        stateNear.value.account = acc;
        stateNear.value.walletConnectType = authNear.provider?.wc?.peerMeta?.name || null;
      } catch (e) {
        stateNear.value.account = "";
        return Promise.reject(e);
      }
    };

    const handleChainChanged = (chainId: number) => {
      if (!networksNear[chainId]) {
        networksNear[chainId] = {
          ...networksNear[Object.keys(networksNear)[0]],
          chainId,
          name: "Unknown",
          network: "unknown",
          unknown: true,
        };
      }
      stateNear.value.network = networksNear[chainId];
    };

    return {
      login,
      logout,
      loadProvider,
      handleChainChanged,
      near: stateNear.value,
    };
  }
