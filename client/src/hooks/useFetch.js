import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

// One shared data-fetching pattern for every student/teacher page: call it
// with an endpoint, get back { data, loading, error, refetch }. Passing a
// falsy endpoint (e.g. still waiting on a required filter to be chosen)
// skips the fetch entirely instead of hitting the API with a bad URL.
function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setData(null);
      setLoading(false);
      setError('');
      return;
    }
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
