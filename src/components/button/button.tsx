import {h, VNode} from 'preact';
import {useCallback} from 'preact/hooks';
const {Tooltip} = KalturaPlayer.ui.components;

interface ButtonProps {
  onClick: () => void;
  className: string;
  children: VNode;
  tooltip?: {
    label: string,
    type: string
  };
}

export const Button = ({onClick, className, children, tooltip}: ButtonProps) => {
  const _handleClick = useCallback(
    (e: Event) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );
  if (tooltip) {
    return (
      <div className={className} onMouseUp={_handleClick} role="button">
        <Tooltip label={tooltip.label} type={tooltip.type}>
          {children}
        </Tooltip>
      </div>
    );
  }
  return (
    <div className={className} onMouseUp={_handleClick} role="button">
      {children}
    </div>
  );
};
