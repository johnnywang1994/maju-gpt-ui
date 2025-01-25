declare module "react-copy-to-clipboard" {
  import { FC, PropsWithChildren } from "react";

  interface CopyToClipboardProps extends PropsWithChildren {
    text: string;
    onCopy: () => void;
  }

  const CopyToClipboard: FC<CopyToClipboardProps>;

  export { CopyToClipboard };
}