import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';
import {Position} from '../../enums/positionEnum';
const {connect} = KalturaPlayer.ui.redux;
const {utils, reducers} = KalturaPlayer.ui;

const mapStateToProps = (state: any) => ({
  playerHover: state.shell.playerHover,
  guiClientRect: state.shell.guiClientRect
});

interface PIPComponentProps {
  childPlayer: any;
  secondarySizePercentage?: number;
  inverse?: boolean;
  position: Position;
}
@connect(mapStateToProps, utils.bindActions(reducers.shell.actions))
export class Pip extends Component<PIPComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  render(props: any) {
    const styleClass = props.inverse ? [] : [styles.childPlayer];
    const height : number = props.inverse ? props.guiClientRect.height : props.guiClientRect.height * props.secondarySizePercentage * 2 / 100
    const width : number = props.inverse ? props.guiClientRect.width : props.guiClientRect.width * props.secondarySizePercentage * 2 / 100
    switch (props.position) {
      case Position.BottomRight:
        styleClass.push(props.playerHover ? styles.bottomHover : styles.bottom);
        styleClass.push(styles.right);
        break;
      default:
    }
    return (
      <div
        style={`height: ${height + 'px'}; width: ${width + 'px'}`}
        ref={this.ref}
        className={styleClass.join(' ')}
      />
    );
  }
}
