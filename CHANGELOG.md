## [0.5.0](https://github.com/localeops/localeops/compare/v0.4.0...v0.5.0) (2025-12-23)

### ⚠ BREAKING CHANGES

* **databases:** changed snapshot file name postfix

### Features

* **databases:** add default for database directory name ([2e5faf3](https://github.com/localeops/localeops/commit/2e5faf35c544aa62eb4f1e846271835dd2f54932))

### Chores

* **ci:** explicitly restrict workflow token permissions ([0cb3e07](https://github.com/localeops/localeops/commit/0cb3e070193f5cbf7dccb7be95fd7877b66d30c4))
* **deps-dev:** bump the development-dependencies group with 4 updates ([a107871](https://github.com/localeops/localeops/commit/a107871246f1d8956c7056113b82f052a4ea4af4))

### Documentation

* add early adopters call to README ([40fc701](https://github.com/localeops/localeops/commit/40fc701fd9d93512bdf3518d236ccc500ce59054))

### Continuous Integration

* **ci:** switch to use github app token instead of pat ([9695d38](https://github.com/localeops/localeops/commit/9695d38250f191a416f9d4e0e77f982c050008d2))
* **deps:** bump actions/attest-build-provenance from 1.4.3 to 3.1.0 ([a966e12](https://github.com/localeops/localeops/commit/a966e1238e6711f15a5cb36c57dc7d07ba97a025))
* **workflows:** move permissions to job level ([2ae5246](https://github.com/localeops/localeops/commit/2ae5246e7e31428d6791a0f9d3bf123276a84443))

## [0.4.0](https://github.com/localeops/localeops/compare/v0.3.37...v0.4.0) (2025-12-21)

### Features

* **ci:** add signing to release artifacts ([e329c97](https://github.com/localeops/localeops/commit/e329c97c5119f906789153be6e8121ebc70814ad))

## [0.3.37](https://github.com/localeops/localeops/compare/v0.3.36...v0.3.37) (2025-12-21)

### Bug Fixes

* add utf8 encoding for file writes ([2d6302c](https://github.com/localeops/localeops/commit/2d6302c792c289dfbb5694c91504a8775d470143))
* **framework:** fix framework serialize invocation ([b19e2d9](https://github.com/localeops/localeops/commit/b19e2d9cc4235adc1f5d737279f6becc20fae53f))

### Tests

* **framework:** add tests for framework class ([2e2069c](https://github.com/localeops/localeops/commit/2e2069c1c4cbfe1d16d6193ceaee1b05987781e2))
* **framework:** cover localization file updates in test ([321e23a](https://github.com/localeops/localeops/commit/321e23a901d96f0d67ac2058e46aa9234f01a9ad))

### Chores

* **scripts:** skip binary download during local install ([07bccbc](https://github.com/localeops/localeops/commit/07bccbcb5eb36a0644c7f020afb3162ae58271a5))

### Styles

* **framework:** format framework test files ([d324ee3](https://github.com/localeops/localeops/commit/d324ee366b13797929f3d2335cf5e837bf64e7cc))

### Documentation

* add CODEOWNERS file for code review requirements ([f4f2f49](https://github.com/localeops/localeops/commit/f4f2f4951f488e644ab625713c3424420e4f1dc3))
* add SECURITY.md ([333172c](https://github.com/localeops/localeops/commit/333172c4d098780f59b380affc2b728c036bfddd))

### Continuous Integration

* pin actions dependencies to commit hash ([fb88226](https://github.com/localeops/localeops/commit/fb88226aca5fe6127278561dcd34f1d20d6ca98d))
* run CI checks on all branches ([f72a70d](https://github.com/localeops/localeops/commit/f72a70d3f10d15262ac291676d11af8566b28ca1))
* **security:** add build provenance attestations to binaries ([47dbc61](https://github.com/localeops/localeops/commit/47dbc6143d14f259d67ed1c4fc13f3e393d87b5e))
* **security:** add explicit minimal permissions to CI workflow ([2d2a86b](https://github.com/localeops/localeops/commit/2d2a86b3da33a661b3e77d53bd2d0579c83b7987))

### Code Refactoring

* **framework:** ensure deterministic test behavior ([2cab36e](https://github.com/localeops/localeops/commit/2cab36e043443230e4dcf0b13f1b9525c14bc7b6))
* **framework:** refactor framework class ([63f7f08](https://github.com/localeops/localeops/commit/63f7f0819bd80d76396b857c9d82483e4cf30d85))
* **framework:** use resource path schema in translation schema ([c8667f1](https://github.com/localeops/localeops/commit/c8667f10875c087a111fbb94bfccd86b2bb1d7e1))

## [0.3.36](https://github.com/localeops/localeops/compare/v0.3.35...v0.3.36) (2025-12-15)

### Bug Fixes

* **ci:** pin exact dependency versions and remove frozen-lockfile check ([19375c4](https://github.com/localeops/localeops/commit/19375c4d1e411fd7d6ef2d38d1a6b64516fbf4a2))

### Chores

* **deps-dev:** bump @types/bun in the development-dependencies group ([87947c8](https://github.com/localeops/localeops/commit/87947c8e059e83455b4e4bd090b818a8aecfe0da))
* **deps-dev:** bump lefthook in the development-dependencies group ([d1fdef9](https://github.com/localeops/localeops/commit/d1fdef9c48f76f7f14d121747fd976a7eead348b))

### Documentation

* add basic diagram of localeops workflow ([e73feaf](https://github.com/localeops/localeops/commit/e73feaf999b315611755c5b9670523fb1f0d12ab))
* **docs:** improve readme.md ([89e23c1](https://github.com/localeops/localeops/commit/89e23c13b2b9e6d654e649b9bdb57ba6d4b7d5f3))

### Continuous Integration

* **deps:** bump actions/cache from 4 to 5 ([5b475a3](https://github.com/localeops/localeops/commit/5b475a32377f5c7805490a8b939aac9749ac4055))
* **deps:** bump actions/upload-artifact from 5 to 6 ([ea52588](https://github.com/localeops/localeops/commit/ea5258873e3b35ee1ad508f5ac270b36affdf643))

## [0.3.35](https://github.com/localeops/localeops/compare/v0.3.34...v0.3.35) (2025-12-07)

### Bug Fixes

* **databases:** fix create directory on setting value ([dbcd3b2](https://github.com/localeops/localeops/commit/dbcd3b204a9e4ff4bc0a680950ccbbee230a42c8))

## [0.3.34](https://github.com/localeops/localeops/compare/v0.3.33...v0.3.34) (2025-12-07)

### Bug Fixes

* **apply:** return if not translation passed to apply ([d22718d](https://github.com/localeops/localeops/commit/d22718d36454e7a38d74923514b52d74d5eedb57))

### Chores

* reduce release cadence ([47e53fc](https://github.com/localeops/localeops/commit/47e53fcf4f3a26ca5592eaddf46c0989d74c9f60))

## [0.3.33](https://github.com/localeops/localeops/compare/v0.3.32...v0.3.33) (2025-12-06)

### Documentation

* add README formatting ([5d7152c](https://github.com/localeops/localeops/commit/5d7152c795319001427ebfc5a63d87192643d5b3))

## [0.3.32](https://github.com/localeops/localeops/compare/v0.3.31...v0.3.32) (2025-12-06)

### Documentation

* add initial localeops description ([57eed8b](https://github.com/localeops/localeops/commit/57eed8b3d5a70f56dd9bbd74813693c51a3c0e72))

## [0.3.31](https://github.com/localeops/localeops/compare/v0.3.30...v0.3.31) (2025-12-06)

### Code Refactoring

* **cli:** reserve stdout for application output ([3382295](https://github.com/localeops/localeops/commit/338229590ccd82f7bc9a9fefece1c8bdf86a52a6))

## [0.3.30](https://github.com/localeops/localeops/compare/v0.3.29...v0.3.30) (2025-12-06)

### Code Refactoring

* set stdout to ignore by default for running commands ([0eae950](https://github.com/localeops/localeops/commit/0eae9509c593e34f004d70ab28570de16906468a))

## [0.3.29](https://github.com/localeops/localeops/compare/v0.3.28...v0.3.29) (2025-12-06)

### Code Refactoring

* **cli:** log extract command output to be consumed in later steps ([fb4f2e7](https://github.com/localeops/localeops/commit/fb4f2e7329e697841748c9d703f81210692eb1e8))

## [0.3.28](https://github.com/localeops/localeops/compare/v0.3.27...v0.3.28) (2025-12-06)

### Code Refactoring

* **cli:** use config for extracting ([ebb5ecd](https://github.com/localeops/localeops/commit/ebb5ecd3ea81990b4e5d73be9967c3742893447d))

## [0.3.27](https://github.com/localeops/localeops/compare/v0.3.26...v0.3.27) (2025-12-06)

### Chores

* **deps-dev:** bump lefthook from 1.13.6 to 2.0.8 ([b8497f0](https://github.com/localeops/localeops/commit/b8497f01ae2cc13614066ca6ad1cdc2c7a692c6b))
* **deps-dev:** bump the development-dependencies group with 2 updates ([ec89747](https://github.com/localeops/localeops/commit/ec897474ec1e1e2b2fa5aa549ae14e29bdc94eba))

### Continuous Integration

* remove frozen-lockfile from release and build workflows ([9337ec4](https://github.com/localeops/localeops/commit/9337ec49e0e4b3faaf793377084779e6be3cb967))

## [0.3.26](https://github.com/localeops/localeops/compare/v0.3.25...v0.3.26) (2025-12-06)

### Chores

* **deps-dev:** bump conventional-changelog-conventionalcommits ([b374e52](https://github.com/localeops/localeops/commit/b374e523b4745ad96993bf136a488d61e6098d5a))

## [0.3.25](https://github.com/localeops/localeops/compare/v0.3.24...v0.3.25) (2025-12-06)

### Chores

* **deps-dev:** bump @semantic-release/exec from 6.0.3 to 7.1.0 ([72ae5e8](https://github.com/localeops/localeops/commit/72ae5e861367ae3745191044174d1de0216fd36b))

### Continuous Integration

* use pull_request.user.login for dependabot detection ([4f7f1c2](https://github.com/localeops/localeops/commit/4f7f1c280accab78ca2fe02696783fc05b9ad474))

## [0.3.24](https://github.com/localeops/localeops/compare/v0.3.23...v0.3.24) (2025-12-06)

### Continuous Integration

* skip frozen-lockfile for dependabot PRs ([b8f4a40](https://github.com/localeops/localeops/commit/b8f4a4033b7a3695cae124e8a80a299f1a4b06e1))

## [0.3.23](https://github.com/localeops/localeops/compare/v0.3.22...v0.3.23) (2025-12-06)

### Continuous Integration

* **deps:** bump actions/setup-node from 4 to 6 ([2a734ba](https://github.com/localeops/localeops/commit/2a734bae0744337fd8cfe4d4514066760ff08ab3))

## [0.3.22](https://github.com/localeops/localeops/compare/v0.3.21...v0.3.22) (2025-12-06)

### Continuous Integration

* **deps:** bump actions/checkout from 4 to 6 ([edbd137](https://github.com/localeops/localeops/commit/edbd1370698818ce7f7d7f704ac1a61da981a9c0))

## [0.3.21](https://github.com/localeops/localeops/compare/v0.3.20...v0.3.21) (2025-12-06)

### Continuous Integration

* **deps:** bump actions/upload-artifact from 4 to 5 ([59a0928](https://github.com/localeops/localeops/commit/59a0928356f9dce13ac61c49e00055eef6cd4214))

## [0.3.20](https://github.com/localeops/localeops/compare/v0.3.19...v0.3.20) (2025-12-06)

### Continuous Integration

* **dep:** add dependabot configuration for automated dependency updates ([b777963](https://github.com/localeops/localeops/commit/b777963e48b7a98612a3bd8908bbed1679077883))

## [0.3.19](https://github.com/localeops/localeops/compare/v0.3.18...v0.3.19) (2025-12-06)

### Build System

* **deps-dev:** bump js-yaml from 4.1.0 to 4.1.1 ([c911e8c](https://github.com/localeops/localeops/commit/c911e8c8b8a88c37b5c0680581703f479a3f2853))

## [0.3.18](https://github.com/localeops/localeops/compare/v0.3.17...v0.3.18) (2025-12-06)

### Code Refactoring

* **databases:** remove sqlite and mysql adapters ([fc721cd](https://github.com/localeops/localeops/commit/fc721cd11a6cadcd9c8c95e00356e14d1d96fa33))
* **sources:** remove bitbucket source adapter ([8635f82](https://github.com/localeops/localeops/commit/8635f82abf8e4cfe96d6fa447c7f573f6a766463))

## [0.3.17](https://github.com/localeops/localeops/compare/v0.3.16...v0.3.17) (2025-12-05)

### Bug Fixes

* **databases:** commit database file after updates in database ([207fdab](https://github.com/localeops/localeops/commit/207fdab8bfb5b41295fdf7d684b6913d44d8652a))

## [0.3.16](https://github.com/localeops/localeops/compare/v0.3.15...v0.3.16) (2025-12-05)

### Documentation

* **docs:** add action examples for github and bitbucket ([1d1772a](https://github.com/localeops/localeops/commit/1d1772a41392010e4d98afaa252a1228d36fabf6))
* **docs:** add comments to example action files ([21f0594](https://github.com/localeops/localeops/commit/21f059402b58ec3a4c7f638106524fd1cf287038))
* **docs:** use npx to install localeops ([1c32c06](https://github.com/localeops/localeops/commit/1c32c0673c4d0196519ff97317776d1d5a93ac6b))

## [0.3.15](https://github.com/localeops/localeops/compare/v0.3.14...v0.3.15) (2025-12-04)

### Chores

* include bin directory ([93ad78b](https://github.com/localeops/localeops/commit/93ad78b9c51f7629d6626b5ef3ee610f53c5f2d5))

## [0.3.14](https://github.com/localeops/localeops/compare/v0.3.13...v0.3.14) (2025-12-04)

### Chores

* add darwin-arm64 download support ([cec1185](https://github.com/localeops/localeops/commit/cec1185096849591b13ad50b87be2f89c1966801))

## [0.3.13](https://github.com/localeops/localeops/compare/v0.3.12...v0.3.13) (2025-12-04)

### Continuous Integration

* **ci:** build macos binary artifact ([aba9934](https://github.com/localeops/localeops/commit/aba993452cca025b781412f25be35f26befad98a))

## [0.3.12](https://github.com/localeops/localeops/compare/v0.3.11...v0.3.12) (2025-12-04)

### Chores

* **misc:** remove peer dependencies ([e32d7fc](https://github.com/localeops/localeops/commit/e32d7fce3ff034b9927df49e39f1ae0a2359ec7f))

## [0.3.11](https://github.com/localeops/localeops/compare/v0.3.10...v0.3.11) (2025-12-04)

### Continuous Integration

* **ci:** fix dependency install in action files ([e3bfc0c](https://github.com/localeops/localeops/commit/e3bfc0c23311d6262e29d743190eea56faa979e3))

## [0.3.10](https://github.com/localeops/localeops/compare/v0.3.9...v0.3.10) (2025-12-04)

### Chores

* add missing updated bun.lock ([677b715](https://github.com/localeops/localeops/commit/677b715ef08d6bc50ad196f0381107f5cef8c2d7))
* add postinstall script to download binary ([f82a046](https://github.com/localeops/localeops/commit/f82a046488d931fdd90c9bad6f0e7160e295c134))
* move all dependencies to devDependencies ([2c849db](https://github.com/localeops/localeops/commit/2c849db0b9283d85277eaa310bfa0c753417198a))
* remove windows download support ([bb21f6a](https://github.com/localeops/localeops/commit/bb21f6ae3bae5c7800037ee4bf7629d485b942eb))

## [0.3.9](https://github.com/localeops/localeops/compare/v0.3.8...v0.3.9) (2025-12-03)

### Chores

* add missing package-lock file ([1c4e7e0](https://github.com/localeops/localeops/commit/1c4e7e09472f46e832924a6fc05618be40e3b337))

### Documentation

* **ci:** make localeops.yml up to date with config ([03e7d5d](https://github.com/localeops/localeops/commit/03e7d5d2eb9fe16dcfb85ba5b0070a2c96a762ea))
* remove unused .env.example ([df56967](https://github.com/localeops/localeops/commit/df569676125bc17ebc8f5f2e70f2f1ee913b13e5))

### Code Refactoring

* change transport to vcs workflow ([ccc1358](https://github.com/localeops/localeops/commit/ccc1358932daf376ad1ee48f4f9ba31d42c0adab))
* improvement to path resolution, logging and structure ([bd719c2](https://github.com/localeops/localeops/commit/bd719c2d3ee74d63075b1fb98071b80f64813e7c))
* **misc:** refactor multiple modules ([ca325bd](https://github.com/localeops/localeops/commit/ca325bd3cc8fb30cd439ec281331958b87312844))
* remove old state class ([12f8859](https://github.com/localeops/localeops/commit/12f88594167e5ad2541586c6cd44a61c4ccae977))

## [0.3.8](https://github.com/localeops/localeops/compare/v0.3.7...v0.3.8) (2025-12-03)

### Bug Fixes

* **ci:** resolve npm warnings ([3e493a3](https://github.com/localeops/localeops/commit/3e493a319d12740da0cccf6e167ff301ee64ea77))

## [0.3.7](https://github.com/localeops/localeops/compare/v0.3.6...v0.3.7) (2025-12-03)

### Bug Fixes

* **ci:** add public config for npm publishing ([92e831c](https://github.com/localeops/localeops/commit/92e831c84517c3574840389d38faa2fa5fae1dc9))

## [0.3.6](https://github.com/localeops/localeops/compare/v0.3.5...v0.3.6) (2025-12-03)

### Documentation

* **docs:** update docs to trigger npm publishing ([382b260](https://github.com/localeops/localeops/commit/382b2600216f453a26b89a2b9631dfa99c7b21f8))

## [0.3.5](https://github.com/localeops/localeops/compare/v0.3.4...v0.3.5) (2025-12-03)

### Documentation

* **docs:** match package.json description ([e31fc11](https://github.com/localeops/localeops/commit/e31fc11ed68b2c5baecefa86c5ef97abb760d550))

## [0.3.4](https://github.com/localeops/localeops/compare/v0.3.3...v0.3.4) (2025-12-03)

### Bug Fixes

* **ci:** add missing dependency ([be8a6d2](https://github.com/localeops/localeops/commit/be8a6d233707acfb7476480d28c1871a2757aeaf))

### Chores

* **misc:** add cz-customizable config ([5ae0c24](https://github.com/localeops/localeops/commit/5ae0c24f31698de13090177372716392fb321a3c))

### Continuous Integration

* **ci:** publish to npm ([31fabfd](https://github.com/localeops/localeops/commit/31fabfdb63976b015d79a41037052c521ef8786e))

## [0.3.3](https://github.com/localeops/localeops/compare/v0.3.2...v0.3.3) (2025-11-12)

### Bug Fixes

* correct release artifact upload configuration ([72b8a8e](https://github.com/localeops/localeops/commit/72b8a8ede7cd76aedee406cbc01199e8c092cee3))

## [0.3.2](https://github.com/localeops/localeops/compare/v0.3.1...v0.3.2) (2025-11-12)

### Bug Fixes

* update deprecated GitHub Actions to v4 ([909f6bb](https://github.com/localeops/localeops/commit/909f6bbd2199cef14bb8ea7921a5b885169f7348))

## [0.3.1](https://github.com/localeops/localeops/compare/v0.3.0...v0.3.1) (2025-11-12)

### Continuous Integration

* add cross-platform build workflow for Linux binaries ([7e54239](https://github.com/localeops/localeops/commit/7e54239b38a0606e82aaeefb518567fc8bfc57d6))

## [0.3.0](https://github.com/localeops/localeops/compare/v0.2.0...v0.3.0) (2025-11-11)

### Features

* implement mysql database adapter ([4586810](https://github.com/localeops/localeops/commit/4586810cbdacac53076ff7e8659d7dbfde394da2))

## [0.2.0](https://github.com/localeops/localeops/compare/v0.1.1...v0.2.0) (2025-11-11)

### Features

* enable custom exernal database adapters ([1b2f1ca](https://github.com/localeops/localeops/commit/1b2f1cae2498cbc769e7570ce4805ac4fce2f0da))

### Documentation

* add custom database adapter configuration documentation ([173e567](https://github.com/localeops/localeops/commit/173e5677f66e65de661bfb4cb08ca0f9287931ed))

## [0.1.1](https://github.com/localeops/localeops/compare/v0.1.0...v0.1.1) (2025-11-10)

### Documentation

* add project description to README ([2311d6a](https://github.com/localeops/localeops/commit/2311d6af26f169da5e6c9a13f3d56aa55fdb8a19))
