import {h, createRef, Component, VNode, Fragment} from 'preact';
import * as styles from './side-by-side.scss';
import {icons} from '../../icons';
import {Button} from './../button';
import {Animations, StreamMode} from './../../enums';
const {Icon} = KalturaPlayer.ui.components;
const {connect} = KalturaPlayer.ui.redux;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = ({streamMode}: SideBySideComponentOwnProps) => {
  return {
    expandScreen:
      streamMode === StreamMode.Primary ? (
        <Text id="dualScreen.expand_primary_screen">Expand primary screen</Text>
      ) : (
        <Text id="dualScreen.expand_secondary_screen">Expand secondary screen</Text>
      )
  };
};

interface SideBySideComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  onExpand: (byKeyboard: boolean) => void;
  animation: Animations;
  focusOnButton?: boolean;
  streamMode: StreamMode;
  multiscreen: VNode;
}
interface SideBySideComponentConnectProps {
  playerWidth?: number;
  showUi?: boolean;
}
interface SideBySideComponentTranslates {
  expandScreen?: string;
}

type SideBySideComponentProps = SideBySideComponentOwnProps & SideBySideComponentConnectProps & SideBySideComponentTranslates;

const mapStateToProps = (state: Record<string, any>) => ({
  playerWidth: state.shell.guiClientRect.width,
  showUi: state.shell.playerHover || state.shell.playerNav
});

@withText(translates)
@connect(mapStateToProps)
export class SideBySide extends Component<SideBySideComponentProps> {
  ref = createRef();

  componentDidMount() {
    const videoElement = this.props.player.getVideoElement();
    videoElement.tabIndex = -1;
    this.ref.current.prepend(videoElement);
  }

  private _renderHoverButton() {
    const {onExpand, showUi, focusOnButton, multiscreen} = this.props;
    if (showUi) {
      return (
        <Fragment>
          <div className={styles.innerButtons}>
            <Button
              className={styles.iconContainer}
              onClick={onExpand}
              tooltip={{label: this.props.expandScreen!, type: 'bottom-left'}}
              focusOnMount={focusOnButton}>
              <Icon
                id="dualscreen-side-by-side-pip"
                height={icons.MediumSize}
                width={icons.MediumSize}
                viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
                path={icons.SWITCH_TO_SIDE_BY_SIDE_ICON_PATH}
              />
            </Button>
            {multiscreen}
          </div>
        </Fragment>
      );
    }
    return null;
  }

  render({playerWidth, animation}: SideBySideComponentProps) {
    const playerContainerStyles = {
      height: (playerWidth! / 2 / 16) * 9
    };
    const classNames = [styles.player];
    if (animation === Animations.ScaleLeft) {
      classNames.push(styles.animatedScale);
    } else {
      classNames.push(styles.animatedFade);
    }
    return (
      <div ref={this.ref} className={classNames.join(' ')} style={playerContainerStyles}>
        {this._renderHoverButton()}
      </div>
    );
  }
}
