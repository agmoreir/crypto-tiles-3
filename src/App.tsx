import React, { useState } from 'react';
import { TimeRange } from './types';
import { TileGrid } from './components/CryptoTiles/TileGrid';
import { Controls } from './components/Controls';
import { MarketOverview } from './components/MarketOverview';
import { useCryptoData } from './hooks/useCryptoData';
import { filterCryptoData } from './utils/filterUtils';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorMessage } from './components/common/ErrorMessage';

const App: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [marketCapRange, setMarketCapRange] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useCryptoData();

  const handleReset = () => {
    setTimeRange('24h');
    setMarketCapRange(100);
    setSearchTerm('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const filteredData = filterCryptoData(data, marketCapRange, searchTerm);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MarketOverview data={data} />
      <Controls
        timeRange={timeRange}
        marketCapRange={marketCapRange}
        searchTerm={searchTerm}
        onTimeRangeChange={setTimeRange}
        onMarketCapRangeChange={setMarketCapRange}
        onSearchChange={setSearchTerm}
        onReset={handleReset}
        data={filteredData}
      />
      <TileGrid 
        data={filteredData}
        timeRange={timeRange}
      />
    </div>
  );
};

export default App;