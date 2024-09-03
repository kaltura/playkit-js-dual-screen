import {h, createRef, Component, Fragment, RefObject} from 'preact';
import * as styles from './pip-minimized.scss';
import {icons} from '../../icons';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {ButtonsEnum} from '../../enums';
import {MultiscreenPlayer} from '../../types';
const {
  components: {Icon}
} = KalturaPlayer.ui;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = () => {
  return {
    showLabel: <Text id="dualScreen.show">Show</Text>,
    showAriaLabel: <Text id="dualScreen.show_label">Show dual screen</Text>,
    switchScreen: <Text id="dualScreen.switch_screen">Switch Screen</Text>
  };
};

interface PIPMinimizedOwnProps {
  players: MultiscreenPlayer[];
  show: OnClick;
  hideButtons?: boolean;
  focusOnButton?: ButtonsEnum;
}
interface PIPMinimizedConnectProps {
  playerSize?: string;
}
interface PIPMinimizedTranslates {
  showLabel?: string;
  showAriaLabel?: string;
  switchScreen?: string;
}
type PIPMinimizedProps = PIPMinimizedOwnProps & PIPMinimizedConnectProps & PIPMinimizedTranslates;

@withText(translates)
export class PipMinimized extends Component<PIPMinimizedProps> {
  _multiscreenPlayersRefs: Array<RefObject<HTMLDivElement>> = [];

  componentDidMount() {
    this._multiscreenPlayersRefs.forEach((ref, index) => {
      const videoElement = this.props.players[index].player.getVideoElement();
      videoElement.tabIndex = -1;
      videoElement.setAttribute('disablePictureInPicture', 'true');
      ref.current!.prepend(videoElement);
    });
  }

  private _renderHoverButton = () => {
    const {show, hideButtons, focusOnButton} = this.props;
    return (
      <Fragment>
        {!hideButtons && (
          <Button
            onClick={show}
            className={styles.showContainer}
            ariaLabel={this.props.showAriaLabel}
            focusOnMount={focusOnButton === ButtonsEnum.Show}
            testId="dualscreen_switchToPIP"
            type={ButtonType.translucent}>
            <Fragment>
              <div className={styles.iconContainer}>
                <Icon
                  id="dualscreen-pip-minimized-show"
                  height={icons.SmallSize}
                  width={icons.SmallSize}
                  viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
                  path={icons.SHOW_ICON_PATH}
                />
              </div>
              {this.props.showLabel}
            </Fragment>
          </Button>
        )}
      </Fragment>
    );
  };

  render(props: PIPMinimizedProps) {
    return (
      <div className={styles.childPlayerContainer} data-testid="dualscreen_pipMinimized">
        {this.props.players.map((player, index) => {
          const ref = createRef<HTMLDivElement>();
          this._multiscreenPlayersRefs[index] = ref;
          return (
            <div
              ref={ref}
              className={[styles.childPlayer, props.hideButtons ? styles.tinyChildPlayer : ''].join(' ')}
              data-testid="dualscreen_pipMinimizedPlayer">
              <div className={[styles.innerButtons, this.props.hideButtons ? styles.tinyInnerButtons : ''].join(' ')}>
                <Button
                  onClick={player.setPrimary}
                  focusOnMount={this.props.focusOnButton === ButtonsEnum.SwitchScreen}
                  ariaLabel={this.props.switchScreen}
                  type={ButtonType.borderless}
                  size={ButtonSize.medium}
                  icon={'switch'}
                  testId="dualscreen_switchToPrimary"
                />
              </div>
            </div>
          );
        })}
        {this._renderHoverButton()}
      </div>
    );
  }
}
