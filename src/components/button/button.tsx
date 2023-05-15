import {h, VNode} from 'preact';
import {useCallback, useRef, useEffect} from 'preact/hooks';
import {A11yWrapper, OnClickEvent} from '@playkit-js/common/dist/hoc/a11y-wrapper';
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

  const handleClick = useCallback(
    (e: OnClickEvent, byKeyboard?: boolean) => {
      onClick(Boolean(byKeyboard));
    },
    [onClick]
  );

  const buttonProps: Record<string, any> = {
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
    <A11yWrapper onClick={handleClick}>
      <div {...buttonProps}>
        {tooltip ? (
          <Tooltip label={tooltip.label} type={tooltip.type}>
            {children}
          </Tooltip>
        ) : (
          children
        )}
      </div>
    </A11yWrapper>
  );
};
