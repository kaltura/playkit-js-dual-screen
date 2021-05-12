import {h, createRef, Component} from 'preact';
import * as styles from './pip.scss';

interface PIPComponentProps {
  childPlayer: any;
  height: string;
  width: string;
  inverse?: boolean;
}
export class Pip extends Component<PIPComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  render(props: any) {
    return (
      <div
        style={`height: ${props.height}; width: ${props.width}`}
        ref={this.ref}
        className={props.inverse ? "" : styles.childPlayer}
      />
    );
  }
}
