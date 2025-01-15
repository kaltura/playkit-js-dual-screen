import {ui} from '@playkit-js/kaltura-player-js';
import {withText} from 'preact-i18n';
import {Layout, PlayerType} from '../../enums';
import {DualScreenPlayer} from '../../types';
import {h, Component, createRef} from 'preact';

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
class PictureInPicture extends Component<PictureInPictureDualScreenProps>  {
  buttonContainerRef:HTMLButtonElement | null = null

  /**
   * Creates an instance of PictureInPicture.
   * @memberof PictureInPicture
   */
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    this.buttonContainerRef!.parentNode!.nextSibling!.textContent = this.props.pictureInPictureText|| ""
  }

  componentDidUpdate() {
    if(this.props.playerType === PlayerType.VIDEO) {
      const videoPlayer:KalturaPlayerTypes.Player = this.props.player as KalturaPlayerTypes.Player;
      videoPlayer.ui.store.dispatch(reducers.engine.actions.updateIsInPictureInPicture(false));
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
    if (!player) {
      return;
    }

    if(this.props.playerType === PlayerType.IMAGE) {
      return
    }

    if (this.isSomePlayerInPip()) {
      this.exitPlayerInPip();

      const currentClassName = this.buttonContainerRef?.className.replace(" " + style.isInPictureInPicture, "") as string;
      this.updateParams(currentClassName, this.props.pictureInPictureText|| "")
    } else {
      //@ts-ignore
      player.enterPictureInPicture();

      const currentClassName = this.buttonContainerRef?.className.concat(" " + style.isInPictureInPicture || "") as string;
      this.updateParams(currentClassName, this.props.pictureInPictureExitText|| "")
    }
  }

  private updateParams = (className:string, ariaLabel:string) => {
    this.buttonContainerRef?.setAttribute('class', className)
    this.buttonContainerRef?.setAttribute('aria-label', ariaLabel)
    this.buttonContainerRef!.parentElement!.nextElementSibling!.textContent = ariaLabel;
  }

  public exitPlayerInPip = () => {
    return this.props.dualScreenPlayers.find(dualScreenPlayer => {
      try{
        //@ts-ignore
        if(dualScreenPlayer.player.isInPictureInPicture()){
          //@ts-ignore
          dualScreenPlayer.player.exitPictureInPicture();
          return
        }
      }
      catch {
      }
    });
  };

  public isSomePlayerInPip = () => {
    return this.props.dualScreenPlayers.find(dualScreenPlayer => {
      try{
        //@ts-ignore
        if(dualScreenPlayer.player.isInPictureInPicture()){
          return true
        }
      }
      catch {
      }
    });
  };

  /**
   * render component
   *
   * @returns {React$Element} - component element
   * @memberof PictureInPicture
   */
  render() {
    const isSomePlayerInPip = this.isSomePlayerInPip()
    return (
      <Tooltip label="">
        <div>
          <button
            ref= {node => (  this.buttonContainerRef = node)}
            aria-label={isSomePlayerInPip ? this.props.pictureInPictureExitText : this.props.pictureInPictureText}
            className={isSomePlayerInPip ? [style.controlButton, 'picture-in-picture-dual-screen', style.isInPictureInPicture].join(' ') : [style.controlButton, 'picture-in-picture-dual-screen'].join(' ')}
            onClick={()=>this.togglePip()}
          >
            <i className={[style.icon, style.iconPictureInPictureStart].join(' ')} aria-hidden="true" />
            <i className={[style.icon, style.iconPictureInPictureStop].join(' ')} aria-hidden="true" />
          </button>
        </div>
      </Tooltip>
  );
  }
  }

  PictureInPicture.displayName = COMPONENT_NAME;
  export {PictureInPicture};