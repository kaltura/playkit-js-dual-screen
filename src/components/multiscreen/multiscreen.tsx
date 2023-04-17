import {h, Component, RefObject, createRef} from 'preact';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {OnClickEvent} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {PlaykitUI} from 'kaltura-player-js';
import {MultiscreenPlayer} from '../../types';
import * as styles from './multiscreen.scss';

const {Tooltip} = KalturaPlayer.ui.components;
const {withEventManager} = KalturaPlayer.ui.Event;

interface MultiscreenProps {
  players: Array<MultiscreenPlayer>;
  eventManager?: PlaykitUI.EventManager;
}
interface MultiscreenState {
  isOpen: boolean;
}

let focusOnMultiscreenButton = false;

@withEventManager
export class Multiscreen extends Component<MultiscreenProps, MultiscreenState> {
  private _multiscreenPlayersRefs: Array<RefObject<HTMLDivElement>> = [];

  state = {isOpen: false};

  componentDidUpdate(): void {
    if (this.state.isOpen) {
      this._multiscreenPlayersRefs.forEach((ref, index) => {
        const videoElement = this.props.players[index].player.getVideoElement();
        videoElement.tabIndex = -1;
        ref.current!.prepend(videoElement);
      });
    }
  }

  componentWillUnmount() {
    this._multiscreenPlayersRefs = [];
  }

  private _togglePopover = (event: OnClickEvent, byKeyboard = false) => {
    // a11y wrapper prevent propagation of click event, so 'click' have to be triggered manually
    focusOnMultiscreenButton = byKeyboard;
    document.dispatchEvent(new Event('click'));
    if (!this.state.isOpen) {
      this.props.eventManager?.listenOnce(document, 'click', () => {
        this.setState({isOpen: false});
      });
      this.setState({isOpen: true});
    }
  };

  private _handleClick = (byKeyboard: boolean, cb: () => void) => {
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
        type={ButtonType.borderless}
        size={ButtonSize.medium}
        icon={'more'}
        onClick={this._togglePopover}
        focusOnMount={focusOnMultiscreenButton}
      />
    );

    return (
      <div className={styles.multiscreenWrapper}>
        {this.state.isOpen ? (
          popoverMenuButton
        ) : (
          <Tooltip type="bottom-left" label={'Show more screens'}>
            {popoverMenuButton}
          </Tooltip>
        )}

        {this.state.isOpen && (
          <div className={styles.multiscreenPlayersWrapper}>
            {props.players.map((player, index) => {
              const ref = createRef<HTMLDivElement>();
              this._multiscreenPlayersRefs[index] = ref;
              return (
                <div ref={ref} className={styles.multiscreenPlayer}>
                  <div className={styles.multiscreenButtonsWrapper}>
                    <Button
                      onClick={(event: OnClickEvent, byKeyboard = false) => this._handleClick(byKeyboard, player.setPrimary)}
                      type={ButtonType.borderless}
                      size={ButtonSize.medium}
                      icon={player.setSecondary ? 'pictureInPicture' : 'switch'}
                    />
                    {player.setSecondary && (
                      <Button
                        onClick={(event: OnClickEvent, byKeyboard = false) => this._handleClick(byKeyboard, player.setSecondary!)}
                        type={ButtonType.borderless}
                        size={ButtonSize.medium}
                        icon={'minimizedVideo'}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
