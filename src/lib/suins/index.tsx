import { useAccounts, useSuiClient } from '@mysten/dapp-kit';
import { fromPairs, pathOr, prop } from 'ramda';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ISuiNsContext, SuiNSProviderProps } from './suins.types';
import { useNetwork } from '../network/network.hooks';
import React from 'react';

const suiNsContext = createContext<ISuiNsContext>({} as ISuiNsContext);

export const SuiNsProvider: FC<PropsWithChildren<SuiNSProviderProps>> = ({
  children,
  suiNSClient,
}) => {
  const network = useNetwork();
  const accounts = useAccounts();
  const suiClient = useSuiClient();
  const { Provider } = suiNsContext;
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<Record<string, string[]>>({});
  const [nsImages, setNsImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (accounts.length) {
      setLoading(true);

      const promises = Promise.all(
        accounts.map((acc) =>
          suiClient.resolveNameServiceNames({
            address: acc.address,
          })
        )
      );

      promises
        .then(async (names) => {
          setNames(
            names.reduce(
              (acc, elem, index) => {
                const account = accounts[index];

                return {
                  ...acc,
                  [account.address]: elem.data,
                };
              },
              {} as Record<string, string[]>
            )
          );

          const images: ReadonlyArray<[string | null, string | null]> =
            await Promise.all(
              names.map(async (name) => {
                if (!name || !name.data.length) return [null, null];

                return suiNSClient
                  .getNameRecord(name.data[0])
                  .then(async (object) => {
                    const nftId = prop('nftId', object as any);

                    if (!nftId) return [name.data[0], null];

                    const nft = await suiClient.getObject({
                      id: nftId,
                      options: { showDisplay: true },
                    });

                    const imageUrl = pathOr(
                      null,
                      ['data', 'display', 'data', 'image_url'],
                      nft
                    ) as string | null;

                    return [name.data[0], imageUrl];
                  });
              })
            );

          setNsImages(
            fromPairs(
              images.filter(
                (image) => !!image.length && !!image[0] && !!image[1]
              ) as ReadonlyArray<[string, string]>
            )
          );
        })
        .catch()
        .finally(() => setLoading(false));
    }
  }, [network, accounts]);

  const value = {
    names,
    loading,
    images: nsImages,
    suinsClient: suiNSClient,
  };

  return <Provider value={value}>{children}</Provider>;
};

export const useSuiNs = () => useContext(suiNsContext);

export default suiNsContext;
