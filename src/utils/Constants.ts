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

export const Places = [
  {value: 1, label: 'Not Spesific'},
  {value: 2, label: 'AMPANG H2'},
  {value: 3, label: 'AMPANG TESCO'},
  {value: 4, label: 'BUKIT BERU'},
  {value: 5, label: 'CAMERON'},
  {value: 6, label: 'DOLOMITE'},
  {value: 7, label: 'HARTAMAS H2'},
  {value: 8, label: 'KUALA SELANGOR'},
  {value: 9, label: 'MELAWATHI H3'},
  {value: 10, label: 'N/W RAWANG'},
  {value: 11, label: 'NILAI BUDGET'},
  {value: 12, label: 'NILAI H2'},
  {value: 13, label: 'PUTRA HEIGHT'},
  {value: 14, label: 'SAMUDRA'},
  {value: 15, label: 'SHAH ALAM H1'},
  {value: 16, label: 'SHAH ALAM H2'},
  {value: 17, label: 'SUNGAI BESI H1'},
  {value: 18, label: 'DD'},
  {value: 19, label: 'AMPANG Н1'},
  {value: 20, label: 'DE GLORY'},
  {value: 21, label: 'HARTAMAS H1'},
  {value: 22, label: 'KAJANG STAR'},
  {value: 23, label: 'KDH 1'},
  {value: 24, label: 'KDH 2'},
  {value: 25, label: 'MELAKKA'},
  {value: 26, label: 'MELAWATHI H2'},
  {value: 27, label: 'NEW KAJANG'},
  {value: 28, label: 'NEW RAWANG'},
  {value: 29, label: 'SUBANG'},
  {value: 30, label: 'SG BESI H2'},
  {value: 31, label: 'SERANDAH'},
  {value: 32, label: 'PUCHONG'},
  {value: 33, label: 'ARK RAWANG'},
  {value: 34, label: 'BANTING'},
  {value: 35, label: 'ARK Porkdickson'},
  {value: 36, label: 'Avani sepang goldcost'},
  {value: 37, label: 'Ampang 3 tower Office'},
  {value: 38, label: 'Batu Caves Office'}
]