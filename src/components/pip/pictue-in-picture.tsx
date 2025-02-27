import {ui} from '@playkit-js/kaltura-player-js';
import {withText} from 'preact-i18n';
import {Layout, PlayerType} from '../../enums';
import {DualScreenPlayer} from '../../types';
import {h, Component, createRef} from 'preact';
import {A11yWrapper} from '@playkit-js/common';

const { redux,reducers , utils, style} = KalturaPlayer.ui;
const {Tooltip, Icon} = ui.Components;
/**
 * mapping state to props
 * @param {*} state - redux store state
 * @returns {Object} - mapped state to this component
 */
const mapStateToProps = (state: Record<string, any>) => ({
 isPictureInPictureSupported: state.engine.isPictureInPictureSupported,
  isInPictureInPicture: state.engine.isInPictureInPicture,
});

const COMPONENT_NAME = 'PictureInPicture';

interface PictureInPictureDualScreenProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  dualScreenPlayers: Array<DualScreenPlayer>;
  playerType: PlayerType;
  isInPictureInPicture?: boolean| undefined;
  isPictureInPictureSupported?: boolean| undefined;
  pictureInPictureExitText?: string;
  pictureInPictureText?: string;
  layout?: Layout;
}

type AppState = {
  classname: string;
  ariaLabel:string;
}

  /**
 * PictureInPicture component
 *
 * @class PictureInPicture
 * @extends {Component}
 */
@redux.connect(mapStateToProps, utils.bindActions({...reducers.shell.actions, ...reducers.engine.actions}))
@withText({
  pictureInPictureText: 'controls.pictureInPicture',
  pictureInPictureExitText: 'controls.pictureInPictureExit'
})
class PictureInPicture extends Component<PictureInPictureDualScreenProps, AppState>  {
  buttonContainerRef:HTMLButtonElement | null = null

  /**
   * Creates an instance of PictureInPicture.
   * @memberof PictureInPicture
   */
  constructor(props: any) {
    super(props);

    const isSomePlayerInPip = this.isSomePlayerInPip()
    const classname = [style.controlButton, 'picture-in-picture-dual-screen'].join(" ");
    this.state = {
      classname: isSomePlayerInPip ? classname.concat(" " + style.isInPictureInPicture || "") as string : classname,
      ariaLabel: isSomePlayerInPip? this.props.pictureInPictureExitText || "" : this.props.pictureInPictureText || ""
    }
  }

  componentDidUpdate() {
    //this is to hide picture-in-picture-overly when mainPlayer go to picture in picture
    if(this.props.playerType === PlayerType.VIDEO) {
      const dualScreenPlayer = this.getDualScreenPlayer()
      if(dualScreenPlayer && dualScreenPlayer.player == this.props.player) {
        // @ts-expect-error
        const videoPlayer:KalturaPlayerTypes.Player = this.props.player as KalturaPlayerTypes.Player;
        videoPlayer.ui.store.dispatch?.(reducers.engine.actions.updateIsInPictureInPicture(false));
      }
    }
  }

  /**
   * toggle pip
   * @returns {void}
   *
   * @memberof PictureInPicture
   */
  togglePip = (): void => {
    const player = this.props.player;
    if(this.props.playerType === PlayerType.IMAGE) {
      return
    }

    if (this.isSomePlayerInPip()) {
      this.exitPlayerInPip();

      const currentClassName = this.state.classname.replace(" " + style.isInPictureInPicture, "") as string;
      this.updateParams(currentClassName, this.props.pictureInPictureText|| "")
    } else {
      // @ts-expect-error
      player.enterPictureInPicture();

      const currentClassName = this.state.classname.concat(" " + style.isInPictureInPicture || "") as string;
      this.updateParams(currentClassName, this.props.pictureInPictureExitText|| "")
    }
  }

  private updateParams = (className:string, ariaLabel:string) => {
    this.setState({classname: className})
    this.setState({ariaLabel: ariaLabel})
  }


  public exitPlayerInPip = () => {
    const current = this.getDualScreenPlayer()
    // @ts-expect-error
    current.player.exitPictureInPicture()
  };

  public getDualScreenPlayer(){
    return this.props.dualScreenPlayers.find(dualScreenPlayer => {
        // @ts-expect-error
        if (dualScreenPlayer.player.isInPictureInPicture?.()) {
          return dualScreenPlayer
        }
    });
  }

  public isSomePlayerInPip = () => {
    const dualScreenPlayer = this.getDualScreenPlayer()
    return !!dualScreenPlayer;
  };

  /**
   * render component
   *
   * @returns {React$Element} - component element
   * @memberof PictureInPicture
   */
  render() {
    return (
      <Tooltip label={this.state.ariaLabel}>
        <div>
          <A11yWrapper onClick={this.togglePip}>
            <button
            ref= {node => (  this.buttonContainerRef = node)}
            aria-label={this.state.ariaLabel}
            className= {this.state.classname}
            >
            <i className={[style.icon, style.iconPictureInPictureStart].join(' ')} aria-hidden="true" />
            <i className={[style.icon, style.iconPictureInPictureStop].join(' ')} aria-hidden="true" />
            </button>
          </A11yWrapper>
        </div>
      </Tooltip>
    );
  }
}

  PictureInPicture.displayName = COMPONENT_NAME;
  export {PictureInPicture};
