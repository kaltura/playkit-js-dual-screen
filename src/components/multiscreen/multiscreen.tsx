import {h, Component, RefObject, createRef} from 'preact';
import {Button, ButtonSize, ButtonType} from '@playkit-js/common/dist/components/button';
import {MultiscreenPlayer} from '../../types';
import * as styles from './multiscreen.scss';

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

  componentDidUpdate(): void {
    if (this.state.open) {
      this._multiscreenPlayersRefs.forEach((ref, index) => {
        const videoElement = this.props.players[index].player.getVideoElement();
        videoElement.tabIndex = -1;
        ref.current!.prepend(videoElement);
      });
    }
  }

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
          onClick={() => this.setState({open: !this.state.open})}
        />
        {this.state.open && (
          <div className={styles.multiscreenPlayersWrapper}>
            {props.players.map((player, index) => {
              const ref = createRef<HTMLDivElement>();
              this._multiscreenPlayersRefs[index] = ref;
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
