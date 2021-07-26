import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Animations} from '../../enums';
import {GuiClientRect} from '../../types';
const {connect} = KalturaPlayer.ui.redux;

const mapStateToProps = (state: Record<string, any>) => ({
  playerHover: state.shell.playerHover,
  guiClientRect: state.shell.guiClientRect,
  prePlayback: state.engine.prePlayback
});

interface PIPParentComponentOwnProps {
  player: KalturaPlayerTypes.Player;
  animation: Animations;
}
interface PIPParentComponentConnectProps {
  guiClientRect?: GuiClientRect;
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
      height: `${props.guiClientRect!.height + 'px'}`,
      width: `${props.guiClientRect!.width + 'px'}`
    };

    return <div className={styleClass.join(' ')} style={videoContainerStyles} ref={this.videoContainerRef} />;
  }
}
