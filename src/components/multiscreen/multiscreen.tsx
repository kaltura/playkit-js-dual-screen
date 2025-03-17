import {h, Component, RefObject, createRef} from 'preact';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {OnClickEvent} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {Position} from '../../enums';
import {PlaykitUI} from '@playkit-js/kaltura-player-js';
import {MultiscreenPlayer} from '../../types';
import * as styles from './multiscreen.scss';

const {Tooltip} = KalturaPlayer.ui.components;
const {withEventManager} = KalturaPlayer.ui.Event;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const CLOSE_EVENT = 'closeMultiScreenPopup';

const translates = {
  multiscreenLabel: <Text id="dualScreen.multiscreen">Show more screens</Text>,
  switchScreen: <Text id="dualScreen.switch_screen">Switch Screen</Text>,
  switchToSecondary: <Text id="dualScreen.switch_to_secondary_screen">Switch to secondary screen</Text>,
  switchToPrimary: <Text id="dualScreen.switch_to_primary_screen">Switch to primary screen</Text>
};
interface MultiscreenProps {
  players: Array<MultiscreenPlayer>;
  sbsLayout?: boolean;
  eventManager?: PlaykitUI.EventManager;
  multiscreenLabel?: string;
  switchScreen?: string;
  switchToSecondary?: string;
  switchToPrimary?: string;
  getParentRef?: () => RefObject<HTMLDivElement>;
  getPosition?: () => Position;
}
interface MultiscreenState {
  isOpen: boolean;
  xPosition: number;
}

let focusOnMultiscreenButton = false;

@withText(translates)
@withEventManager
export class Multiscreen extends Component<MultiscreenProps, MultiscreenState> {
  private _multiscreenPlayersRefs: Array<RefObject<HTMLDivElement>> = [];
  private _multiscreenPlayersWrapperRef = createRef<HTMLDivElement>();

  state = {isOpen: false, xPosition: 0};

  componentDidMount(): void {
    this._attachVideoElements();
    if (this.props.getParentRef) {
      const parentRef = this.props.getParentRef().current!;
      this.props.eventManager?.listen(parentRef, CLOSE_EVENT, this._closePupup);
    }
  }

  componentDidUpdate(previousProps: Readonly<MultiscreenProps>, previousState: Readonly<MultiscreenState>): void {
    if (!previousState.isOpen && this.state.isOpen) {
      if (this.props.sbsLayout) {
        // re-attach video elements for SbS layout
        this._attachVideoElements();
      }
      if (this.props.getParentRef && this.props.getPosition) {
        // check if multiscreen container inside PiP container for left positons
        if ([Position.TopLeft, Position.BottomLeft].includes(this.props.getPosition())) {
          const parentLeftPostion = this.props.getParentRef().current?.getBoundingClientRect().left || 0;
          const multiscreenLeftPostion = this._multiscreenPlayersWrapperRef.current?.getBoundingClientRect().left || 0;
          const rightShift = multiscreenLeftPostion - parentLeftPostion;
          if (rightShift < 0) {
            this.setState({xPosition: rightShift});
          }
        } else if (this.state.xPosition !== 0) {
          this.setState({xPosition: 0});
        }
      }
    }
  }

  componentWillUnmount() {
    this._multiscreenPlayersRefs = [];
  }

  private _attachVideoElements = () => {
    this._multiscreenPlayersRefs.forEach((ref, index) => {
      const videoElement = this.props.players[index].player.getVideoElement();
      videoElement.tabIndex = -1;
      ref.current!.prepend(videoElement);
    });
  };

  private _closePupup = () => {
    this.setState({isOpen: false});
    this.props.eventManager?.unlisten(document, 'click', this._closePupup);
  };

  private _openPopup = () => {
    this.props.eventManager?.listenOnce(document, 'click', this._closePupup);
    this.setState({isOpen: true});
  };

  private _handleClick = (event: OnClickEvent, byKeyboard = false) => {
    event.stopPropagation();
    focusOnMultiscreenButton = byKeyboard;
    if (this.props.getParentRef) {
      // a11y wrapper prevents propagation of click event, so parent node uses to handle close
      this.props.getParentRef().current?.dispatchEvent(new Event(CLOSE_EVENT));
    }
    if (!this.state.isOpen) {
      this._openPopup();
    }
  };

  private _handleLayoutChange = (byKeyboard: boolean, cb: () => void) => {
    if (byKeyboard) {
      focusOnMultiscreenButton = byKeyboard;
    }
    cb();
  };

  render(props: MultiscreenProps) {
    if (!props.players.length) {
      return null;
    }
    const popoverMenuButton = (
      <Button
        className={this.state.isOpen ? styles.active : ''}
        type={ButtonType.borderless}
        size={ButtonSize.medium}
        icon={'more'}
        onClick={this._handleClick}
        focusOnMount={focusOnMultiscreenButton}
        testId="dualscreen_multiscreenButton"
        ariaLabel={this.props.multiscreenLabel!}
      />
    );

    return (
      <div className={styles.multiscreenWrapper} data-testid="dualscreen_multiscreenWrapper">
        {this.state.isOpen ? (
          popoverMenuButton
        ) : (
          <Tooltip type="bottom-left" label={this.props.multiscreenLabel} strictPosition>
            {popoverMenuButton}
          </Tooltip>
        )}

        <div
          style={{right: `${this.state.xPosition}px`}}
          className={[styles.multiscreenPlayersWrapper, this.state.isOpen ? styles.visible : ''].join(' ')}
          ref={this._multiscreenPlayersWrapperRef}
          data-testid="dualscreen_multiscreen">
          {props.players.map((player, index) => {
            const ref = createRef<HTMLDivElement>();
            this._multiscreenPlayersRefs[index] = ref;
            return (
              <div ref={ref} className={styles.multiscreenPlayer} data-testid="dualscreen_multiscreenPlayer">
                <div className={styles.multiscreenButtonsWrapper}>
                  <Button
                    onClick={(event: OnClickEvent, byKeyboard = false) => this._handleLayoutChange(byKeyboard, player.setPrimary)}
                    type={ButtonType.borderless}
                    size={ButtonSize.medium}
                    icon={player.setSecondary ? 'pictureInPicture' : 'switch'}
                    ariaLabel={player.setSecondary ? this.props.switchToPrimary : this.props.switchScreen}
                    testId="dualscreen_multiscreenSwitchScreen"
                  />
                  {player.setSecondary && (
                    <Button
                      onClick={(event: OnClickEvent, byKeyboard = false) => this._handleLayoutChange(byKeyboard, player.setSecondary!)}
                      type={ButtonType.borderless}
                      size={ButtonSize.medium}
                      icon={'minimizedVideo'}
                      ariaLabel={this.props.switchToSecondary}
                      testId="dualscreen_multiscreenSetSecondary"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
