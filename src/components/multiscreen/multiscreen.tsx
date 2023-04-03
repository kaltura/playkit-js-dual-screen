import {h, Component, Ref, createRef} from 'preact';
import {KalturaPlayer} from 'kaltura-player-js';
import {ImagePlayer} from "../../image-player";
import * as styles from './multiscreen.scss';

export interface MultiscreenPlayer {
  player:  KalturaPlayer | ImagePlayer;
  setSecondary: () => void | null;
  setPrimary: () => void | null;
}

interface MultiscreenProps {
  players: Array<MultiscreenPlayer>
}

export class Multiscreen extends Component<MultiscreenProps> {
  _multiscreenPlayersRefMap: Array<Ref<HTMLDivElement>> = [];

  componentDidMount(): void {
    this._multiscreenPlayersRefMap.forEach((ref, index) => {
      const videoElement = this.props.players[index].player.getVideoElement();
      videoElement.tabIndex = -1;
      // @ts-ignore
      ref.current!.prepend(videoElement);
    })
  }

  render(props: MultiscreenProps) {
    if (!props.players.length) {
      return null;
    }
    return (
    <div className={styles.multiscreenContainer} style={{height: '66px', position: "absolute", top: "60px", right: 0}}>
      {props.players.map(player => {
        const ref = createRef<HTMLDivElement>();
        this._multiscreenPlayersRefMap.push(ref);
        return (<div ref={ref} style={{ position: "relative", margin: "10px" }}>
          <div onClick={player.setSecondary} style={{ width: "10px", height: "10px", background: "red", position: "absolute", top: "18px", left: "20px"}}></div>
          <div onClick={player.setPrimary} style={{ width: "10px", height: "10px", background: "green", position: "absolute", top: "18px", left: "40px"}}></div>
        </div>)
      })}
    </div>
    )
  }
}
