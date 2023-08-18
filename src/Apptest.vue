<template>
    <main class="container is-max-desktop mt-4">
      <header class="section hero mt-4">
        <h1 class="title"></h1>
        <button v-if="account" @click="handleSignOut">Log out</button>
        <button v-else @click="handleSignIn">Log in</button>
      </header>
      <template v-if="account">
        <Form :onSubmit="onSubmit" :currentUser="account" :isLoading="isLoading" />
      </template>
      <template v-else>
        <SignIn />
      </template>
    </main>
  </template>
  
  <script>
  import 'regenerator-runtime/runtime';
  import { ref, onMounted } from 'vue';
  import { providers, utils } from 'near-api-js';
  
  import Form from './components/Form.vue';
  import SignIn from './components/SignIn.vue';
  import Loading from './components/Loading.vue';
  
  import { useWalletSelector } from './contexts/WalletSelectorContext';
  
  const SUGGESTED_DONATION = '0';
  const BOATLOAD_OF_GAS = Big(3)
    .times(10 ** 13)
    .toFixed();
  
  export default {
    components: {
      Form,
      SignIn,
      Loading,
    },
    setup() {
      const { selector, accountId } = useWalletSelector();
      const account = ref(null);
      const messages = ref([]);
      const isLoading = ref(false);
  
      const getAccount = async () => {
        if (!accountId.value) {
          return null;
        }
  
        const { nodeUrl } = selector.network;
        const provider = new providers.JsonRpcProvider({ url: nodeUrl });
  
        return provider
          .query({
            request_type: 'view_account',
            finality: 'final',
            account_id: accountId.value,
          })
          .then((data) => ({
            ...data,
            account_id: accountId.value,
          }));
      };
  
      const getMessages = () => {
        const provider = new providers.JsonRpcProvider({
          url: selector.network.nodeUrl,
        });
  
        return provider
          .query({
            request_type: 'call_function',
            account_id: selector.getContractId(),
            method_name: 'getMessages',
            args_base64: '',
            finality: 'optimistic',
          })
          .then((res) => JSON.parse(Buffer.from(res.result).toString()));
      };
  
      onMounted(async () => {
        if (!accountId.value) {
          account.value = null;
          return;
        }
  
        isLoading.value = true;
        try {
          const nextAccount = await getAccount();
          account.value = nextAccount;
        } finally {
          isLoading.value = false;
        }
      });
  
      onMounted(async () => {
        const nextMessages = await getMessages();
        messages.value = nextMessages;
      });
  
      const handleSignIn = () => {
        selector.show();
      };
  
      const handleSignOut = async () => {
        try {
          await selector.signOut();
        } catch (err) {
          console.log('Failed to sign out');
          console.error(err);
        }
      };
  
      const onSubmit = async (e) => {
        e.preventDefault();
  
        if (isLoading.value) {
          return;
        }
  
        const { fieldset, message, donation } = e.target.elements;
  
        fieldset.disabled = true;
  
        isLoading.value = true;
  
        try {
          const signedTransaction = await selector.signAndSendTransaction({
            signerId: accountId.value,
            actions: [
              {
                type: 'FunctionCall',
                params: {
                  methodName: 'addMessage',
                  args: { text: message.value },
                  gas: BOATLOAD_OF_GAS,
                  deposit: utils.format.parseNearAmount(donation.value || '0'),
                },
              },
            ],
          });
  
          const nextMessages = await getMessages();
          messages.value = nextMessages;
  
          message.value = '';
          donation.value = SUGGESTED_DONATION;
          fieldset.disabled = false;
          message.focus();
        } catch (err) {
          alert('Failed to add message');
          console.log('Failed to add message');
          throw err;
        } finally {
          isLoading.value = false;
        }
      };
  
      return {
        account,
        isLoading,
        handleSignIn,
        handleSignOut,
        onSubmit,
      };
    },
  };
  </script>