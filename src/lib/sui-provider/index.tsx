import { WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type FC, type PropsWithChildren } from 'react';

import { NetworkProvider } from '../network';
import { SuiNsProvider } from '../suins';
import { SuiProviderProps } from './sui-provider.types';

const SuiProvider: FC<PropsWithChildren<SuiProviderProps>> = ({
  wallet,
  children,
  networks,
  queryConfig,
  defaultNetwork,
  onChangeNetwork,
}) => (
  <QueryClientProvider client={new QueryClient(queryConfig)}>
    <NetworkProvider
      networks={networks}
      defaultNetwork={defaultNetwork}
      onChangeNetwork={onChangeNetwork}
    >
      <WalletProvider {...wallet}>
        <SuiNsProvider networks={networks}>{children}</SuiNsProvider>
      </WalletProvider>
    </NetworkProvider>
  </QueryClientProvider>
);

export default SuiProvider;
