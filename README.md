# PlayKit JS Dual Screen - Dual Screen plugin for the [PlayKit JS Player]

PlayKit JS Dual Screen is written in [ECMAScript6], statically analysed using [Typescript] and transpiled in ECMAScript5 using [Babel].

[typescript]: https://www.typescriptlang.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js

### Installing

First, clone and run [yarn] to install dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/kaltura/playkit-js-dual-screen.git
cd playkit-js-dual-screen
yarn install
```

### Building

Then, build the player

```javascript
yarn run build
```

### Embed the library in your test page

Finally, add the bundle as a script tag in your page, and initialize the player

```html
<script type="text/javascript" src="/PATH/TO/FILE/kaltura-player.js"></script>
<!--Kaltura player-->
<script type="text/javascript" src="/PATH/TO/FILE//playkit-kaltura-cuepoints.js"></script>
<!--PlayKit cuepoint plugin-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-dual-screen.js"></script>
<!--PlayKit dual screen plugin-->
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    var playerContainer = document.querySelector("#player-placeholder");
    var config = {
     ...
     targetId: 'player-placeholder',
     plugins: {
      dualscreen: { ... },
      kalturaCuepoints: { ... },
     }
     ...
    };
    var player = KalturaPlayer.setup(config);
    player.loadMedia(...);
  </script>
</div>
```

## Documentation

Dual screen plugin configuration can been found here:

- **[Configuration](#configuration)**

Dual screen plugin dependencies can been found here:

- **[Dependencies](#dependencies)**

### Slides configuration

If you are showing slides, you MUST also include kalturaCuePoints plugin in the configuration as follow -

```html
plugins: { dualscreen: {...}, kalturaCuepoints: { } }
```

### And coding style tests

We use ESLint [recommended set](http://eslint.org/docs/rules/) with some additions for enforcing [Flow] types and other rules.

See [ESLint config](.eslintrc.json) for full configuration.

We also use [.editorconfig](.editorconfig) to maintain consistent coding styles and settings, please make sure you comply with the styling.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/kaltura/playkit-js-dual-screen/tags).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

<a name="configuration"></a>

## Configuration

#### DualScreenConfigObject

Defines the configuration of the dual screen. Except `childSizePercentage`, the configuration only defines the appearance when the player loads. After that, the user can adjust and change it.

#### Configuration Structure

```js
//Default configuration
"dualscreen" = {};
//Plugin params
"dualscreen" = {
  position?: string, // optional
  layout?: string, // optional
  childSizePercentage?: number, // optional
  slidesPreloadEnabled?: boolean, // optional
  childAspectRatio?: { // optional
    width: number,
    height: number
  }
}
```

##

> ### config.position
>
> ##### Type: `string`
>
> ##### Default: `bottom-right`
>
> ##### Description: ("bottom-left" | "bottom-right" | "top-left" | "top-right") The position where the child player will be displayed.

##

> ### config.layout
>
> ##### Type: `string`
>
> ##### Default: `PIP`
>
> ##### Description: ("PIP" | "PIPInverse" | "SingleMedia" | "SingleMediaInverse" | "SideBySide" | "SideBySideInverse") The layout of the parent and child players.

##

> ### config.childSizePercentage
>
> ##### Type: `number`
>
> ##### Default: `30`
>
> ##### Description: Relevant only for PIP layout - Sets the height of the child player as percentage of the parent player height.

##

> ### config.slidesPreloadEnabled
>
> ##### Type: `boolean`
>
> ##### Default: `true`
>
> ##### Description: Enable image preloading

##

> ### config.childAspectRatio
>
> ##### Type: `Object<width: number, height: number>`
>
> ##### Default: `{ width: 16, height: 9 }`
>
> ##### Description: set aspect ration for PIP container

##

> ### config.removePlayerSettings
>
> ##### Type: `boolean`
>
> ##### Default: `false`
>
> ##### Description: removes media settings from player if dual-screen layout active


<a name="dependencies"></a>

## Dependencies

Plugin dependencies:<br/>
<a href="https://github.com/kaltura/playkit-js-kaltura-cuepoints">Cue Points</a><br/>
