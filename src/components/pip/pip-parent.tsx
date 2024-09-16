import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Animations, PlayerType} from '../../enums';
const {connect} = KalturaPlayer.ui.redux;

const mapStateToProps = (state: Record<string, any>) => ({
  prePlayback: state.engine.prePlayback
});

interface PIPParentComponentOwnProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  animation: Animations;
  playerType: PlayerType;
}
interface PIPParentComponentConnectProps {
  prePlayback?: boolean;
}

type PIPParentComponentProps = PIPParentComponentOwnProps & PIPParentComponentConnectProps;
@connect(mapStateToProps)
export class PipParent extends Component<PIPParentComponentProps> {
  videoContainerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const {player, playerType} = this.props;
    if (playerType === PlayerType.VIDEO) {
      const videoElement = player.getVideoElement();
      videoElement.removeAttribute('disablePictureInPicture');
    }
    const videoFilter = document.createElement('div');
    // TODO use ui.style.videoFilter after player version upgrade
    videoFilter.classList.add('playkit-video-filter');

    this.videoContainerRef?.current?.appendChild(player.getVideoElement());
    this.videoContainerRef?.current?.appendChild(videoFilter);
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

    return <div className={styleClass.join(' ')} ref={this.videoContainerRef} data-testid="dualscreen_pipParent" />;
  }
}
