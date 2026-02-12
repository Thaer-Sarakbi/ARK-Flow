fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios archive_ios

```sh
[bundle exec] fastlane ios archive_ios
```

Build IOS App

### ios upload_ipa_to_testflight

```sh
[bundle exec] fastlane ios upload_ipa_to_testflight
```

Upload to testflghit

### ios submit_for_review

```sh
[bundle exec] fastlane ios submit_for_review
```

Submit_for review

### ios release_new_version

```sh
[bundle exec] fastlane ios release_new_version
```

Build and Distribute to testflghit

----


## Android

### android build_release_android

```sh
[bundle exec] fastlane android build_release_android
```

Build android apk

### android build_bundle_android

```sh
[bundle exec] fastlane android build_bundle_android
```

Build android aab

### android upload_to_playstore

```sh
[bundle exec] fastlane android upload_to_playstore
```



### android release_new_version_play_store

```sh
[bundle exec] fastlane android release_new_version_play_store
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
