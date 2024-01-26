import { Dispatch, useState } from 'react';

export default function useInput<T>(initialValue: T): [T, any, Dispatch<T>] {
  const [input, setInput] = useState<T>(initialValue);

  const handleInput = (event: any) => {
    setInput(event.target.value);
  };

  return [input, handleInput, setInput];
}