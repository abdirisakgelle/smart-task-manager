import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Smart Polling Hook with Exponential Backoff and Error Handling
 * 
 * @param {Function} fetchFunction - The function to call for polling
 * @param {number} baseInterval - Base interval in milliseconds
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.maxInterval - Maximum interval in milliseconds (default: 5 minutes)
 * @param {boolean} options.enabled - Whether polling is enabled (default: true)
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.onSuccess - Success callback function
 * @returns {Object} - Polling state and controls
 */
export const useSmartPolling = (
  fetchFunction,
  baseInterval,
  options = {}
) => {
  const {
    maxRetries = 3,
    maxInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    onError,
    onSuccess
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [lastSuccess, setLastSuccess] = useState(null);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Calculate current interval with exponential backoff
  const getCurrentInterval = useCallback(() => {
    const backoffMultiplier = Math.pow(2, retryCount);
    const calculatedInterval = baseInterval * backoffMultiplier;
    return Math.min(calculatedInterval, maxInterval);
  }, [baseInterval, retryCount, maxInterval]);

  // Reset polling state
  const resetPolling = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    setLastSuccess(null);
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    if (!enabled || isPolling) return;

    stopPolling();
    resetPolling();
    setIsPolling(true);

    const poll = async () => {
      if (!enabled) return;

      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const result = await fetchFunction(abortControllerRef.current.signal);
        
        // Success - reset retry count and call success callback
        setRetryCount(0);
        setLastError(null);
        setLastSuccess(new Date());
        
        if (onSuccess) {
          onSuccess(result);
        }
        
      } catch (error) {
        // Don't handle aborted requests
        if (error.name === 'AbortError') return;
        
        console.error('Polling error:', error);
        setLastError(error);
        
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        if (onError) {
          onError(error, newRetryCount);
        }
        
        // Stop polling if max retries reached
        if (newRetryCount >= maxRetries) {
          console.warn(`Polling stopped after ${maxRetries} retries`);
          stopPolling();
          return;
        }
      }
    };

    // Initial call
    poll();
    
    // Set up interval for subsequent calls
    const currentInterval = getCurrentInterval();
    intervalRef.current = setInterval(poll, currentInterval);
  }, [enabled, isPolling, fetchFunction, retryCount, maxRetries, onError, onSuccess, getCurrentInterval, stopPolling, resetPolling]);

  // Effect to manage polling lifecycle
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Effect to restart polling when retry count changes (for interval adjustment)
  useEffect(() => {
    if (enabled && isPolling && intervalRef.current) {
      const currentInterval = getCurrentInterval();
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        try {
          abortControllerRef.current = new AbortController();
          const result = await fetchFunction(abortControllerRef.current.signal);
          
          setRetryCount(0);
          setLastError(null);
          setLastSuccess(new Date());
          
          if (onSuccess) {
            onSuccess(result);
          }
        } catch (error) {
          if (error.name === 'AbortError') return;
          
          setLastError(error);
          const newRetryCount = retryCount + 1;
          setRetryCount(newRetryCount);
          
          if (onError) {
            onError(error, newRetryCount);
          }
          
          if (newRetryCount >= maxRetries) {
            stopPolling();
          }
        }
      }, currentInterval);
    }
  }, [retryCount, getCurrentInterval, enabled, isPolling, fetchFunction, maxRetries, onError, onSuccess, stopPolling]);

  return {
    isPolling,
    retryCount,
    lastError,
    lastSuccess,
    currentInterval: getCurrentInterval(),
    startPolling,
    stopPolling,
    resetPolling
  };
}; 