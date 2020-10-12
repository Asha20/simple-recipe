# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2020-10-12)


### Features

* Add --no-spellcheck switch ([55fcdea](https://github.com/Asha20/simple-recipe/commit/55fcdeaa660951cf24797cd118e1b7368b919114))
* Add --silent flag ([c794e6f](https://github.com/Asha20/simple-recipe/commit/c794e6f4b1191a58ee784c947b8f23787fcc416a))
* Add --version switch ([3a7a860](https://github.com/Asha20/simple-recipe/commit/3a7a860a81edc32cbab6b0b5337e9eb7c375e595))
* Add `group` property ([e025a22](https://github.com/Asha20/simple-recipe/commit/e025a22a6f7c684c0890fb85e3b8e430229beb72))
* Add 1.16 items ([8411f1a](https://github.com/Asha20/simple-recipe/commit/8411f1a6692fb5fa4216c27b08ef99ca87a9a09e))
* Add basic error reporting on migrate ([34ea0ae](https://github.com/Asha20/simple-recipe/commit/34ea0ae39db3817fceab26a969236f7c5c4f111c))
* Add CLI ([53b495d](https://github.com/Asha20/simple-recipe/commit/53b495d9f1ecc9cc3139a51d5d878b535c18d7aa))
* Add cooking recipes ([99584dd](https://github.com/Asha20/simple-recipe/commit/99584dd975e1d0e180d3bd8ce8e7062fbec959b0))
* Add file watcher ([77ac6d2](https://github.com/Asha20/simple-recipe/commit/77ac6d29d37635fac6609955a42edac4b05140d2))
* Add item suggestions for misspelled items ([aba2da5](https://github.com/Asha20/simple-recipe/commit/aba2da5f3e65f4ff5ac5814eed70add9e1ccec1a))
* Add Jest & recipe parts ([787b4bb](https://github.com/Asha20/simple-recipe/commit/787b4bbac87fca81dcf32e6676619915918205d3))
* Add shaped crafting recipes ([9c092dc](https://github.com/Asha20/simple-recipe/commit/9c092dc36b69e7d9eddc895f46f342cac8e5fdf6))
* Add shapeless crafting recipes ([11358b2](https://github.com/Asha20/simple-recipe/commit/11358b2230f7a87942397457c1eac7c6ca57a497))
* Add smithing recipes ([f517d52](https://github.com/Asha20/simple-recipe/commit/f517d52d40c9c767754103879ca9dcec17e8bc57))
* Add special crafting recipes ([3ea74b4](https://github.com/Asha20/simple-recipe/commit/3ea74b40695762092faf3da4dd4005843e35a782))
* Add Stonecutting recipe ([296a3f5](https://github.com/Asha20/simple-recipe/commit/296a3f59638e112960d1e502022425aa26945d2f))
* Allow file as input; verify input exists ([fd9a6a1](https://github.com/Asha20/simple-recipe/commit/fd9a6a183ee33ac1aa17e312fc3d05cbfc1c6b54))
* Allow single recipe inside file ([b31ac56](https://github.com/Asha20/simple-recipe/commit/b31ac565c37af26557170b4b4d0d5bb263c4ddd7))
* Convert regular datapacks to YAML ([eefbd87](https://github.com/Asha20/simple-recipe/commit/eefbd87ff9d74f55b2de7b264b254e530bd2883f))
* Disable item validity check ([94807d8](https://github.com/Asha20/simple-recipe/commit/94807d874df39772df1fa36b3c123edb92c362d5))
* Duplicate name check & generate output ([d326559](https://github.com/Asha20/simple-recipe/commit/d3265596cf3d62389b3ab6cfe51b2943162e0529))
* Include recipe index in error message ([f2d9c47](https://github.com/Asha20/simple-recipe/commit/f2d9c47c962fe5ae4754061d6a5da14012a7b6a2))
* Package into binaries using pkg ([d96a1ac](https://github.com/Asha20/simple-recipe/commit/d96a1acadf6d81dcbfbc28f4dd2b771edd83c556))
* Parse files & generate output files ([ed6e6a4](https://github.com/Asha20/simple-recipe/commit/ed6e6a403f76326ce997a0ca40e4d1ec3d306a42))
* Predictive error reporting ([43a0f0e](https://github.com/Asha20/simple-recipe/commit/43a0f0eb969b6c0e1ff60390fe97bb5aec8e140a))
* Prefer name over index in error messages ([fb19eb4](https://github.com/Asha20/simple-recipe/commit/fb19eb4aae0269c14eb6bc3806c27f550838325f))
* Prepend relevant key to error message ([5ea595e](https://github.com/Asha20/simple-recipe/commit/5ea595edb7e3e2ad2f73cb5733280b56bd43ea77))
* Prettify output using chalk ([8594b5c](https://github.com/Asha20/simple-recipe/commit/8594b5cc92b8539d8074a875d7ef533898056798))
* Print origin of error ([a4f1404](https://github.com/Asha20/simple-recipe/commit/a4f1404417f7a31def81c82a2e91d08526299e2c))
* Remove extra whitespace in printer ([37919cf](https://github.com/Asha20/simple-recipe/commit/37919cf9479105f4463befc92da3fc0db233eb82))


### Bug Fixes

* Add minecraft namespace to recipe type ([219fe2d](https://github.com/Asha20/simple-recipe/commit/219fe2defdfcbfdfdd1b8dab532783dbdcab2a6e))
* Allow floats in `Cooking.experience` ([7ef3f40](https://github.com/Asha20/simple-recipe/commit/7ef3f409256f23b366b3e6246ebde3ecddec27ca))
* Broken tests ([95a3410](https://github.com/Asha20/simple-recipe/commit/95a341053c992ff98250fc7dcf9e9a88795444e2))
* Error message for key in CraftingShaped ([a350e03](https://github.com/Asha20/simple-recipe/commit/a350e03a62d2d9df995ba92b47589132c191c76d))
* Improper Stonecutting.ingredients on migrate ([b02105d](https://github.com/Asha20/simple-recipe/commit/b02105de3ddbd3ad889be2da30fe66e66839f8c3))
* Make program completely sync ([002f586](https://github.com/Asha20/simple-recipe/commit/002f5861b9f4018ae585cb3910ce49f105c7e776))
* Name conflict makes file invalid ([c045106](https://github.com/Asha20/simple-recipe/commit/c0451066c2d85d207b246e44a0fee1edda8e996b))
* Preserve order in `fromIngredientsToStack` ([accae86](https://github.com/Asha20/simple-recipe/commit/accae8677f5cad23d453b5fa71bfbeb4d660d837))
* Prevent name conflict occurring in same file ([a76e4c9](https://github.com/Asha20/simple-recipe/commit/a76e4c9c3e6c9c7916837b8f82b962ad250806c7))
* Using space as a key in shaped crafting ([3d635b2](https://github.com/Asha20/simple-recipe/commit/3d635b2b4ba61a18ba428ca9d25c5c175f35a6f4))