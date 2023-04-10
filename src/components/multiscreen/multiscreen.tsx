import {h, Component, RefObject, createRef} from 'preact';
import {KalturaPlayer} from 'kaltura-player-js';
import {ImagePlayer} from '../../image-player';
import * as styles from './multiscreen.scss';

export interface MultiscreenPlayer {
  player: KalturaPlayer | ImagePlayer;
  setSecondary: (() => void) | null;
  setPrimary: () => void;
}

interface MultiscreenProps {
  players: Array<MultiscreenPlayer>;
}

export class Multiscreen extends Component<MultiscreenProps> {
  _multiscreenPlayersRefs: Array<RefObject<HTMLDivElement>> = [];

  componentDidMount(): void {
    this._multiscreenPlayersRefs.forEach((ref, index) => {
      const videoElement = this.props.players[index].player.getVideoElement();
      videoElement.tabIndex = -1;
      ref.current!.prepend(videoElement);
    });
  }

  render(props: MultiscreenProps) {
    if (!props.players.length) {
      return null;
    }
    return (
      <div className={styles.multiscreenWrapper}>
        {props.players.map(player => {
          const ref = createRef<HTMLDivElement>();
          this._multiscreenPlayersRefs.push(ref);
          return (
            <div ref={ref} className={styles.multiscreenPlayer}>
              <div className={styles.multiscreenButtonsWrapper}>
                <div onClick={player.setPrimary} className={player.setSecondary ? styles.setPrimary : styles.switch}></div>
                {player.setSecondary && <div onClick={player.setSecondary} className={styles.setSecondary}></div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
