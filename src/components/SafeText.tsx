import { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren & {
  testId?: string;
  className?: string;
};

const SafeText: FC<Props> = ({ children, testId, className }) => {
  return (
    <div
      style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
      className={className ?? ''}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default SafeText;
