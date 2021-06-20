import {h, VNode} from 'preact';
import {useCallback} from 'preact/hooks';
const {Tooltip} = KalturaPlayer.ui.components;

interface ButtonProps {
  onClick: () => void;
  className: string;
  children: VNode;
  tooltip?: {
    label: string;
    type: string;
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
  const buttonProps: Record<string, any> = {
    className,
    onMouseUp: _handleClick,
    role: 'button'
  };
  if (tooltip) {
    buttonProps['aria-label'] = tooltip.label;
  }
  return (
    <div {...buttonProps}>
      {tooltip ? (
        <Tooltip label={tooltip.label} type={tooltip.type}>
          {children}
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
};
