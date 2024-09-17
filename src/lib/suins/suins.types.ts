import type { Network, SuinsClient } from '@mysten/suins';
import { NetworkConfig, NetworkProviderProps } from '../network/network.types';

export interface ISuiNsContext {
  loading: boolean;
  suinsClient: SuinsClient;
  names: Record<string, string[]>;
  images: Record<string, string>;
}

export type SuiNSProviderProps = Pick<NetworkProviderProps, 'networks'>;
