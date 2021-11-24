import {h, VNode} from 'preact';
import {useCallback} from 'preact/hooks';
const {Tooltip} = KalturaPlayer.ui.components;

interface ButtonProps {
  onClick: () => void;
  className?: string;
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
  const _handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === KalturaPlayer.ui.utils.KeyMap.ENTER) {
      _handleClick(e);
    }
  }, []);
  const buttonProps: Record<string, any> = {
    onMouseUp: _handleClick,
    onKeyDown: _handleKeyDown,
    role: 'button',
    tabIndex: 0
  };
  if (className) {
    buttonProps.className = className;
  }
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
