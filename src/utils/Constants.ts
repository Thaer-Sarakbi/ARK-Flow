import DeviceInfo from 'react-native-device-info';

const version = DeviceInfo.getVersion() ?? '0';
const androidVersion = DeviceInfo.getSystemVersion();
const appId = DeviceInfo.getBundleId();
const IsBelowAndroid = androidVersion < '13';

export enum DeviceInformation {
  VERSION = version as never,
  SYSTEM_VERSION = androidVersion as never,
  IS_BELOW_ANDROID13 = IsBelowAndroid as never,
  APP_ID = appId as never
}