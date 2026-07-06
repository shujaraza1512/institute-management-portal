import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

// One shared data-fetching pattern for every student (and later teacher/
// admin) page: call it with an endpoint, get back { data, loading, error,
// refetch }. Centralizing this means every page shows loading/error states
// the same way instead of each one reinventing it slightly differently.
function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(endpoint);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
