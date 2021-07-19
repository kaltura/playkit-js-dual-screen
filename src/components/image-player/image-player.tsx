import {h, createRef, Component, Fragment} from 'preact';
import * as styles from './image-player.scss';

interface ImagePlayerOwnProps {}
interface ImagePlayerConnectProps {}

type ImagePlayerProps = ImagePlayerOwnProps & ImagePlayerConnectProps;

export class ImagePlayer extends Component<ImagePlayerProps> {
  ref = createRef();

  componentDidMount() {}

  render(props: ImagePlayerProps) {
    return <div className={styles.childPlayerContainer}></div>;
  }
}
