import { CoinMetadata, CoinStruct, SuiClient } from '@mysten/sui/client';

export interface CoinObject extends Pick<CoinMetadata, 'symbol' | 'decimals'> {
  balance: string;
  type: `0x${string}`;
  coinObjectCount: number;
  metadata: Omit<CoinMetadata, 'symbol' | 'decimals'>;
}

export type CoinsMap = Record<string, CoinObject>;

export type TGetAllCoins = (
  provider: SuiClient,
  account: string,
  cursor?: string | null
) => Promise<ReadonlyArray<CoinStruct>>;
