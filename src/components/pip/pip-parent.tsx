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
    this.videoContainerRef?.current?.appendChild(player.getView());
  }

  render(props: PIPParentComponentProps) {
    let styleClass = '';

    if (!props.prePlayback && props.animation) {
      switch (props.animation) {
        case Animations.Fade:
          styleClass = styles.animatedFade;
          break;
        case Animations.ScaleRight:
          styleClass = styles.animatedScaleRight;
          break;
        case Animations.ScaleLeft:
          styleClass = styles.animatedScaleLeft;
          break;
      }
    }

    const videoContainerStyles = {
      height: `${props.guiClientRect!.height + 'px'}`,
      width: `${props.guiClientRect!.width + 'px'}`
    };

    return (
      <div className={styleClass}>
        <div className={styles.videoContainer} style={videoContainerStyles} ref={this.videoContainerRef} />
      </div>
    );
  }
}