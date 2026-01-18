/**
 * useAsync Hook
 *
 * Generic hook for managing async operations with automatic state handling.
 * Handles loading, error, and data states for any async function.
 * Supports automatic retry, cancellation on unmount, and success/error callbacks.
 *
 * @example
 * const { data, loading, error, execute } = useAsync(fetchData, {
 *   immediate: true,
 *   onSuccess: (data) => console.log('Success!', data),
 *   onError: (error) => console.error('Failed:', error)
 * });
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: number;
  retryDelay?: number;
}

interface UseAsyncReturn<T, Args extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<void>;
  reset: () => void;
}

export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const {
    immediate = false,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track current retry attempt
  const retryCountRef = useRef(0);
  // Store initial args for immediate execution
  const initialArgsRef = useRef<Args | null>(null);

  /**
   * Execute the async function with retry logic
   */
  const execute = useCallback(
    async (...args: Args) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);
      retryCountRef.current = 0;

      const attemptExecution = async (attemptNumber: number): Promise<void> => {
        try {
          const result = await asyncFunction(...args);

          if (!isMountedRef.current) return;

          setData(result);
          setLoading(false);
          onSuccess?.(result);
        } catch (err) {
          if (!isMountedRef.current) return;

          const error = err instanceof Error ? err : new Error(String(err));

          // Retry logic
          if (attemptNumber < retry) {
            retryCountRef.current = attemptNumber + 1;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return attemptExecution(attemptNumber + 1);
          }

          // Failed after all retries
          setError(error);
          setLoading(false);
          onError?.(error);
        }
      };

      await attemptExecution(0);
    },
    [asyncFunction, retry, retryDelay, onSuccess, onError]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;

    setData(null);
    setLoading(false);
    setError(null);
    retryCountRef.current = 0;
  }, []);

  /**
   * Execute immediately on mount if requested
   */
  useEffect(() => {
    if (immediate && initialArgsRef.current === null) {
      // Store empty args for immediate execution
      initialArgsRef.current = [] as unknown as Args;
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
