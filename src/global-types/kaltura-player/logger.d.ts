declare namespace KalturaPlayerTypes {
    export interface Logger {
        debug(message: string, context: MessageOptions): void;

        info(message: string, context: MessageOptions): void;

        trace(message: string, context: MessageOptions): void;

        warn(message: string, context: MessageOptions): void;

        error(message: string, context: MessageOptions): void;
    }

    export interface MessageOptions {
        class?: string;
        method?: string;
        data?: Record<string, any>;
    }
}
