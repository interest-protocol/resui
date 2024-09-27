import { CoinMetadataWithType } from "../types";

interface FetchCoinMetadataBaseArgs {
  network: string;
}

export interface FetchCoinMetadataSingleTypeArg
  extends FetchCoinMetadataBaseArgs {
  type: string;
}

export interface FetchCoinMetadataMultipleTypeArg
  extends FetchCoinMetadataBaseArgs {
  types: ReadonlyArray<string>;
}

export interface FetchCoinMetadata {
  (args: FetchCoinMetadataSingleTypeArg): Promise<CoinMetadataWithType>;
  (
    args: FetchCoinMetadataMultipleTypeArg
  ): Promise<ReadonlyArray<CoinMetadataWithType>>;
}
