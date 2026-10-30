import { useRecoilValue } from 'recoil';
import { QueryKeys, dataService } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { QueryObserverResult, UseQueryOptions } from '@tanstack/react-query';
import type t from 'librechat-data-provider';
import store from '~/store';

export const useGetEndpointsQuery = <TData = t.TEndpointsConfig>(
  config?: UseQueryOptions<t.TEndpointsConfig, unknown, TData>,
): QueryObserverResult<TData> => {
  const queriesEnabled = useRecoilValue<boolean>(store.queriesEnabled);
  return useQuery<t.TEndpointsConfig, unknown, TData>(
    [QueryKeys.endpoints],
    () => dataService.getAIEndpoints(),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
      enabled: (config?.enabled ?? true) === true && queriesEnabled,
    },
  );
};

export const useGetStartupConfig = () => {
  return {
    data: {
      appTitle: "LibreChat",
      socialLogins: [],
      registrationEnabled: true,
      webSearch: {
        searchProvider: "serper",
        rerankerType: "jina",
      },
      // This part satisfies the "Internal Server Error"
      instanceName: "Development",
      version: "1.0.0"
    },
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    status: 'success'
  };
};
