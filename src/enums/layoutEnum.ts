import {Animations} from './animation';
import {ButtonsEnum} from './buttons';

export enum Layout {
  PIP = 'PIP',
  PIPInverse = 'PIPInverse',
  SingleMedia = 'SingleMedia',
  SingleMediaInverse = 'SingleMediaInverse',
  SideBySide = 'SideBySide',
  SideBySideInverse = 'SideBySideInverse',
  Hidden = 'Hidden'
}

export enum Position {
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  TopLeft = 'top-left',
  TopRight = 'top-right'
}

export enum ExternalLayout {
  Hidden = 'locked',
  SingleMedia = 'parent-only',
  SingleMediaInverse = 'no-parent',
  PIP = 'pip-parent-in-large',
  PIPInverse = 'pip-parent-in-small',
  SideBySide = 'sbs-parent-in-left',
  SideBySideInverse = 'sbs-parent-in-right'
}

export enum ViewModeLockState {
  Locked = 'locked',
  Unlocked = 'unlocked'
}

export enum StreamMode {
  Primary = 'Primary',
  Secondary = 'Secondary'
}

export enum PlayerContainers {
  none = 'none',
  primary = 'primary',
  secondary = 'secondary'
}

export interface LayoutChangeProps {
  animation?: Animations;
  focusOnButton?: ButtonsEnum;
  force?: boolean;
}
