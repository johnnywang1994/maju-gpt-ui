import { useRef, useEffect, DependencyList } from 'react';

export default function useUpdate(callback: any, deps: DependencyList) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return callback();
    initialized.current = true;
  }, deps);
}
