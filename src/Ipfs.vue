<template>
  <div>
    <button @click="handleFollow" :disabled="loadingFollow">
      {{ loadingFollow ? 'Following...' : 'Follow' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import ipfsClient from 'ipfs-http-client';

export default {
  data() {
    return {
      loadingFollow: false,
    };
  },
  methods: {
    async handleFollow() {
      if (this.loadingFollow) return;

      this.loadingFollow = true;

      try {
        const currentUserAddress = "0xeF8305E140ac520225DAf050e2f71d5fBcC543e7";

        const querySpaces = `
          query Spaces {
            spaces(
              first: 20,
              skip: 0,
              orderBy: "created",
              orderDirection: desc
            ) {
              id
              name
              about
              network
              symbol
              strategies {
                name
                network
                params
              }
              admins
              moderators
              members
              filters {
                minScore
                onlyMembers
              }
              plugins
            }
          }
        `;
        const responseSpaces = await axios.post('https://testnet.snapshot.org/graphql', { query: querySpaces });

        const queryProposals = `
          query Proposals {
            proposals(
              first: 20,
              skip: 0,
              where: {
                space_in: ["", ""],
                state: "closed"
              },
              orderBy: "created",
              orderDirection: desc
            ) {
              id
              title
              body
              choices
              start
              end
              snapshot
              state
              author
              space {
                id
                name
              }
            }
          }
        `;
        const responseProposals = await axios.post('https://testnet.snapshot.org/graphql', { query: queryProposals });

        const queryFollows = `
          query Follows($follower: String!) {
            follows(where: { follower: $follower }) {
              id
              follower
              space {
                id
              }
              created
            }
          }
        `;
        const variablesFollows = {
          follower: currentUserAddress,
        };
        const responseFollows = await axios.post('https://testnet.snapshot.org/graphql', { query: queryFollows, variables: variablesFollows });

        const queryVotes = `
          query Votes {
            votes(
              first: 1000,
              where: {
                proposal: ""
              }
            ) {
              id
              voter
              created
              choice
              space {
                id
              }
            }
          }
        `;
        const responseVotes = await axios.post('https://testnet.snapshot.org/graphql', { query: queryVotes });

        const ipfs = ipfsClient('https://api.nft.storage');
        const dataToStore = JSON.stringify({
          follows: responseFollows.data.data.follows,
          spaces: responseSpaces.data.data.spaces,
          proposals: responseProposals.data.data.proposals,
          votes: responseVotes.data.data.votes
        });
        const ipfsResult = await ipfs.add(dataToStore);

        console.log('IPFS Hash:', ipfsResult.cid.toString());

        this.loadingFollow = false;
      } catch (error) {
        console.error('Error:', error);
        this.loadingFollow = false;
      }
    },
  },
};
</script>
