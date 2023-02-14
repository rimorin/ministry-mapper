# [1.2.0](https://github.com/rimorin/ministry-mapper/compare/v1.1.1...v1.2.0) (2023-02-14)


### Bug Fixes

* fix package.json script for getting version ([04703ab](https://github.com/rimorin/ministry-mapper/commit/04703abb1954a19958e3ba1ec44826389d4ae252))
* semantic release not updating package json version ([57a163c](https://github.com/rimorin/ministry-mapper/commit/57a163c5740eca26b8198cd41970e3ec12d21253))


### Features

* allow postal code modification in admin ([857314d](https://github.com/rimorin/ministry-mapper/commit/857314dc51df58e89b6b2f5f5ddde0f22731b3a7))
* allow territory code modification in admin ([98f03c2](https://github.com/rimorin/ministry-mapper/commit/98f03c214974480ed27686bca927733a82b82707))
* display app version in admin ([8363753](https://github.com/rimorin/ministry-mapper/commit/83637530cbece8b691621dca8f8b4862410759d8))
* implement cell hightlighting when handling the last few units of an address ([686e2ff](https://github.com/rimorin/ministry-mapper/commit/686e2ffeffd2c364e8ca19ddc633a47eec90ec51))


### Performance Improvements

* memotization of values and components ([28dab52](https://github.com/rimorin/ministry-mapper/commit/28dab52342e27cafceead80cf9cdb28a38f5bb70))
* use react fragment instead of div ([8362445](https://github.com/rimorin/ministry-mapper/commit/8362445651d82fd9bd401b7aab3be188cd1e1f5d))

## [1.1.1](https://github.com/rimorin/ministry-mapper/compare/v1.1.0...v1.1.1) (2023-02-05)


### Bug Fixes

* address unselectable territories that are empty ([f2f986a](https://github.com/rimorin/ministry-mapper/commit/f2f986a099ed373591f3eab0b04bf612a81f890f))

# [1.1.0](https://github.com/rimorin/ministry-mapper/compare/v1.0.0...v1.1.0) (2023-02-04)


### Bug Fixes

* Disable husky on GH actions release ([1ae4d6c](https://github.com/rimorin/ministry-mapper/commit/1ae4d6cc435728953dbbb4d9f2fddd63bd4e039e))
* rounds down the aggregate percentage ([c1d7feb](https://github.com/rimorin/ministry-mapper/commit/c1d7feb918fdbe40a5feac16264f229723893584))
* updated firebase version due to a bug in build ([814fe29](https://github.com/rimorin/ministry-mapper/commit/814fe2901390631d25c8ae96a45d9d82abc93269))


### Features

* improved color scheme for territory aggregator ([4c23006](https://github.com/rimorin/ministry-mapper/commit/4c230065b8ab9259563c48b0ea7a3c7f7c03cc1c))

# 1.0.0 (2023-02-03)


### Bug Fixes

* **admin:** copy unit sequence to new units, avoid wrong unit number display and avoid user updating the wrong unit ([77057be](https://github.com/rimorin/ministry-mapper/commit/77057bec5aeab9ae1475c8040a506cedb5f4ccad))
* **admin:** unit sequence does not handle 0 ([93b1b66](https://github.com/rimorin/ministry-mapper/commit/93b1b66e17e160ca3f9873bdbd1d4e3d908d6f12))
* Configure GH personal token in workflow ([addcfe9](https://github.com/rimorin/ministry-mapper/commit/addcfe98888ba8a7c79bdea535c1c5e8b28ca197))


### Features

* Implement github release automation ([a00b1a6](https://github.com/rimorin/ministry-mapper/commit/a00b1a6b23735d4e3ae3efeeb566def454a33781))
