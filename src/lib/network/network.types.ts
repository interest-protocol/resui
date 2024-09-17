import type { Network } from "@mysten/suins";

export interface NetworkConfig {
  ns?: Network;
  rpc?: string;
  network: string;
}

export interface NetworkContext {
  network: string;
  changeNetwork: (network: string) => void;
}

export interface NetworkProviderProps {
  defaultNetwork: string;
  networks: ReadonlyArray<NetworkConfig>;
  onChangeNetwork?: (network: string) => void;
}
