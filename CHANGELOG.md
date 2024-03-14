# Changelog

## [1.10.0](https://github.com/deven-org/telemetry-functions/compare/v1.9.0...v1.10.0) (2024-03-14)


### Features

* add AWS stack and resources, add documentation ([ddf9e99](https://github.com/deven-org/telemetry-functions/commit/ddf9e99c88fe75614132f970eda9b4d9cdcf0782))
* add dev mode to test function with actual github events ([21ddccb](https://github.com/deven-org/telemetry-functions/commit/21ddccbc58d8d10d6257de70b75029a942d661c9))
* add ID and SHA to check-suite ([0a8d000](https://github.com/deven-org/telemetry-functions/commit/0a8d000257ce6d8cd26a1de10d74b298709e4a9d))
* add metric for updated documentation ([05937ba](https://github.com/deven-org/telemetry-functions/commit/05937babfe461df7301cbd24e76011bad7e8f268))
* add over100Files flag to documentation_updated ([8d02a5c](https://github.com/deven-org/telemetry-functions/commit/8d02a5c856828540fb958657ade6a62c7a43e4a3))
* add pull request head_sha to metric outputs ([2aaf14b](https://github.com/deven-org/telemetry-functions/commit/2aaf14b3d54a9ffafc579cbc99082b676bc77a9c))
* add status to metric data ([df150a3](https://github.com/deven-org/telemetry-functions/commit/df150a3b7904c5133fee552e93f83ea95ab4310d))
* add workflow job head_sha to output ([d6a1b16](https://github.com/deven-org/telemetry-functions/commit/d6a1b16a23091992741a7f53e8c17e89d06d68a1))
* add workflow job id to output ([52e7938](https://github.com/deven-org/telemetry-functions/commit/52e793855b7ca72add64c13dab9723abcdf3e2d9))
* align json file parsing for deployments and tooling-usage ([a9e1200](https://github.com/deven-org/telemetry-functions/commit/a9e1200141d55a5449ae3a6a7e6daef234a041b5))
* change api dpenedent commits-per-pr and deployments metric output and handle status ([7589b40](https://github.com/deven-org/telemetry-functions/commit/7589b4042fc0f0dfd3aac3a38f57afd849bf81d9))
* change api-dependent data of documentation_updated ([d4b0898](https://github.com/deven-org/telemetry-functions/commit/d4b0898034d66774ae0809c64c55cb07b40d6760))
* change release_versions to be based on tag creation events ([c6d86c2](https://github.com/deven-org/telemetry-functions/commit/c6d86c2be44b6ab0d0c047866d4a6605a0c230ac))
* check config file for documentation skeleton usage metric ([9c46ba0](https://github.com/deven-org/telemetry-functions/commit/9c46ba0baf0d3a8001a0a6c20de24b4e4fa65390))
* improve api-dependent tooling_usage output ([1ae6337](https://github.com/deven-org/telemetry-functions/commit/1ae633711f3e2787d488aacd714bdfece38bf358))
* improve naming and add more logs to store-data ([15dd7f1](https://github.com/deven-org/telemetry-functions/commit/15dd7f18dd018295178c5ff7163f0de1d2d93d50))
* only record commits-per-pr for merged prs ([b153a5d](https://github.com/deven-org/telemetry-functions/commit/b153a5d952968c659e0013abc22f5aa906acb1c8))
* refine test_coverage test detection and filter out jobs that don't mention tests ([dd23472](https://github.com/deven-org/telemetry-functions/commit/dd23472cf9883156424105d409b65cb5fb6bbb4a))
* remove redundant status and add/keep conclusion for workflow jobs and steps ([0c09100](https://github.com/deven-org/telemetry-functions/commit/0c0910042bc0096a239731113a02354ebb697154))
* report the existence of unhandled errors ([e20ffc4](https://github.com/deven-org/telemetry-functions/commit/e20ffc4bc5453da57c4018325e546499fbe2c475))
* skip any events coming from the data repo ([a8379bd](https://github.com/deven-org/telemetry-functions/commit/a8379bd7337fd629483eec908a4ad208c82ad86c))
* store data using tree instead of single commits ([e09d689](https://github.com/deven-org/telemetry-functions/commit/e09d689e0fe1c84b118d34a6f0f77ac75251dfb4))
* update code-review-involvement metric to handle closed but not merged PRs ([6263669](https://github.com/deven-org/telemetry-functions/commit/6263669218b64985d70a27e1ddcb9e1e1734a039))
* use namespaces for trigger signatures ([203d9a9](https://github.com/deven-org/telemetry-functions/commit/203d9a90d7fb2915be8b28eecf6d143c8675ca33))
* use PR ID as identifier instead of PR number ([088dd5b](https://github.com/deven-org/telemetry-functions/commit/088dd5bbb770e9ffbc84d2083e6ddd7c24ec59b6))
* use separate token for data repo write access ([7f36563](https://github.com/deven-org/telemetry-functions/commit/7f36563ec267cb57933bd57e6dfe6a7b8dee87b7))


### Bug Fixes

* add staggering timeout when storing data ([5710114](https://github.com/deven-org/telemetry-functions/commit/5710114671e5945ab2c15f5afcef8c8926445102))
* better representation of commit timestamps - don't default to now ([aa67028](https://github.com/deven-org/telemetry-functions/commit/aa67028b286511732ecb4e23ec5499ca0efa6fb9))
* convert test_coverage step datetime to unix timestamp like in other metrics ([de95816](https://github.com/deven-org/telemetry-functions/commit/de958160df16cdd065548fb21403bc2fdb4cc5aa))
* do not return created data in lambda handler ([ced9727](https://github.com/deven-org/telemetry-functions/commit/ced972773d21a92f6ecd55505232ab8cb12478d1))
* improve error messages ([28b04f9](https://github.com/deven-org/telemetry-functions/commit/28b04f9c8bf9eefa3b9321c12feaac978c665ec9))
* remove check-suite duration ([f368368](https://github.com/deven-org/telemetry-functions/commit/f3683682e45218abd6e818c7280c6a194976e632))
* remove dependencies from tooling usage output ([ea1f59c](https://github.com/deven-org/telemetry-functions/commit/ea1f59c895e94e7e18182a985608bef0b357f902))
* remove duplicate data from documentation_updated ([d992a08](https://github.com/deven-org/telemetry-functions/commit/d992a0804499552cb96379f31c9c5d5b1fbd3ee7))
* remove packages from code-review-involvement metric output ([6a52e2b](https://github.com/deven-org/telemetry-functions/commit/6a52e2ba4a4bc35e374efc57f70d4e7f6f876dfb))
* remove repo and owner from tooling usage output ([731abf6](https://github.com/deven-org/telemetry-functions/commit/731abf6949fbcb0c3443a54dfd3d91bd9ecf4bb4))
* remove unnecessary data from workflows output ([f1a9780](https://github.com/deven-org/telemetry-functions/commit/f1a97800fa9592eb91bfbb84d0ae5b60aa030e0a))
* request maximum number of files with one api call ([548e59b](https://github.com/deven-org/telemetry-functions/commit/548e59bbf87aa8e9213a81499ebaaa5e5da197c3))
* resolve new linting warnings and errors ([05b96c5](https://github.com/deven-org/telemetry-functions/commit/05b96c5eca8149423fe829afec078ff296ba00bc))
* save correct registry for deven-documentation-skeleton in lock ([452ad1e](https://github.com/deven-org/telemetry-functions/commit/452ad1e1b2ab16f59bfd98aa916e8672fc9437b7))
* set correct values for deployment metric output ([8953629](https://github.com/deven-org/telemetry-functions/commit/89536298b35c934f730d794eaa2761502bd45780))
* set proper fallback values if pr is not merged ([894c00b](https://github.com/deven-org/telemetry-functions/commit/894c00b935bbadc69eae9957f6dda6a3be5f73b4))
* typo ([3997d8a](https://github.com/deven-org/telemetry-functions/commit/3997d8ae31ab7adbd60b2899d5ee7de325bbe12f))
* use correct commit for deployments metric package_json ([5b41adb](https://github.com/deven-org/telemetry-functions/commit/5b41adbc7c1ed57c47d3ffbc09c88a57373f9f05))
* use correct endpoint to get all files of a pr ([50604e1](https://github.com/deven-org/telemetry-functions/commit/50604e1c2fa4daa59571351c245156a91a7168de))
* use status type and easier branching in documentation_updated ([9854772](https://github.com/deven-org/telemetry-functions/commit/9854772ef06ed9a0bade034f4449c6940bb24f7c))

## [1.9.0](https://github.com/deven-org/telemetry-functions/compare/v1.8.0...v1.9.0) (2023-11-14)


### Features

* doc added for webhook events ([#86](https://github.com/deven-org/telemetry-functions/issues/86)) ([2dfff52](https://github.com/deven-org/telemetry-functions/commit/2dfff5239fd7abf0759c67bc181463bc400a4c00))
* doc testing added ([#84](https://github.com/deven-org/telemetry-functions/issues/84)) ([2c5b972](https://github.com/deven-org/telemetry-functions/commit/2c5b972f24f2ac89e78f9cef9fc266a44f7254b0))
* enable no-explicit-any lint rule ([266fa80](https://github.com/deven-org/telemetry-functions/commit/266fa80809f4ecfd914b36923e089e8ba9e1727a))
* **test-coverage:** add tests metrics ([b777767](https://github.com/deven-org/telemetry-functions/commit/b7777676c499e0ec33cdfade2840bf6a5cd728b3))


### Bug Fixes

* minor fixes, ramda update ([35be744](https://github.com/deven-org/telemetry-functions/commit/35be744594edd309fb3a0c86f7412e615b55d4fb))
* remove unused imports ([98d671e](https://github.com/deven-org/telemetry-functions/commit/98d671e1fd89754476cccb366983df572ac1fd93))

## [1.8.0](https://github.com/deven-org/telemetry-functions/compare/v1.7.0...v1.8.0) (2023-03-21)


### Features

* **metrics-signature:** add metrics signature ([#71](https://github.com/deven-org/telemetry-functions/issues/71)) ([6937168](https://github.com/deven-org/telemetry-functions/commit/6937168221fe2883a7a8d7cd40d4e2e282a8b106))

## [1.7.0](https://github.com/deven-org/telemetry-functions/compare/v1.6.0...v1.7.0) (2023-03-21)


### Features

* **check-suite:** [#34](https://github.com/deven-org/telemetry-functions/issues/34) add check suite metrics ([de4a243](https://github.com/deven-org/telemetry-functions/commit/de4a24354f6c33b60d294003176e2db43997fdf2))
* **log:** improve logger ([37a0d8c](https://github.com/deven-org/telemetry-functions/commit/37a0d8cc88c8b4c2de16b42f11a9fc320d125091))


### Bug Fixes

* **log:** add action log ([3ce9002](https://github.com/deven-org/telemetry-functions/commit/3ce90023faf1d80127f04691ecabccdd6ef3e86b))
* **storeData:** improve commit message and file structure ([738e6e6](https://github.com/deven-org/telemetry-functions/commit/738e6e60eb790452a00ecbe86de9486b3b84779f))

## [1.6.0](https://github.com/deven-org/telemetry-functions/compare/v1.5.0...v1.6.0) (2023-03-20)


### Features

* add tooling usage metric ([012bc66](https://github.com/deven-org/telemetry-functions/commit/012bc66ec1d6b4418d0854da236bf97a9253c46e))
* check for documentation skeleton ([95c6286](https://github.com/deven-org/telemetry-functions/commit/95c62862305a03453a1f7f1ebc5f1929ac7110bf))
* **workflows:** [#18](https://github.com/deven-org/telemetry-functions/issues/18) add code review involvements metrics ([d54e490](https://github.com/deven-org/telemetry-functions/commit/d54e49061cc30ff5a2a8175fdf5efc7de0beed6b))
* **workflows:** [#18](https://github.com/deven-org/telemetry-functions/issues/18) add workflows metrics ([abeb05c](https://github.com/deven-org/telemetry-functions/commit/abeb05cd8915ada9b1dafe3ffe977f3fcddbb52f))


### Bug Fixes

* **conditions:** conditions don't have to be specified in each metric ([f4c2c32](https://github.com/deven-org/telemetry-functions/commit/f4c2c32fda00ade64be40433013c4de7fa2901f0))
* **metrics:** add metrics log as example ([8371e44](https://github.com/deven-org/telemetry-functions/commit/8371e44d5d1a0231cf56e00ba31aa93c6f06048a))
* **metrics:** changes check for workflow ([c1e007a](https://github.com/deven-org/telemetry-functions/commit/c1e007a126bcf381dba9c76afa89e6f9553bbaaf))
* **metrics:** changes check for workflow ([022f68e](https://github.com/deven-org/telemetry-functions/commit/022f68e8d8104dacb254ec783bd466cf7fb0d3bb))
* **metrics:** changes check for workflow ([275df3b](https://github.com/deven-org/telemetry-functions/commit/275df3bc934b0c007f682b0b5f8b044bc4561ce0))
* **push-to-repo:** fix the file path ([86d0d2f](https://github.com/deven-org/telemetry-functions/commit/86d0d2f63f02eff469630ad77a97d2b637f79aeb))
* **store-data:** resolve events before push ([ea1f807](https://github.com/deven-org/telemetry-functions/commit/ea1f8070e4887ba60ca1ca59f93c7124c21028ef))
* **tests:** collect metrics uses mocked data ([c82c270](https://github.com/deven-org/telemetry-functions/commit/c82c270af12d57f27a1e3679575f4952ee98be6d))
* **tests:** tooling usage ([aeaadac](https://github.com/deven-org/telemetry-functions/commit/aeaadace595c692ebd602449cc3ffb7af4a5f437))
* **tests:** tooling usage ([3b509f8](https://github.com/deven-org/telemetry-functions/commit/3b509f86a7eb15ac8d1862247035565a95edef21))
* **tests:** tooling usage ([412df53](https://github.com/deven-org/telemetry-functions/commit/412df535b8df3f6cbe2a549e74923b5cc91dd71f))
* **tests:** tooling usage ([2e57772](https://github.com/deven-org/telemetry-functions/commit/2e57772626c44993b8a2cca9ab2cd3c606ec1470))
* **tests:** tooling usage ([633ec02](https://github.com/deven-org/telemetry-functions/commit/633ec02dfbf35dfbd0e59403368b3cfdc10523e7))
* **tests:** tooling usage ([6d09479](https://github.com/deven-org/telemetry-functions/commit/6d09479677ff0d0b98b078209e8838778c836afb))

## [1.5.0](https://github.com/deven-org/telemetry-functions/compare/v1.4.0...v1.5.0) (2023-03-20)


### Features

* **collect-metrics:** enable multiple collect metrics ([960b338](https://github.com/deven-org/telemetry-functions/commit/960b338d53c1285269a91233ef7a104946d69a33))


### Bug Fixes

* **condition:** remove wrong condition ([315f09d](https://github.com/deven-org/telemetry-functions/commit/315f09d1e1885fe671949bf32c9c83d8c683925d))

## [1.4.0](https://github.com/deven-org/telemetry-functions/compare/v1.3.0...v1.4.0) (2023-03-20)


### Features

* **workflow:** add workflow to sync develop with main ([db0a647](https://github.com/deven-org/telemetry-functions/commit/db0a64760e77979edf829527e82ac5485fb05652))

## [1.3.0](https://github.com/deven-org/telemetry-functions/compare/v1.2.0...v1.3.0) (2023-03-17)


### Features

* **core:** [#43](https://github.com/deven-org/telemetry-functions/issues/43) add basic tests for the core modules ([1c591a0](https://github.com/deven-org/telemetry-functions/commit/1c591a046132dcd2872284d20abf95ef42f4d0e8))

## [1.2.0](https://github.com/deven-org/telemetry-functions/compare/v1.1.0...v1.2.0) (2023-03-16)


### Features

* **documentation:** add documentation ([f94f210](https://github.com/deven-org/telemetry-functions/commit/f94f2108cab8732662d7b22f0f1ec98308fe49cd))


### Bug Fixes

* **documentation:** fix typos ([00b6efa](https://github.com/deven-org/telemetry-functions/commit/00b6efa872d96f317a35b91b6c3986f39a9ee08b))

## [1.1.0](https://github.com/deven-org/telemetry-functions/compare/v1.0.0...v1.1.0) (2023-03-15)


### Features

* add initial flow ([ebe0431](https://github.com/deven-org/telemetry-functions/commit/ebe043109322eca75f41aae43f5143675f0919f1))


### Bug Fixes

* **packages:** remove useless package ([985c928](https://github.com/deven-org/telemetry-functions/commit/985c928af58ec7ebf9c5350530938d024b235444))

## 1.0.0 (2023-03-15)


### Features

* add initial flow ([ebe0431](https://github.com/deven-org/telemetry-functions/commit/ebe043109322eca75f41aae43f5143675f0919f1))


### Bug Fixes

* **packages:** remove useless package ([985c928](https://github.com/deven-org/telemetry-functions/commit/985c928af58ec7ebf9c5350530938d024b235444))

## [1.2.0](https://github.com/deven-org/telemetry-functions/compare/v1.1.0...v1.2.0) (2023-03-06)


### Features

* **functions:** write JSON files instead of base64 ([3471b10](https://github.com/deven-org/telemetry-functions/commit/3471b101c5f5db7af44dcfc516fc298883678012))


### Bug Fixes

* show push error ([64ce354](https://github.com/deven-org/telemetry-functions/commit/64ce354dc5588a7e3ca9336d6f0223616c96ed26))
* show push error ([ea31bd2](https://github.com/deven-org/telemetry-functions/commit/ea31bd20fe32c935a0bcbd1d8f145dfa16ed4c55))
* show push error ([64f2eb3](https://github.com/deven-org/telemetry-functions/commit/64f2eb39f4a6c81f9d5d86419586c713cbe37321))
* show push error ([aca964f](https://github.com/deven-org/telemetry-functions/commit/aca964f6ab0a9547b47c174ffe4309fa664bbd6c))
* show push error ([21fecfb](https://github.com/deven-org/telemetry-functions/commit/21fecfb4f09770e9d978d7f30e343ad093dccc77))

## [1.1.0](https://github.com/deven-org/telemetry-functions/compare/v1.0.0...v1.1.0) (2023-02-28)


### Features

* **functions:** remove log and release version ([e7db333](https://github.com/deven-org/telemetry-functions/commit/e7db333ff30b8e107e683c23f1916edfc11f9e72))
* **functions:** write JSON files instead of base64 ([bb15f54](https://github.com/deven-org/telemetry-functions/commit/bb15f54f6ef7b0c21cb1b65ed741759bfc08ed60))

## 1.0.0 (2023-02-28)


### Features

* **workflow:** add release workflow ([69dd2f8](https://github.com/deven-org/telemetry-functions/commit/69dd2f8bb1becc7c36f7d2c79284b4c53951446d))


### Bug Fixes

* **workflow:** remove test ([455b2c8](https://github.com/deven-org/telemetry-functions/commit/455b2c802c9f44e96bbfb29df0713ae8342e2a7a))
