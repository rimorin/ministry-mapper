## [1.25.2](https://github.com/rimorin/ministry-mapper/compare/v1.25.1...v1.25.2) (2023-10-13)


### Bug Fixes

* load links on demand ([3da68b1](https://github.com/rimorin/ministry-mapper/commit/3da68b10f9b34cace107dbf259bb03953417f43a))

## [1.25.1](https://github.com/rimorin/ministry-mapper/compare/v1.25.0...v1.25.1) (2023-10-12)


### Bug Fixes

* hide postal code from shared link for better security ([825dfa2](https://github.com/rimorin/ministry-mapper/commit/825dfa2a93557bccb3eb055114b5bb5c591fa050))

# [1.25.0](https://github.com/rimorin/ministry-mapper/compare/v1.24.2...v1.25.0) (2023-10-04)


### Bug Fixes

* multi select logic ([cf6d26a](https://github.com/rimorin/ministry-mapper/commit/cf6d26a5bab8f26405320e9179a09b3f0a999593))


### Features

* implement multi household types ([7b9767e](https://github.com/rimorin/ministry-mapper/commit/7b9767e9dea500d644c3ad00a1c24e92eed9d0e8))


### Reverts

* Revert "build: remove react select" ([dc13eae](https://github.com/rimorin/ministry-mapper/commit/dc13eae9e51721a3d8d67e7943c304e4bcc24822))

## [1.24.2](https://github.com/rimorin/ministry-mapper/compare/v1.24.1...v1.24.2) (2023-09-29)


### Bug Fixes

* increase public housing floor limit to 50 ([7a8719a](https://github.com/rimorin/ministry-mapper/commit/7a8719ae831634756733b5ec54ba7720b2fbd9e7))
* remove empty code string check ([d490ff9](https://github.com/rimorin/ministry-mapper/commit/d490ff9de5ca95596c97d5c4bdf8c5c6e2c9b559))

## [1.24.1](https://github.com/rimorin/ministry-mapper/compare/v1.24.0...v1.24.1) (2023-09-28)


### Bug Fixes

* increase public housing floor limit to 50 ([3dc90d0](https://github.com/rimorin/ministry-mapper/commit/3dc90d0a1990acc849fa1c3392ece4abffe10050))
* remove empty code string check ([6fcb7e4](https://github.com/rimorin/ministry-mapper/commit/6fcb7e466299c4e32f84192e02cdf9278d577014))

# [1.24.0](https://github.com/rimorin/ministry-mapper/compare/v1.23.0...v1.24.0) (2023-09-27)


### Features

* assign-personal listing ([83576b1](https://github.com/rimorin/ministry-mapper/commit/83576b18e52d8a15a44c640bc9bd1a9993635a12))

# [1.23.0](https://github.com/rimorin/ministry-mapper/compare/v1.22.1...v1.23.0) (2023-09-22)


### Features

* gmap territory directions ([a455211](https://github.com/rimorin/ministry-mapper/commit/a4552111393bf053f1a55b63b323ab8478e6767e))

## [1.22.1](https://github.com/rimorin/ministry-mapper/compare/v1.22.0...v1.22.1) (2023-09-15)


### Bug Fixes

* remove unnecessary isNew field for option ([7425b8f](https://github.com/rimorin/ministry-mapper/commit/7425b8fc5007d4ff4ef8134c688250be370040d4))

# [1.22.0](https://github.com/rimorin/ministry-mapper/compare/v1.21.0...v1.22.0) (2023-09-15)


### Features

* implement admin module for hh options ([6654a90](https://github.com/rimorin/ministry-mapper/commit/6654a9087db03279506e8cbaf95fb64ea0df607f))


### Reverts

* Revert "feat: implement offline screen to indicate poor or zero internet connection" ([95165a4](https://github.com/rimorin/ministry-mapper/commit/95165a4b8c1814ccc7b248db57e6dcf376884e66))

# [1.21.0](https://github.com/rimorin/ministry-mapper/compare/v1.20.1...v1.21.0) (2023-09-03)


### Features

* implement dynamic congregation options for household ([d593b57](https://github.com/rimorin/ministry-mapper/commit/d593b5703f3348487023b93003fb079c47db191b))

## [1.20.1](https://github.com/rimorin/ministry-mapper/compare/v1.20.0...v1.20.1) (2023-08-29)


### Bug Fixes

* check invalid territory code path ([1b77a79](https://github.com/rimorin/ministry-mapper/commit/1b77a799488bc287f51c0ed4c49e4f082b34eea3))

# [1.20.0](https://github.com/rimorin/ministry-mapper/compare/v1.19.0...v1.20.0) (2023-08-10)


### Bug Fixes

* check on policy/floors before processing completion ([227f81d](https://github.com/rimorin/ministry-mapper/commit/227f81df8faf14917ae367e003a4e07c90bb3ebf))
* reauth user before changing password ([ccd21d5](https://github.com/rimorin/ministry-mapper/commit/ccd21d59e3e35085a01deb6f9ad226b206872a41))


### Features

* allow congregation name to be updated ([f4e0918](https://github.com/rimorin/ministry-mapper/commit/f4e0918f99698b04c2d9e5bcaa0f689d05ee2e6f))
* allow profile name to be updated ([5911239](https://github.com/rimorin/ministry-mapper/commit/5911239ed3732653e4e083f42bc8e9d5380bb23e))
* implement feedback/instruction email notifications ([aa069eb](https://github.com/rimorin/ministry-mapper/commit/aa069ebd53fab356a14a4e84e747cd35520f1e3f))


### Performance Improvements

* focus on pub name input on load ([97410a2](https://github.com/rimorin/ministry-mapper/commit/97410a2719d72a82ea1463422dc1572d6f1adee9))
* optimised web rendering ([4b05be5](https://github.com/rimorin/ministry-mapper/commit/4b05be5159ff34d443c42ad3e6a8cf0b05a8ae32))

# [1.19.0](https://github.com/rimorin/ministry-mapper/compare/v1.18.1...v1.19.0) (2023-07-31)


### Bug Fixes

* incorrect condition check for maxTries ([3ae78c2](https://github.com/rimorin/ministry-mapper/commit/3ae78c242eb47d9dc09ce2fb6523c5c52673e76b))


### Features

* implement congregation settings screen ([34518b2](https://github.com/rimorin/ministry-mapper/commit/34518b26a63df3a3afd5986d36196e8ad47afeb5))

## [1.18.1](https://github.com/rimorin/ministry-mapper/compare/v1.18.0...v1.18.1) (2023-07-19)


### Performance Improvements

* optimised percentage calculator function ([d51a054](https://github.com/rimorin/ministry-mapper/commit/d51a05468fe43832574a24b64bebb70aa10afa1f))

# [1.18.0](https://github.com/rimorin/ministry-mapper/compare/v1.17.1...v1.18.0) (2023-05-31)


### Bug Fixes

* handle new users who has no roles ([3835026](https://github.com/rimorin/ministry-mapper/commit/38350260208fc6885f565c413a2d4a67cde57217))
* user management logic for empty listing ([c44746c](https://github.com/rimorin/ministry-mapper/commit/c44746ce034365472c26b21e74f7dcf38b80d09b))


### Features

* implement user management module ([6f7810e](https://github.com/rimorin/ministry-mapper/commit/6f7810e28eef382b20f856a0ca320b3d2c762180))

## [1.17.1](https://github.com/rimorin/ministry-mapper/compare/v1.17.0...v1.17.1) (2023-05-11)

### Bug Fixes

- add missing wiki btn for address rename ([51548d9](https://github.com/rimorin/ministry-mapper/commit/51548d96bdd5b4b3e8d7e56c498d84a89107220c))
- fixed alignment for add unit/property wiki btn ([d3c3a97](https://github.com/rimorin/ministry-mapper/commit/d3c3a973695e02d657ace3e3610421e2d638d7fe))

# [1.17.0](https://github.com/rimorin/ministry-mapper/compare/v1.16.0...v1.17.0) (2023-05-10)

### Features

- wiki help button on every components ([793ba0f](https://github.com/rimorin/ministry-mapper/commit/793ba0f575df42724c5371b34a33c08777ee0b0f))

# [1.16.0](https://github.com/rimorin/ministry-mapper/compare/v1.15.0...v1.16.0) (2023-05-05)

### Features

- google recaptcha upgrade to enterprise version ([00077ab](https://github.com/rimorin/ministry-mapper/commit/00077aba422fbd869e50bfe5b25bc3a37bdb7107))

# [1.15.0](https://github.com/rimorin/ministry-mapper/compare/v1.14.3...v1.15.0) (2023-05-04)

### Bug Fixes

- add missing wiki btn for address rename ([51548d9](https://github.com/rimorin/ministry-mapper/commit/51548d96bdd5b4b3e8d7e56c498d84a89107220c))
- fixed alignment for add unit/property wiki btn ([d3c3a97](https://github.com/rimorin/ministry-mapper/commit/d3c3a973695e02d657ace3e3610421e2d638d7fe))

# [1.17.0](https://github.com/rimorin/ministry-mapper/compare/v1.16.0...v1.17.0) (2023-05-10)

### Features

- wiki help button on every components ([793ba0f](https://github.com/rimorin/ministry-mapper/commit/793ba0f575df42724c5371b34a33c08777ee0b0f))

# [1.16.0](https://github.com/rimorin/ministry-mapper/compare/v1.15.0...v1.16.0) (2023-05-05)

### Features

- google recaptcha upgrade to enterprise version ([00077ab](https://github.com/rimorin/ministry-mapper/commit/00077aba422fbd869e50bfe5b25bc3a37bdb7107))

# [1.15.0](https://github.com/rimorin/ministry-mapper/compare/v1.14.3...v1.15.0) (2023-05-04)

### Features

- optional publisher name entry for personal slips ([0f31755](https://github.com/rimorin/ministry-mapper/commit/0f31755baccc242c18a7f10b522fe91f084adca4))

## [1.14.3](https://github.com/rimorin/ministry-mapper/compare/v1.14.2...v1.14.3) (2023-04-26)

### Bug Fixes

- handle undefined device vendor ([e784309](https://github.com/rimorin/ministry-mapper/commit/e78430915a5acf5c5062497db8fa9a096c321069))

## [1.14.2](https://github.com/rimorin/ministry-mapper/compare/v1.14.1...v1.14.2) (2023-04-19)

### Bug Fixes

- set assignment flag to false when there is no assignments ([cb80ff5](https://github.com/rimorin/ministry-mapper/commit/cb80ff5ac3a5b621ec74b30e50acebb66268a268))

## [1.14.1](https://github.com/rimorin/ministry-mapper/compare/v1.14.0...v1.14.1) (2023-04-19)

### Bug Fixes

- syntax for hyperlink target ([73492fe](https://github.com/rimorin/ministry-mapper/commit/73492fef75b1f05c21a7fa036e14a232eda1c3f6))

# [1.14.0](https://github.com/rimorin/ministry-mapper/compare/v1.13.0...v1.14.0) (2023-04-19)

### Bug Fixes

- implement check for empty personal slip expiry date ([b269bd8](https://github.com/rimorin/ministry-mapper/commit/b269bd812c787ea95696e9e6d6adea9293f6ff8c))
- implement revoke link checker ([1ccef34](https://github.com/rimorin/ministry-mapper/commit/1ccef34af56697b7334e9333e38273b3537cd6e9))

### Features

- implement user assignments module ([ec21385](https://github.com/rimorin/ministry-mapper/commit/ec213859f89d29b2877cb6c2f5df8c5a11c40b2d))

# [1.13.0](https://github.com/rimorin/ministry-mapper/compare/v1.12.0...v1.13.0) (2023-04-17)

### Bug Fixes

- add merged file interface.tsx ([1ef1b3b](https://github.com/rimorin/ministry-mapper/commit/1ef1b3b0e5c782139a6650cfba8d939b79a3b6f0))
- **admin/user:** change directions from hyperlink to button ([47f5391](https://github.com/rimorin/ministry-mapper/commit/47f5391520527d96d1140af13decda542351f0b7))
- **admin:** add placeholder optional for unitPostal ([dbb42a4](https://github.com/rimorin/ministry-mapper/commit/dbb42a440d5c6bc79a40a744b1cca878eb6e6d43))
- unit postal is now property postal ([e43c5b0](https://github.com/rimorin/ministry-mapper/commit/e43c5b015c1edfaff3abede768f4ece7dfe3019f))

### Features

- display environment when environment name does not begin with production ([5f3adb2](https://github.com/rimorin/ministry-mapper/commit/5f3adb2797448e203e4bfd8a72b81433a77293b7))
- individual postal code for houses ([82e367d](https://github.com/rimorin/ministry-mapper/commit/82e367da9c920d243bce172bfef43992c783eb8f))

# [1.12.0](https://github.com/rimorin/ministry-mapper/compare/v1.11.0...v1.12.0) (2023-04-14)

### Bug Fixes

- eslinter run ([5aece8b](https://github.com/rimorin/ministry-mapper/commit/5aece8b857f65f1d20b592c05ca72db7515726e3))
- eslinter run 2 ([39e9d0d](https://github.com/rimorin/ministry-mapper/commit/39e9d0d19a1616d0bbb8bcf1acd9f4548db53d0c))
- handle empty delimiter unit value ([a868611](https://github.com/rimorin/ministry-mapper/commit/a8686112082cf1f00c7bf084482a248aaa11c8bd))
- handle invalid sequence input ([7106d90](https://github.com/rimorin/ministry-mapper/commit/7106d907c5e38823e129424c29b967b0b98e130e))
- implement husky lint staged ([955feaa](https://github.com/rimorin/ministry-mapper/commit/955feaa68f1aad55a6ce7473a0027ff02a8207f9))

### Features

- implement custom expiry date for personal slips ([52592bb](https://github.com/rimorin/ministry-mapper/commit/52592bb94b4406f36ccf2a1dc5b3a420cdab0810))

# [1.11.0](https://github.com/rimorin/ministry-mapper/compare/v1.10.0...v1.11.0) (2023-04-10)

### Bug Fixes

- admin unit UI modifier for undefined seq ([82c0377](https://github.com/rimorin/ministry-mapper/commit/82c037732da503043525af614aefb04fe4932be3))
- lock submit button on save ([b7d6966](https://github.com/rimorin/ministry-mapper/commit/b7d6966ca6a85e54f7f71c0e786e586774b1854e))

### Features

- implement resend function to resend verification email ([b793d5d](https://github.com/rimorin/ministry-mapper/commit/b793d5d0fa2ce401184edf4959a4c8a965f8ee1a))

# [1.10.0](https://github.com/rimorin/ministry-mapper/compare/v1.9.0...v1.10.0) (2023-04-06)

### Features

- implement address additional instructions ([6bbfa5e](https://github.com/rimorin/ministry-mapper/commit/6bbfa5e48eef539a3da8ae3ffa473f6b4bfeed22))

# [1.9.0](https://github.com/rimorin/ministry-mapper/compare/v1.8.0...v1.9.0) (2023-04-01)

### Features

- implement about page ([9244883](https://github.com/rimorin/ministry-mapper/commit/92448836a70c685cbd6159b2b02acfd850fdf4a9))

# [1.8.0](https://github.com/rimorin/ministry-mapper/compare/v1.7.4...v1.8.0) (2023-03-31)

### Features

- blinking feedback for conductor/admin ([82cbd64](https://github.com/rimorin/ministry-mapper/commit/82cbd64e94ef9f2c5f16ea50b1a79583002f14d5))

## [1.7.4](https://github.com/rimorin/ministry-mapper/compare/v1.7.3...v1.7.4) (2023-03-27)

### Bug Fixes

- allow user to try another account if it can't be verified ([a976e93](https://github.com/rimorin/ministry-mapper/commit/a976e93b747a4e27acd6efad462ad6b0f7ec8d1d))
- issue where territory listing doesnt refresh when there is only address ([3a1f210](https://github.com/rimorin/ministry-mapper/commit/3a1f210b02e08466b5aeb1637049589b73750173))

## [1.7.3](https://github.com/rimorin/ministry-mapper/compare/v1.7.2...v1.7.3) (2023-03-20)

### Bug Fixes

- implement poller for listener functions ([6723faa](https://github.com/rimorin/ministry-mapper/commit/6723faab39504b9c664dac73d78fa58f14cefd58))

## [1.7.2](https://github.com/rimorin/ministry-mapper/compare/v1.7.1...v1.7.2) (2023-03-17)

### Bug Fixes

- null check for feedback info notification ([38d02b4](https://github.com/rimorin/ministry-mapper/commit/38d02b4a9ff025ea8e4ca77bd35af7efccf37543))

## [1.7.1](https://github.com/rimorin/ministry-mapper/compare/v1.7.0...v1.7.1) (2023-03-14)

### Bug Fixes

- allow unauthorised user to 'use another account' ([e3e260e](https://github.com/rimorin/ministry-mapper/commit/e3e260eb543a58de44d75d277352c4842548afde))

# [1.7.0](https://github.com/rimorin/ministry-mapper/compare/v1.6.1...v1.7.0) (2023-03-12)

### Bug Fixes

- numeric seq data when editing seq no in private address ([0036f05](https://github.com/rimorin/ministry-mapper/commit/0036f05b74c66f4970294d6caeef1681e984135a))

### Features

- implement account creation module ([cff1d6e](https://github.com/rimorin/ministry-mapper/commit/cff1d6e56088af9633978749e6a55cb62ca82669))
- implement change password for conductor/admin accounts ([f0f1712](https://github.com/rimorin/ministry-mapper/commit/f0f1712b1d5537318ee683d55b4dc0b210f10c6d))
- implement forgot password in login screen ([7ee0c98](https://github.com/rimorin/ministry-mapper/commit/7ee0c9825c8ec72d79cb4cea24e377883246d028))
- implement user name display ([842243e](https://github.com/rimorin/ministry-mapper/commit/842243ee2af340cf79a67b574d33d477cd04b191))
- implement validity check on user email during login ([83e4302](https://github.com/rimorin/ministry-mapper/commit/83e4302510b3004352473b67f3fcb91b6cc341ef))

## [1.6.1](https://github.com/rimorin/ministry-mapper/compare/v1.6.0...v1.6.1) (2023-03-05)

### Bug Fixes

- add postal code check when creating new address ([9fbc4d3](https://github.com/rimorin/ministry-mapper/commit/9fbc4d3b14aadb7265ea3af6c6e285e4266c2a4f))

# [1.6.0](https://github.com/rimorin/ministry-mapper/compare/v1.5.0...v1.6.0) (2023-03-02)

### Bug Fixes

- add unit modal naming ([3e188fc](https://github.com/rimorin/ministry-mapper/commit/3e188fcfe5e155b316aaa633bac4c1c6cfbc0dfb))
- admin update unit modal display ([a884c8a](https://github.com/rimorin/ministry-mapper/commit/a884c8a87eded1163329792e4f3d254cd61de040))
- allow alphanumeric house no for private properties ([a714861](https://github.com/rimorin/ministry-mapper/commit/a714861733f4f9a925f9de17cdd0bc616a824e71))
- disable floor adding to private address ([140ff2f](https://github.com/rimorin/ministry-mapper/commit/140ff2f76882bd5c2bca793ec31e4cc0c8099875))
- handle dataclone error ([307cce3](https://github.com/rimorin/ministry-mapper/commit/307cce3d4936f6e163a8ef8b421b529d2baa8fb9))
- missing remove option for floors ([7d7c124](https://github.com/rimorin/ministry-mapper/commit/7d7c1241fa0de52efefde7418e87fd9aa3c07a58))
- set proper seq when adding new unit/house ([9268ab9](https://github.com/rimorin/ministry-mapper/commit/9268ab9fdb7ea8518925c48c669929f62f8d0a1f))
- territory sequence field permission and logic ([50e90b3](https://github.com/rimorin/ministry-mapper/commit/50e90b329a2964e6dedeb072794a650c91ec1c48))
- territory slip private unit display ([c17b13b](https://github.com/rimorin/ministry-mapper/commit/c17b13b6212027b0685a856e0fc2a99464fe6ba0))

### Features

- implement private / landed estate tracking ([da2afbf](https://github.com/rimorin/ministry-mapper/commit/da2afbf06b29ccf7664e3ec1227f461a3b404e41))

# [1.5.0](https://github.com/rimorin/ministry-mapper/compare/v1.4.0...v1.5.0) (2023-02-23)

### Features

- implement territory change option for addresses ([e58b1e0](https://github.com/rimorin/ministry-mapper/commit/e58b1e02856f5efff9df47f165812528f73d1ce2))

# [1.4.0](https://github.com/rimorin/ministry-mapper/compare/v1.3.0...v1.4.0) (2023-02-22)

### Bug Fixes

- add existing number check when adding new unit no ([7f19b22](https://github.com/rimorin/ministry-mapper/commit/7f19b22f1574ef4768c4774c26c21a65c4147c9a))

### Features

- congregation level slip expiry hours setting ([d945f61](https://github.com/rimorin/ministry-mapper/commit/d945f618ddc9306235ac979dee628175cbf0b997))

### Performance Improvements

- remove unnecessary cong list refreshing ([f0b72d4](https://github.com/rimorin/ministry-mapper/commit/f0b72d4ffab5ae0381fbf96e2c4074b81aeb98d9))

# [1.3.0](https://github.com/rimorin/ministry-mapper/compare/v1.2.5...v1.3.0) (2023-02-18)

### Features

- back to top button for admins and conductors ([b8a3fab](https://github.com/rimorin/ministry-mapper/commit/b8a3fababa409fe18f44deb7e4451b340a8e1a2b))

## [1.2.5](https://github.com/rimorin/ministry-mapper/compare/v1.2.4...v1.2.5) (2023-02-15)

### Bug Fixes

- github workflow for semantic versioning ([b22ff90](https://github.com/rimorin/ministry-mapper/commit/b22ff909d1b5ca01f977fc2c22484559ab8b8c05))

# [1.2.0](https://github.com/rimorin/ministry-mapper/compare/v1.1.1...v1.2.0) (2023-02-14)

### Bug Fixes

- fix package.json script for getting version ([04703ab](https://github.com/rimorin/ministry-mapper/commit/04703abb1954a19958e3ba1ec44826389d4ae252))
- semantic release not updating package json version ([57a163c](https://github.com/rimorin/ministry-mapper/commit/57a163c5740eca26b8198cd41970e3ec12d21253))

### Features

- allow postal code modification in admin ([857314d](https://github.com/rimorin/ministry-mapper/commit/857314dc51df58e89b6b2f5f5ddde0f22731b3a7))
- allow territory code modification in admin ([98f03c2](https://github.com/rimorin/ministry-mapper/commit/98f03c214974480ed27686bca927733a82b82707))
- display app version in admin ([8363753](https://github.com/rimorin/ministry-mapper/commit/83637530cbece8b691621dca8f8b4862410759d8))
- implement cell hightlighting when handling the last few units of an address ([686e2ff](https://github.com/rimorin/ministry-mapper/commit/686e2ffeffd2c364e8ca19ddc633a47eec90ec51))

### Performance Improvements

- memotization of values and components ([28dab52](https://github.com/rimorin/ministry-mapper/commit/28dab52342e27cafceead80cf9cdb28a38f5bb70))
- use react fragment instead of div ([8362445](https://github.com/rimorin/ministry-mapper/commit/8362445651d82fd9bd401b7aab3be188cd1e1f5d))

## [1.1.1](https://github.com/rimorin/ministry-mapper/compare/v1.1.0...v1.1.1) (2023-02-05)

### Bug Fixes

- address unselectable territories that are empty ([f2f986a](https://github.com/rimorin/ministry-mapper/commit/f2f986a099ed373591f3eab0b04bf612a81f890f))

# [1.1.0](https://github.com/rimorin/ministry-mapper/compare/v1.0.0...v1.1.0) (2023-02-04)

### Bug Fixes

- Disable husky on GH actions release ([1ae4d6c](https://github.com/rimorin/ministry-mapper/commit/1ae4d6cc435728953dbbb4d9f2fddd63bd4e039e))
- rounds down the aggregate percentage ([c1d7feb](https://github.com/rimorin/ministry-mapper/commit/c1d7feb918fdbe40a5feac16264f229723893584))
- updated firebase version due to a bug in build ([814fe29](https://github.com/rimorin/ministry-mapper/commit/814fe2901390631d25c8ae96a45d9d82abc93269))

### Features

- improved color scheme for territory aggregator ([4c23006](https://github.com/rimorin/ministry-mapper/commit/4c230065b8ab9259563c48b0ea7a3c7f7c03cc1c))

# 1.0.0 (2023-02-03)

### Bug Fixes

- **admin:** copy unit sequence to new units, avoid wrong unit number display and avoid user updating the wrong unit ([77057be](https://github.com/rimorin/ministry-mapper/commit/77057bec5aeab9ae1475c8040a506cedb5f4ccad))
- **admin:** unit sequence does not handle 0 ([93b1b66](https://github.com/rimorin/ministry-mapper/commit/93b1b66e17e160ca3f9873bdbd1d4e3d908d6f12))
- Configure GH personal token in workflow ([addcfe9](https://github.com/rimorin/ministry-mapper/commit/addcfe98888ba8a7c79bdea535c1c5e8b28ca197))

### Features

- Implement github release automation ([a00b1a6](https://github.com/rimorin/ministry-mapper/commit/a00b1a6b23735d4e3ae3efeeb566def454a33781))
