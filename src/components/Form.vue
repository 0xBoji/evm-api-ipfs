<template>
  <form @submit.prevent="onSubmit">
  </form>
</template>

<script>
import { ref } from 'vue';
import PropTypes from 'prop-types';

export default {
  name: 'MessageForm',
  props: {
    onSubmit: PropTypes.func.isRequired,
    currentUser: PropTypes.shape({
      accountId: PropTypes.string.isRequired,
      balance: PropTypes.string.isRequired,
    }),
    isLoading: PropTypes.bool.isRequired,
  },
  setup(props) {
    const message = ref('');
    const donation = ref('');

    const handleSubmit = () => {
      props.onSubmit(message.value, donation.value);
    };
    
    return {
      message,
      donation,
      handleSubmit,
    };
  },
};
</script>
