import { h, createRef, Component } from "preact";
import * as styles from './pip-minimized.scss';

interface PIPComponentProps {
  secondaryPlayer: any;
}
export class PipMinimized extends Component<PIPComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.secondaryPlayer.getView());
  }

  render(props: any) {
    return (
        <div ref={this.ref} className={styles.secondaryPlayer} />
    );
  }
}
