import { CoinMetadata, CoinStruct, SuiClient } from '@mysten/sui/client';

export interface SimpleCoin {
  balance: bigint;
  type: `0x${string}`;
}

export type CoinsMap = Record<string, SimpleCoin>;

export type TGetAllCoins = (
  provider: SuiClient,
  account: string,
  cursor?: string | null
) => Promise<ReadonlyArray<CoinStruct>>;
