import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { FC } from 'react';
import useSWR from 'swr';

import { CoinsMap } from './coins-manager.types';
import { useNetwork } from '../../network/network.hooks';
import { useCoins } from '../web3-manager.hooks';
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { chunk, isSui } from '../../utils';
import { CoinMetadataWithType } from '../../types';
import { fetchCoinMetadata } from '../../utils/metadata';

const CoinsManager: FC = () => {
  const network = useNetwork();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { id, delay, addCoins, setCoins, updateLoading, updateError } =
    useCoins();

  useSWR(
    `${[id, network, currentAccount?.address, CoinsManager.name]}`,
    async () => {
      try {
        updateError(false);
        updateLoading(true);

        if (!currentAccount?.address) return;

        setCoins({} as CoinsMap);

        const coinsRawAll = await suiClient.getAllBalances({
          owner: currentAccount.address,
        });

        if (!coinsRawAll.length) return;

        for (const coinsRaw of chunk(coinsRawAll, 250)) {
          const coinsType = [
            ...new Set(coinsRaw.map(({ coinType }) => coinType)),
          ];

          const dbCoinsMetadata: Record<string, CoinMetadataWithType> =
            await fetchCoinMetadata({ types: coinsType, network }).then(
              (data: ReadonlyArray<CoinMetadataWithType>) =>
                data.reduce(
                  (acc, item) => ({
                    ...acc,
                    [normalizeStructTag(item.type)]: {
                      ...item,
                      type: normalizeStructTag(item.type),
                    },
                  }),
                  {}
                )
            );

          const filteredCoinsRaw = coinsRaw.filter(
            ({ coinType }) => dbCoinsMetadata[normalizeStructTag(coinType)]
          );

          if (!filteredCoinsRaw.length) {
            setCoins({} as CoinsMap);
            return;
          }

          const coinsMap = filteredCoinsRaw.reduce(
            (acc, { coinType, totalBalance, coinObjectCount }) => {
              const type = normalizeStructTag(coinType) as `0x${string}`;
              const { symbol, decimals, ...metadata } = dbCoinsMetadata[type];

              if (isSui(type))
                return {
                  ...acc,
                  [SUI_TYPE_ARG as `0x${string}`]: {
                    decimals,
                    metadata,
                    symbol: 'MOVE',
                    coinObjectCount,
                    balance: totalBalance,
                    type: SUI_TYPE_ARG as `0x${string}`,
                  },
                };

              return {
                ...acc,
                [type]: {
                  type,
                  symbol,
                  decimals,
                  metadata,
                  coinObjectCount,
                  balance: totalBalance,
                },
              };
            },
            {} as CoinsMap
          );

          addCoins(coinsMap);
        }
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
