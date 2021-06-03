import {h, Component, cloneElement, VNode} from 'preact';
const {
  redux: {connect},
  components: {PLAYER_SIZE}
} = KalturaPlayer.ui;

const HIDE_BUTTON_MODES = [PLAYER_SIZE.EXTRA_SMALL, PLAYER_SIZE.SMALL, PLAYER_SIZE.TINY];
const MIN_SIZES = [PLAYER_SIZE.EXTRA_SMALL, PLAYER_SIZE.SMALL];

interface ResponsiveManagerOwnProps {
  children: VNode;
  onMinSize: () => void;
  onDefaultSize: () => void;
}
interface ResponsiveManagerConnectProps {
  playerSize?: string;
}

type ResponsiveManagerProps = ResponsiveManagerOwnProps & ResponsiveManagerConnectProps;

const mapStateToProps = (state: Record<string, any>) => ({
  playerSize: state.shell.playerSize
});
@connect(mapStateToProps)
export class ResponsiveManager extends Component<ResponsiveManagerProps> {
  componentDidUpdate(prevProps: ResponsiveManagerProps) {
    const {playerSize, onMinSize, onDefaultSize} = this.props;
    if (playerSize === PLAYER_SIZE.TINY) {
      return;
    }
    if (MIN_SIZES.includes(playerSize!) && !MIN_SIZES.includes(prevProps.playerSize!)) {
      onMinSize();
      return;
    }
    if (!MIN_SIZES.includes(playerSize!) && MIN_SIZES.includes(prevProps.playerSize!)) {
      onDefaultSize();
    }
  }
  private _renderChildComponent = (): VNode => {
    const {children, playerSize} = this.props;
    return cloneElement(children, {hideButtons: HIDE_BUTTON_MODES.includes(playerSize!)});
  };
  render({playerSize}: ResponsiveManagerProps) {
    return playerSize === PLAYER_SIZE.TINY ? null : this._renderChildComponent();
  }
}
