declare namespace KalturaPlayerTypes {
    export interface BasePlugin {
        player: KalturaPlayerTypes.Player;
        eventManager: any;
        config: any;
        logger: any;
    }
}
