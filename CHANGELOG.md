# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v3.0.1...v3.0.2) (2022-12-12)


### Bug Fixes

* **FEV-1439:** a11y fixes ([#79](https://github.com/kaltura/playkit-js-dual-screen/issues/79)) ([96f11bd](https://github.com/kaltura/playkit-js-dual-screen/commit/96f11bd11b004c75e4ee4990ebdb2d62df41b86d))
* **FEV-1590:** Mac voice over issues ([#82](https://github.com/kaltura/playkit-js-dual-screen/issues/82)) ([962af42](https://github.com/kaltura/playkit-js-dual-screen/commit/962af42d9dc4ab955d8a9df1a8651c99e078137d))
* **FEV-956:** while dragging, the mouse cursor should be changed to 'hand' icon ([#80](https://github.com/kaltura/playkit-js-dual-screen/issues/80)) ([c381265](https://github.com/kaltura/playkit-js-dual-screen/commit/c38126510884a38bc0bd3a0e9150a8aa17c14e27))

### [3.0.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.9.2...v3.0.1) (2022-10-26)


### Bug Fixes

* **FEc-12359:** prepend video element in order to keep the original HTML nodes layout ([20bd283](https://github.com/kaltura/playkit-js-dual-screen/commit/20bd2836fde425fd139663cb46f51ff2cf658653))
* **FEV-1119:** better css performances for thumb loading ([#62](https://github.com/kaltura/playkit-js-dual-screen/issues/62)) ([93320b4](https://github.com/kaltura/playkit-js-dual-screen/commit/93320b41a202bc5e8401fc7398e22d1b4dae8893))
* **FEV-1158:** show/hide buttons focus issue fixed when narrator is turned on ([#77](https://github.com/kaltura/playkit-js-dual-screen/issues/77)) ([a8d437f](https://github.com/kaltura/playkit-js-dual-screen/commit/a8d437fec6e4e40b4412a66175df6e6caacb855b))
* **FEV-1296:** fixed issue with dual screen plugin overlap ([#60](https://github.com/kaltura/playkit-js-dual-screen/issues/60)) ([dda6578](https://github.com/kaltura/playkit-js-dual-screen/commit/dda6578a48a1873f9b132921c227cb830474bda7))
* **FEV-1322:** slides that were broadcasted prior to the archive will appear in the navigation ([#70](https://github.com/kaltura/playkit-js-dual-screen/issues/70)) ([65bae58](https://github.com/kaltura/playkit-js-dual-screen/commit/65bae588102ad7ad708ed2fbc2bf7b8a7a134824))
* **FEV-1327:** handle slide only on entire screen layout change ([62d035b](https://github.com/kaltura/playkit-js-dual-screen/commit/62d035b50b08cf5b59f905d36288c6970b552b9b))
* **FEV-1329:** add live type of media to getSecondaryMedia API call ([24268a4](https://github.com/kaltura/playkit-js-dual-screen/commit/24268a46d943f6c09dcd0cb79d1c227a83a867a4))
* **FEV-1387:** prevent apply SbS buttons over side-panels ([#75](https://github.com/kaltura/playkit-js-dual-screen/issues/75)) ([f22398f](https://github.com/kaltura/playkit-js-dual-screen/commit/f22398ffa3029530e30d8971830846750d69538a))
* **FEV-1418:** add plugin dependencies ([dc77335](https://github.com/kaltura/playkit-js-dual-screen/commit/dc7733522ff2ffe0d24f93e588da5f2476cacf67))
* **FEV-1519:** simplify dual-screen config ([#73](https://github.com/kaltura/playkit-js-dual-screen/issues/73)) ([819171d](https://github.com/kaltura/playkit-js-dual-screen/commit/819171d37510d1f3545733dde080a5243c4cb574))
* **FEV-963:** set round corners on Safari for child player (minimized) ([759e968](https://github.com/kaltura/playkit-js-dual-screen/commit/759e968d77446ee8a55c004c17ab20e27d42b488))

### [1.9.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.9.1...v1.9.2) (2022-07-20)


### Bug Fixes

* **FEV-1267:** put player in original element on layout change ([#58](https://github.com/kaltura/playkit-js-dual-screen/issues/58)) ([63e7ec1](https://github.com/kaltura/playkit-js-dual-screen/commit/63e7ec1e7de890d53f3eda42101d917c96fd5e31))
* **FEV-1287:** Slides doesn't appears in dual screen plugin if the user jumps to the entry containing the slides ([#57](https://github.com/kaltura/playkit-js-dual-screen/issues/57)) ([1237dda](https://github.com/kaltura/playkit-js-dual-screen/commit/1237ddaf36f7c445c8790762e4195d59616d21f0))
* **FEV-1295:** check if original Video Element exist ([#59](https://github.com/kaltura/playkit-js-dual-screen/issues/59)) ([8338629](https://github.com/kaltura/playkit-js-dual-screen/commit/83386298bfe25a707bc3956d67f6920ca438a5c2))
* **FEV-963:** fix border-radius of div containing video on Safari ([#61](https://github.com/kaltura/playkit-js-dual-screen/issues/61)) ([465bf31](https://github.com/kaltura/playkit-js-dual-screen/commit/465bf3170eafc9dce6496b3fad2dbc6eeff3de5f))

### [1.9.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.9.0...v1.9.1) (2022-05-26)


### Bug Fixes

* **FEV-1172:** reset active slide on locked-view state ([#55](https://github.com/kaltura/playkit-js-dual-screen/issues/55)) ([e5ef1ac](https://github.com/kaltura/playkit-js-dual-screen/commit/e5ef1ac03ebf428e168d056cadb4f64eae6760e6))
* **FEV-1204:** remove Settings only when dual is loaded ([#56](https://github.com/kaltura/playkit-js-dual-screen/issues/56)) ([efcd2e9](https://github.com/kaltura/playkit-js-dual-screen/commit/efcd2e9f7032c65e03cb0fc685e613e7db684801))


### Build System

* set prerelease false ([d965d65](https://github.com/kaltura/playkit-js-dual-screen/commit/d965d650f22ceae848d0ae525c477d2690902f4b))

## [1.9.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.8.0...v1.9.0) (2022-01-19)


### Features

* **FEC-11761:** expose stream timed metadata - phase 2 ([#53](https://github.com/kaltura/playkit-js-dual-screen/issues/53)) ([7b94779](https://github.com/kaltura/playkit-js-dual-screen/commit/7b94779e8c91c1442a909f292a6b53e1b5a91ee5))


### Bug Fixes

* **FEV-1165:** fix draggable area styles ([#54](https://github.com/kaltura/playkit-js-dual-screen/issues/54)) ([8816ccb](https://github.com/kaltura/playkit-js-dual-screen/commit/8816ccbee4a0ad3cb0964733b2f5b0609ae41dbb))

## [1.8.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.6...v1.8.0) (2021-12-29)


### Features

* **FEV-1105:** Dual-screen accessibility ([#49](https://github.com/kaltura/playkit-js-dual-screen/issues/49)) ([3342ad7](https://github.com/kaltura/playkit-js-dual-screen/commit/3342ad77bdafe4b5c907bc6b1cea0df64397d50c))


### Bug Fixes

* **FEV-1154:** loadMedia for secondary screen transform anonymous user to non-anonymous ([#51](https://github.com/kaltura/playkit-js-dual-screen/issues/51)) ([92b0c9a](https://github.com/kaltura/playkit-js-dual-screen/commit/92b0c9a17c075d45636c19c3fe4b578c735d087c))

### [1.7.6](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.5...v1.7.6) (2021-11-22)


### Bug Fixes

* **FEV-1132:**  Player breaks when there is no KS and dual plugin is configured ([#48](https://github.com/kaltura/playkit-js-dual-screen/issues/48)) ([ddc5681](https://github.com/kaltura/playkit-js-dual-screen/commit/ddc568108f0bcf863505c74c3be27968ceb47d0c))
* **FEV-1142:** Returning to a wrong layout when using DVR for getting back to a "non-slides" point ([#47](https://github.com/kaltura/playkit-js-dual-screen/issues/47)) ([2d2ac16](https://github.com/kaltura/playkit-js-dual-screen/commit/2d2ac1639a7eeb0e49b942652da36861a99da84d))

### [1.7.5](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.3...v1.7.5) (2021-11-05)


### Bug Fixes

* **FEV-1103:** incorrect live indicator color (state) appear when changing states between DVR to live ([#43](https://github.com/kaltura/playkit-js-dual-screen/issues/43)) ([b020a2b](https://github.com/kaltura/playkit-js-dual-screen/commit/b020a2b8cb8480bd12073cd1dd54534b207191fc))
* **FEV-1120:** parent and child screens cannot be switched on SBS layout ([#45](https://github.com/kaltura/playkit-js-dual-screen/issues/45)) ([a7c1f95](https://github.com/kaltura/playkit-js-dual-screen/commit/a7c1f95907784881770f8bc3620400470e1e3815))
* **FEV-1127:** slide appear in child container when changing slides in webcast application while producer set "hide slides" mode ([#44](https://github.com/kaltura/playkit-js-dual-screen/issues/44)) ([914225e](https://github.com/kaltura/playkit-js-dual-screen/commit/914225ebcfc18a4c3e97ef9b29e98ae342002bdd))
* **FEV-1130:** Captions disappear when child video is in hidden mode ([#46](https://github.com/kaltura/playkit-js-dual-screen/issues/46)) ([3108788](https://github.com/kaltura/playkit-js-dual-screen/commit/31087880e4cc8265e435610976126cde763e548a))

### [1.7.4](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.3...v1.7.4) (2021-11-04)


### Bug Fixes

* **FEV-1130:** add z-index to subtitles on single-view layout ([9483adc](https://github.com/kaltura/playkit-js-dual-screen/commit/9483adca95d9d339816600fea0d081c0aee40f34))

### [1.7.3](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.2...v1.7.3) (2021-10-28)


### Bug Fixes

* **FEV-1122:** Slides switching breaks the current layout and changes it back to the default one ([#42](https://github.com/kaltura/playkit-js-dual-screen/issues/42)) ([b1f816c](https://github.com/kaltura/playkit-js-dual-screen/commit/b1f816cc734ee06b734fc1ebadf99445c1662316))

### [1.7.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.0...v1.7.2) (2021-10-26)


### Bug Fixes

* **FEV-1100:** when seeking more than one slide ahead it, slide loading is noticeable ([#40](https://github.com/kaltura/playkit-js-dual-screen/issues/40)) ([fcfe92c](https://github.com/kaltura/playkit-js-dual-screen/commit/fcfe92c))
* **FEV-1107:** changing layouts via player does not work ([#38](https://github.com/kaltura/playkit-js-dual-screen/issues/38)) ([bf4cf62](https://github.com/kaltura/playkit-js-dual-screen/commit/bf4cf62))
* **FEV-1109:** deleted slides leave black screen ([#39](https://github.com/kaltura/playkit-js-dual-screen/issues/39)) ([aaf32df](https://github.com/kaltura/playkit-js-dual-screen/commit/aaf32df))
* **FEV-1115:** portrait slides are shown landscape ([#41](https://github.com/kaltura/playkit-js-dual-screen/issues/41)) ([6207cd5](https://github.com/kaltura/playkit-js-dual-screen/commit/6207cd5))



## [1.7.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.2...v1.7.0) (2021-10-12)


### Features

* **FEV-1011:** handle view-change cue-points ([#37](https://github.com/kaltura/playkit-js-dual-screen/issues/37)) ([53e2e57](https://github.com/kaltura/playkit-js-dual-screen/commit/53e2e57))
* **FEV-993:** getting thumb cue points using cue point service ([#36](https://github.com/kaltura/playkit-js-dual-screen/issues/36)) ([dcc8051](https://github.com/kaltura/playkit-js-dual-screen/commit/dcc8051))



### [1.6.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.1...v1.6.2) (2021-09-20)



### [1.6.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.0...v1.6.1) (2021-09-20)


### Bug Fixes

* **FEV-1016:** script for QA drop ([#35](https://github.com/kaltura/playkit-js-dual-screen/issues/35)) ([62a6e37](https://github.com/kaltura/playkit-js-dual-screen/commit/62a6e37))



## [1.6.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.5.0...v1.6.0) (2021-09-15)


### Bug Fixes

* **FEV-1070:** For entry with one source and uploaded slides the player will show error ([#32](https://github.com/kaltura/playkit-js-dual-screen/issues/32)) ([4b9dc56](https://github.com/kaltura/playkit-js-dual-screen/commit/4b9dc56))


### Features

* **FEV-1016:** CuePoint Manager - Push data to native tracks API ([#33](https://github.com/kaltura/playkit-js-dual-screen/issues/33)) ([a7bd2b1](https://github.com/kaltura/playkit-js-dual-screen/commit/a7bd2b1))
* **FEV-1016:** CuePoint Manager - QA scripts ([#34](https://github.com/kaltura/playkit-js-dual-screen/issues/34)) ([9619a1b](https://github.com/kaltura/playkit-js-dual-screen/commit/9619a1b))
* **FEV-1024:** image-sync-manager and image player unit tests ([#31](https://github.com/kaltura/playkit-js-dual-screen/issues/31)) ([a6df8e4](https://github.com/kaltura/playkit-js-dual-screen/commit/a6df8e4))



## [1.5.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.4.0...v1.5.0) (2021-08-18)


### Bug Fixes

* **FEV-1046:** IE11 - Dual-screen plugin's layouts are broken ([#25](https://github.com/kaltura/playkit-js-dual-screen/issues/25)) ([03b4550](https://github.com/kaltura/playkit-js-dual-screen/commit/03b4550))
* **FEV-1065:** resolve ready promise for non-dual medias ([#28](https://github.com/kaltura/playkit-js-dual-screen/issues/28)) ([116e6c1](https://github.com/kaltura/playkit-js-dual-screen/commit/116e6c1))


### Features

* **FEC-11399:** allow ignoring server config ([#29](https://github.com/kaltura/playkit-js-dual-screen/issues/29)) ([f405cb3](https://github.com/kaltura/playkit-js-dual-screen/commit/f405cb3)), closes [kaltura-player-js#480](https://github.com/kaltura/playkit-js-dual-screen/issues/480) [playkit-js-providers#153](https://github.com/kaltura/playkit-js-dual-screen/issues/153)
* **FEV-1020:** [P2] Image player - Create image player component ([#26](https://github.com/kaltura/playkit-js-dual-screen/issues/26)) ([e4572a0](https://github.com/kaltura/playkit-js-dual-screen/commit/e4572a0))



## [1.4.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.2...v1.4.0) (2021-07-27)


### Bug Fixes

* **FEC-1007:** configuring the default layout to be a single layout of the secondary doesn't work ([#21](https://github.com/kaltura/playkit-js-dual-screen/issues/21)) ([adba57d](https://github.com/kaltura/playkit-js-dual-screen/commit/adba57d))
* **FEV-1005:** side by side inverse ([#23](https://github.com/kaltura/playkit-js-dual-screen/issues/23)) ([ab6e36e](https://github.com/kaltura/playkit-js-dual-screen/commit/ab6e36e))
* **FEV-1006:** primary player wait for secondary player ([#24](https://github.com/kaltura/playkit-js-dual-screen/issues/24)) ([3623547](https://github.com/kaltura/playkit-js-dual-screen/commit/3623547))
* **FEV-962:** responsiveness - handle small size of player ([#20](https://github.com/kaltura/playkit-js-dual-screen/issues/20)) ([726aeb9](https://github.com/kaltura/playkit-js-dual-screen/commit/726aeb9))


### Features

* **FEV-826:** I as a user want to enable captions function in dual-screen plugin ([#22](https://github.com/kaltura/playkit-js-dual-screen/issues/22)) ([7995475](https://github.com/kaltura/playkit-js-dual-screen/commit/7995475))



### [1.3.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.1...v1.3.2) (2021-07-13)


### Bug Fixes

* **FEV-921:** video sync on pause ([#19](https://github.com/kaltura/playkit-js-dual-screen/issues/19)) ([17a2b69](https://github.com/kaltura/playkit-js-dual-screen/commit/17a2b69))
* **FEV-974:** use draggable target to define draggable area ([#18](https://github.com/kaltura/playkit-js-dual-screen/issues/18)) ([63fb546](https://github.com/kaltura/playkit-js-dual-screen/commit/63fb546))



### [1.3.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.0...v1.3.1) (2021-07-06)


### Bug Fixes

* **FEC-969:** an error is displayed on the player console ([#17](https://github.com/kaltura/playkit-js-dual-screen/issues/17)) ([c41a68d](https://github.com/kaltura/playkit-js-dual-screen/commit/c41a68d))
* **FEC-970:** changing a dual-screen entry to be Unlisted triggers an error on the player ([#16](https://github.com/kaltura/playkit-js-dual-screen/issues/16)) ([9fc2ce4](https://github.com/kaltura/playkit-js-dual-screen/commit/9fc2ce4))



## [1.3.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.2.0...v1.3.0) (2021-07-05)


### Bug Fixes

* **FEC-10835:** update icon component in ui ([#13](https://github.com/kaltura/playkit-js-dual-screen/issues/13)) ([21c6f9b](https://github.com/kaltura/playkit-js-dual-screen/commit/21c6f9b))
* **FEC-922:** mute secondary media ([#15](https://github.com/kaltura/playkit-js-dual-screen/issues/15)) ([477f746](https://github.com/kaltura/playkit-js-dual-screen/commit/477f746))
* **FEV-923:** add tooltips ([#11](https://github.com/kaltura/playkit-js-dual-screen/issues/11)) ([8c6ec14](https://github.com/kaltura/playkit-js-dual-screen/commit/8c6ec14))
* **FEV-926:** reset layout on replay ([#12](https://github.com/kaltura/playkit-js-dual-screen/issues/12)) ([0bf6515](https://github.com/kaltura/playkit-js-dual-screen/commit/0bf6515))
* **FEV-933:** fix "Hide button" location ([#10](https://github.com/kaltura/playkit-js-dual-screen/issues/10)) ([1ef8c0b](https://github.com/kaltura/playkit-js-dual-screen/commit/1ef8c0b))
* **FEV-958:** prevent handle of pointer events for draggable area ([#9](https://github.com/kaltura/playkit-js-dual-screen/issues/9)) ([0c931df](https://github.com/kaltura/playkit-js-dual-screen/commit/0c931df))


### Features

* **FEC-885:** remove settings button from ui ([#14](https://github.com/kaltura/playkit-js-dual-screen/issues/14)) ([9bbb180](https://github.com/kaltura/playkit-js-dual-screen/commit/9bbb180))



## [1.2.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.1.0...v1.2.0) (2021-06-14)


### Build System

* add release notes ([7521142](https://github.com/kaltura/playkit-js-dual-screen/commit/7521142))
* fix entry name ([b3f5832](https://github.com/kaltura/playkit-js-dual-screen/commit/b3f5832))
* update main and npmignore ([1af7a1b](https://github.com/kaltura/playkit-js-dual-screen/commit/1af7a1b))
* update node js version ([ed55d64](https://github.com/kaltura/playkit-js-dual-screen/commit/ed55d64))
* **FEC-10700:** add CI/CD ([#4](https://github.com/kaltura/playkit-js-dual-screen/issues/4)) ([87a1995](https://github.com/kaltura/playkit-js-dual-screen/commit/87a1995))


### Features

* **FEV-869:** providers refactor ([#6](https://github.com/kaltura/playkit-js-dual-screen/issues/6)) ([e11aeec](https://github.com/kaltura/playkit-js-dual-screen/commit/e11aeec))
* **FEV-886:** Drag and Snap + Animation ([#8](https://github.com/kaltura/playkit-js-dual-screen/issues/8)) ([e297b72](https://github.com/kaltura/playkit-js-dual-screen/commit/e297b72))



## 1.1.0 (2021-06-03)


### Features

* **FEV-866:** dual screen - initial setup ([407d0c8](https://github.com/kaltura/playkit-js-dual-screen/commit/407d0c8))
* **FEV-883:** fix responsiveness for PIP mode; add types ([2d8d33e](https://github.com/kaltura/playkit-js-dual-screen/commit/2d8d33e))
* **FEV-883:** implement inverse mode ([20298ee](https://github.com/kaltura/playkit-js-dual-screen/commit/20298ee))
* **FEV-883:** Responsiveness ([4c85b8b](https://github.com/kaltura/playkit-js-dual-screen/commit/4c85b8b))
* **FEV-883:** switch to pip from side-by-side ([4d5ab66](https://github.com/kaltura/playkit-js-dual-screen/commit/4d5ab66))
* **FEV-883:** switch to PIP icon ([6c04a2c](https://github.com/kaltura/playkit-js-dual-screen/commit/6c04a2c))
