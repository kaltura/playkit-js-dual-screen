import {h, VNode} from 'preact';
import {useCallback} from 'preact/hooks';

interface ButtonProps {
  onClick: () => void;
  className: string;
  children: VNode;
}

export const Button = ({onClick, className, children}: ButtonProps) => {
  const _handleClick = useCallback(
    (e: Event) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );
  return (
    <div className={className} onMouseUp={_handleClick} role="button">
      {children}
    </div>
  );
};
