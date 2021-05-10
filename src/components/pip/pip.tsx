import { h, createRef, Component } from "preact";
import * as styles from './pip.scss';

interface PIPComponentProps {
  childPlayer: any;
  inverse?: boolean
}
export class Pip extends Component<PIPComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  render(props: any) {
    return (
        <div ref={this.ref} className={props.inverse ? styles.childPlayerInverse : styles.childPlayer} />
    );
  }
}
