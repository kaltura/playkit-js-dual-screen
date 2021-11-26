import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Animations} from '../../enums';
const {connect} = KalturaPlayer.ui.redux;

const mapStateToProps = (state: Record<string, any>) => ({
  playerHeight: state.shell.guiClientRect.height,
  playerWidth: state.shell.guiClientRect.width,
  prePlayback: state.engine.prePlayback
});

interface PIPParentComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  animation: Animations;
}
interface PIPParentComponentConnectProps {
  playerHeight?: number;
  playerWidth?: number;
  prePlayback?: boolean;
}

type PIPParentComponentProps = PIPParentComponentOwnProps & PIPParentComponentConnectProps;
@connect(mapStateToProps)
export class PipParent extends Component<PIPParentComponentProps> {
  videoContainerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const {player} = this.props;
    this.videoContainerRef?.current?.appendChild(player.getVideoElement());
  }

  render(props: PIPParentComponentProps) {
    let styleClass = [styles.videoContainer, styles.parentPlayer];

    if (!props.prePlayback && props.animation) {
      switch (props.animation) {
        case Animations.Fade:
          styleClass.push(styles.animatedFade);
          break;
        case Animations.ScaleRight:
          styleClass.push(styles.animatedScaleRight);
          break;
        case Animations.ScaleLeft:
          styleClass.push(styles.animatedScaleLeft);
          break;
      }
    }

    const videoContainerStyles = {
      height: `${props.playerHeight + 'px'}`,
      width: `${props.playerWidth + 'px'}`
    };

    return <div className={styleClass.join(' ')} style={videoContainerStyles} ref={this.videoContainerRef} />;
  }
}
