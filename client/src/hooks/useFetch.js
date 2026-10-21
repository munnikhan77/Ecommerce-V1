import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data from an api function and tracks loading / error.
 *   const { data, loading, error, reload } = useFetch(() => api.getProducts({ sort }), [sort]);
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps);

  const reload = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(reload, [reload]);

  return { ...state, reload };
}
