import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook to automatically open a modal based on a URL search parameter.
 * 
 * @param {string} paramName - The name of the query parameter to check (default: 'add')
 * @param {string} expectedValue - The value that triggers opening the modal (default: 'true')
 * @param {Function} onOpen - Callback to set the modal open state
 */
export const useAutoOpenModal = (onOpen, paramName = 'add', expectedValue = 'true') => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get(paramName) === expectedValue) {
      // Trigger the opening callback
      onOpen(true);
      
      // Clean up the URL only if the parameter exists
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(paramName);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, onOpen, paramName, expectedValue]);
};

export default useAutoOpenModal;
