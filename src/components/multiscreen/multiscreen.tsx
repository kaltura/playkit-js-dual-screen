import {h, Component, RefObject, createRef} from 'preact';
import {KalturaPlayer} from 'kaltura-player-js';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {ImagePlayer} from '../../image-player';
import * as styles from './multiscreen.scss';

export interface MultiscreenPlayer {
  player: KalturaPlayer | ImagePlayer;
  setSecondary: (() => void) | null;
  setPrimary: () => void;
}

interface MultiscreenProps {
  players: Array<MultiscreenPlayer>;
  icon: string;
}
interface MultiscreenState {
  open: boolean;
}

export class Multiscreen extends Component<MultiscreenProps, MultiscreenState> {
  _multiscreenPlayersRefs: Array<RefObject<HTMLDivElement>> = [];
  state = {
    open: false
  };

  componentDidUpdate(previousProps: Readonly<MultiscreenProps>, previousState: Readonly<MultiscreenState>): void {
    if (!previousState.open && this.state.open) {
      this._multiscreenPlayersRefs.forEach((ref, index) => {
        const videoElement = this.props.players[index].player.getVideoElement();
        videoElement.tabIndex = -1;
        ref.current!.prepend(videoElement);
      });
    }
  }

  handleClick = () => {
    if (this.state.open) {
      this._multiscreenPlayersRefs = [];
      this.setState({open: false});
    } else {
      this.setState({open: true});
    }
  };

  render(props: MultiscreenProps) {
    if (!props.players.length) {
      return null;
    }
    return (
      <div className={styles.multiscreenWrapper}>
        <Button
          tooltip={{
            label: 'Show more screens',
            type: 'bottom-left'
          }}
          type={ButtonType.borderless}
          size={ButtonSize.medium}
          icon={this.props.icon}
          onClick={this.handleClick}
        />
        {this.state.open && (
          <div className={styles.multiscreenPlayersWrapper}>
            {props.players.map(player => {
              const ref = createRef<HTMLDivElement>();
              this._multiscreenPlayersRefs.push(ref);
              return (
                <div ref={ref} className={styles.multiscreenPlayer}>
                  <div className={styles.multiscreenButtonsWrapper}>
                    <Button
                      onClick={player.setPrimary}
                      type={ButtonType.borderless}
                      size={ButtonSize.medium}
                      icon={player.setSecondary ? 'pictureInPicture' : 'switch'}
                    />
                    {player.setSecondary && (
                      <Button onClick={player.setSecondary} type={ButtonType.borderless} size={ButtonSize.medium} icon={'minimizedVideo'} />
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
