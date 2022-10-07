import {h, VNode} from 'preact';
import {useCallback, useRef, useEffect} from 'preact/hooks';
const {Tooltip} = KalturaPlayer.ui.components;

interface ButtonProps {
  onClick: (byKeyboard: boolean) => void;
  className?: string;
  children: VNode;
  tooltip?: {
    label: string;
    type: string;
  };
  ariaLabel?: string;
  focusOnMount?: boolean;
}

export const Button = ({onClick, className, children, tooltip, ariaLabel, focusOnMount}: ButtonProps) => {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focusOnMount) {
      button.current?.focus();
    }
  }, [focusOnMount]);
  const _handleClick = useCallback(
    (e: KeyboardEvent | MouseEvent, byKeyboard = false) => {
      const {offsetX, offsetY} = (e as MouseEvent);
      const byNarrator = !offsetX && !offsetY;
      e.stopPropagation();
      onClick(byKeyboard || byNarrator);
    },
    [onClick]
  );
  const _handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === KalturaPlayer.ui.utils.KeyMap.ENTER) {
      _handleClick(e, true);
    }
  }, []);
  const buttonProps: Record<string, any> = {
    onMouseUp: _handleClick,
    onKeyDown: _handleKeyDown,
    ref: button,
    role: 'button',
    tabIndex: 0
  };
  if (className) {
    buttonProps.className = className;
  }
  if (ariaLabel || tooltip) {
    buttonProps['aria-label'] = ariaLabel || tooltip!.label;
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
