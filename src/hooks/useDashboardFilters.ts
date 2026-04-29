import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedNeighborhoods = useMemo(() => {
    const bairros = searchParams.get('bairros');
    return bairros ? bairros.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const selectedTypes = useMemo(() => {
    const tipos = searchParams.get('tipos');
    return tipos ? tipos.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const useRealData = useMemo(() => {
    const dataMode = searchParams.get('modo');
    return dataMode ? dataMode === 'real' : true;
  }, [searchParams]);

  const toggleNeighborhood = (name: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const current = newParams.get('bairros');
      let arr = current ? current.split(',').filter(Boolean) : [];
      
      if (arr.includes(name)) {
        arr = arr.filter((n) => n !== name);
      } else {
        arr.push(name);
      }

      if (arr.length > 0) {
        newParams.set('bairros', arr.join(','));
      } else {
        newParams.delete('bairros');
      }
      return newParams;
    });
  };

  const clearNeighborhoods = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('bairros');
      return newParams;
    });
  };

  const setNeighborhoods = (names: string[]) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (names.length > 0) {
        newParams.set('bairros', names.join(','));
      } else {
        newParams.delete('bairros');
      }
      return newParams;
    });
  };

  const toggleType = (type: string, allTypes: string[]) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const current = newParams.get('tipos');
      let arr = current ? current.split(',').filter(Boolean) : [];

      // If empty it means "all selected", so initializing it with all types minus the one to toggle
      if (arr.length === 0) {
        arr = allTypes;
      }

      if (arr.includes(type)) {
        arr = arr.filter((t) => t !== type);
      } else {
        arr.push(type);
      }

      // If all are selected, just clear the param to keep URL clean
      if (arr.length === allTypes.length) {
        newParams.delete('tipos');
      } else if (arr.length > 0) {
        newParams.set('tipos', arr.join(','));
      } else {
        // If everything is unselected, maybe set it to a special "none" or just leave it. 
        // We'll set it to "none" so it doesn't default to all.
        newParams.set('tipos', 'none'); 
      }
      return newParams;
    });
  };

  const setRealDataMode = (isReal: boolean) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (isReal) {
        newParams.delete('modo'); // Default
      } else {
        newParams.set('modo', 'simulado');
      }
      return newParams;
    });
  };

  // Ensure "none" is treated as empty list explicitly
  const safeSelectedTypes = selectedTypes.includes('none') && selectedTypes.length === 1 ? [] : selectedTypes;

  return {
    selectedNeighborhoods,
    toggleNeighborhood,
    clearNeighborhoods,
    selectedTypes: safeSelectedTypes,
    toggleType,
    useRealData,
    setRealDataMode
  };
}
