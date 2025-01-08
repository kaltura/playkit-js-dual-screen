import {ui} from '@playkit-js/kaltura-player-js';
import {h, Component, VNode} from 'preact';
import {withText} from 'preact-i18n';
import {PlayerType} from '../../enums';
import {DualScreenPlayer} from '../../types';
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

const COMPONENT_NAME = 'PictureInPictureDualScreen';

interface PictureInPictureDualScreenProps {
  player: KalturaPlayerTypes.Player | KalturaPlayerTypes.ImagePlayer;
  dualScreenPlayers: Array<DualScreenPlayer>;
  playerType: PlayerType;
  isInPictureInPicture?: boolean| undefined;
  isPictureInPictureSupported?:boolean| undefined;
  pictureInPictureExitText?:string;
  pictureInPictureText?:string;
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
class PictureInPictureDualScreen extends Component<PictureInPictureDualScreenProps>  {
  /**
   * Creates an instance of PictureInPicture.
   * @memberof PictureInPicture
   */
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    const elem = window.document.querySelector(".picture-in-picture-dual-screen")
    //@ts-ignore
    elem?.nextSibling?.textContent = this.props.pictureInPictureText
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
    //@ts-ignore
    if (this.isSomePlayerInPip()) {
      this.exitPlayerInPip();
      const elem = window.document.querySelector(".picture-in-picture-dual-screen")
      //@ts-ignore
      elem?.classList.remove(style.isInPictureInPicture)
      //@ts-ignore
      elem?.setAttribute('aria-label', this.props.pictureInPictureText)
      //@ts-ignore
      elem?.nextSibling?.textContent = this.props.pictureInPictureText
    } else {
      //@ts-ignore
      player.enterPictureInPicture();
      const elem = window.document.querySelector(".picture-in-picture-dual-screen")
      //@ts-ignore
      elem?.classList.add(style.isInPictureInPicture)
      //@ts-ignore
      elem?.setAttribute('aria-label', this.props.pictureInPictureExitText)
      //@ts-ignore
      elem?.nextSibling?.textContent = this.props.pictureInPictureExitText
    }
  };

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
          <button
            // tabIndex= 0,
            aria-label={isSomePlayerInPip ? this.props.pictureInPictureExitText : this.props.pictureInPictureText}
            className={isSomePlayerInPip ? [style.controlButton, "picture-in-picture-dual-screen", style.isInPictureInPicture].join(' ') : [style.controlButton, "picture-in-picture-dual-screen"].join(' ')}
            onClick={this.togglePip}
            //onKeyDown={this.onKeyDown}
          >
            <i className={[style.icon, style.iconPictureInPictureStart].join(' ')} aria-hidden="true" />
            <i className={[style.icon, style.iconPictureInPictureStop].join(' ')} aria-hidden="true" />
          </button>
        </Tooltip>
    );
 }
}

PictureInPictureDualScreen.displayName = COMPONENT_NAME;
export {PictureInPictureDualScreen};