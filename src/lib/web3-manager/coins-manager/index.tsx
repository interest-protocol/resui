import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { FC } from 'react';
import useSWR from 'swr';

import { useCoins } from '../web3-manager.hooks';
import { CoinsMap, TGetAllCoins } from './coins-manager.types';
import { useNetwork } from '../../network/network.hooks';

const getAllCoins: TGetAllCoins = async (provider, account, cursor = null) => {
  const { data, nextCursor, hasNextPage } = await provider.getAllCoins({
    owner: account,
    cursor,
  });

  if (!hasNextPage) return data;

  const newData = await getAllCoins(provider, account, nextCursor);

  return [...data, ...newData];
};

const CoinsManager: FC = () => {
  const network = useNetwork();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { id, delay, updateCoins, updateLoading, updateError } = useCoins();

  useSWR(
    `${id}-${network}-${currentAccount?.address}-${CoinsManager.name}`,
    async () => {
      try {
        updateError(false);
        updateLoading(true);
        if (!currentAccount?.address) return updateCoins({} as CoinsMap);

        const coinsRaw = await getAllCoins(suiClient, currentAccount.address);

        if (!coinsRaw.length) return updateCoins({} as CoinsMap);

        const coins = coinsRaw.reduce((acc, { coinType, ...coinRaw }) => {
          const type = normalizeStructTag(coinType) as `0x${string}`;

          if (normalizeStructTag(type) === normalizeStructTag(SUI_TYPE_ARG))
            return {
              ...acc,
              [SUI_TYPE_ARG as `0x${string}`]: {
                ...acc[SUI_TYPE_ARG as `0x${string}`],
                type: SUI_TYPE_ARG as `0x${string}`,
                balance:
                  BigInt(coinRaw.balance) +
                    acc[SUI_TYPE_ARG as `0x${string}`]?.balance ?? BigInt(0),
              },
            };

          return {
            ...acc,
            [type]: {
              type,
              balance:
                BigInt(coinRaw.balance) +
                  acc[SUI_TYPE_ARG as `0x${string}`]?.balance ?? BigInt(0),
            },
          };
        }, {} as CoinsMap) as unknown as CoinsMap;

        updateCoins(coins);
      } catch {
        updateError(true);
      } finally {
        updateLoading(false);
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshInterval: delay,
    }
  );

  return null;
};

export default CoinsManager;
