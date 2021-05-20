import {h, createRef, Component} from 'preact';
import * as styles from './pip-minimized.scss';
import {icons} from "../../icons";
const {Icon} = KalturaPlayer.ui.components;
const SHOW_ICON_PATH =
  'M4.293 10.707c0.36 0.361 0.928 0.388 1.32 0.083l0.094-0.083 2.293-2.292 2.293 2.292c0.361 0.361 0.928 0.388 1.32 0.083l0.094-0.083c0.361-0.361 0.388-0.928 0.083-1.32l-0.083-0.094-3-3c-0.36-0.36-0.928-0.388-1.32-0.083l-0.094 0.083-3 3c-0.391 0.391-0.391 1.024 0 1.414z';

interface PIPMinimizedComponentProps {
  childPlayer: any;
  show: Function
}
export class PipMinimized extends Component<PIPMinimizedComponentProps> {
  ref = createRef();

  componentDidMount() {
    this.ref.current.appendChild(this.props.childPlayer.getView());
  }

  render(props: any) {
    return (
      <div className={styles.childPlayerContainer}>
        <div ref={this.ref} className={styles.childPlayer} />

        <div onMouseUp={props.show} role="button" className={styles.showContainer}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-minimized-show" height={16} width={16} path={icons.SHOW_ICON_PATH} />
          </div>
          Show
        </div>

        <div className={styles.innerButtons}>
          <div className={styles.iconContainer}>
            <Icon id="dualscreen-pip-minimized-swap" height={24} width={24} path={icons.SWAP_ICON_PATH} />
          </div>
        </div>
      </div>
    );
  }
}
