export function handleKeyUp(keyCode: number) {
  return (event: any, callback: () => Promise<void> | void) => {
    if (event.keyCode === keyCode) {
      callback();
    }
  };
}
