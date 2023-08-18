import {
  SNAPSHOT_SUBGRAPH_URL,
  subgraphRequest
} from '@snapshot-labs/snapshot.js/src/utils';

export const contractAddress = 'c';

export async function getDelegates(network: string, address: string) {
  const params = {
    delegations: {
      __args: {
        where: {
          delegator: address.toLowerCase()
        },
        first: 1000
      },
      space: true,
      delegate: true
    }
  };
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}

export async function getDelegators(network: string, address: string) {
  const params = {
    delegations: {
      __args: {
        where: {
          delegate: address.toLowerCase()
        },
        first: 1000
      },
      delegator: true,
      space: true
    }
  };
  return await subgraphRequest(SNAPSHOT_SUBGRAPH_URL[network], params);
}
