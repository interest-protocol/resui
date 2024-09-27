import { CoinObject, CoinsMap } from '../../coins-manager/coins-manager.types';

export interface UseCoinsResponse {
  id: string;
  error: boolean;
  loading: boolean;
  coinsMap: CoinsMap;
  refresh: () => void;
  delay: number | undefined;
  coins: ReadonlyArray<CoinObject>;
  setCoins: (data: CoinsMap) => void;
  addCoins: (data: CoinsMap) => void;
  updateError: (data: boolean) => void;
  updateLoading: (data: boolean) => void;
  updateDelay: (delay: number | undefined) => void;
}
