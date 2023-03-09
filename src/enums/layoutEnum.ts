export enum Layout {
  PIP = 'PIP',
  PIPInverse = 'PIPInverse',
  SingleMedia = 'SingleMedia',
  SingleMediaInverse = 'SingleMediaInverse',
  SideBySide = 'SideBySide',
  SideBySideInverse = 'SideBySideInverse',
  Hidden = 'Hidden'
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

export enum StreamMode{
  Primary = 'Primary',
  Secondary = 'Secondary'
}
