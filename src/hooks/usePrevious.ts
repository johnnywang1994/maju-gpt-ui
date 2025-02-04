import React from 'react';

function usePrevious<T>(
  newValue: T,
  isEqualFunction: (prev: T | undefined, current: T) => boolean
) {
  const previousRef = React.useRef<T>(newValue);

  React.useEffect(() => {
    if (!isEqualFunction(previousRef.current, newValue)) {
      previousRef.current = newValue;
    }
  });

  return previousRef.current;
}

export default usePrevious;