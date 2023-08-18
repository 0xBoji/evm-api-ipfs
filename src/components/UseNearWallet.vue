<template>
    <div>
      <h1>NEAR Wallet Example</h1>
      <p>Current Account: {{ account }}</p>
      <button @click="signIn">Sign In</button>
      <button @click="signOut">Sign Out</button>
    </div>
  </template>
  
  <script>
  import { useNearWallet } from '@/composables/useNearWallet'; // Import your composables
  
  export default {
    name: 'NearWalletExample',
    setup() {
      const { account, signIn, signOut } = useNearWallet(); // Destructure functions and properties
  
      return {
        account,
        signIn,
        signOut,
      };
    },
  };
  </script>
  