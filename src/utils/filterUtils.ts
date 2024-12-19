import { CryptoData } from '../types';

export const filterCryptoData = (
  data: CryptoData[],
  marketCapRange: number,
  searchTerm: string
): CryptoData[] => {
  const filteredByRange = data.slice(0, marketCapRange);
  
  if (!searchTerm) {
    return filteredByRange;
  }

  const term = searchTerm.toLowerCase();
  return filteredByRange.filter(coin => 
    coin.name.toLowerCase().includes(term) || 
    coin.symbol.toLowerCase().includes(term)
  );
};