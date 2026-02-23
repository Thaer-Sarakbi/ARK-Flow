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
  // {value: 2, label: 'AMPANG H2'},
  // {value: 3, label: 'AMPANG TESCO'},
  // {value: 4, label: 'BUKIT BERU'},
  // {value: 5, label: 'CAMERON'},
  // {value: 6, label: 'DOLOMITE'},
  // {value: 7, label: 'HARTAMAS H2'},
  // {value: 8, label: 'KUALA SELANGOR'},
  {value: 9, label: 'MELAWATHI H3'},
  {value: 10, label: 'NEW RAWANG'},
  // {value: 11, label: 'NILAI BUDGET'},
  // {value: 12, label: 'NILAI H2', latitude: 2.8113741, longitude: 101.8073255},
  // {value: 13, label: 'PUTRA HEIGHT'},
  // {value: 14, label: 'SAMUDRA'},
  // {value: 15, label: 'SHAH ALAM H1'},
  // {value: 16, label: 'SHAH ALAM H2'},
  // {value: 17, label: 'SUNGAI BESI H1'},
  {value: 19, label: 'AMPANG H1', latitude: 3.1584280, longitude: 101.7500843},
  {value: 20, label: 'DE GLORY', latitude: 3.0252123, longitude: 101.5819822},
  {value: 21, label: 'HARTAMAS H1'},
  {value: 22, label: 'KAJANG STAR'},
  {value: 23, label: 'KDH 1'},
  {value: 24, label: 'KDH 2', latitude: 3.1510098, longitude: 101.5757008},
  {value: 25, label: 'MELAKKA'},
  {value: 26, label: 'MELAWATHI H2'},
  {value: 27, label: 'NEW KAJANG'},
  // {value: 28, label: 'NEW RAWANG'},
  {value: 29, label: 'SUBANG', latitude: 3.1519610, longitude: 101.5525850 },
  {value: 30, label: 'SG BESI H2', latitude: 3.0356466, longitude: 101.7052028 },
  {value: 31, label: 'SERANDAH'},
  {value: 32, label: 'PUCHONG'},
  {value: 33, label: 'ARK RAWANG', latitude: 3.3176836, longitude: 101.5320457 },
  {value: 34, label: 'BANTING'},
  {value: 35, label: 'ARK Porkdickson'},
  {value: 36, label: 'Avani sepang goldcost'},
  {value: 37, label: 'Ampang 3 tower Office', latitude: 3.1623508, longitude: 101.7415717 },
  // {value: 38, label: 'Batu Caves Office', latitude: 3.2325874, longitude: 101.6752059 }
]

export const PdfTemplate = (rowsMorning: any, rowsNight: any, name: string | undefined, month: string) => (
  `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Attendance Table</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #333;
            }

          h2 {
            text-align: center;
            margin-bottom: 24px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 12px;
            text-align: center;
          }

          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }

          tr:nth-child(even) {
            background-color: #fafafa;
          }

          .note {
            max-width: 160px;
            width: 160px;
            word-wrap: break-word;
            white-space: normal;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
            font-size: 12px;
            color: #777;
          }
          thead {
            display: table-row-group;
          }
        </style>
      </head>
      <body>
          <h2>${name} - ${month} (Morning)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th class="note">Note</th>
                <th>Check Out</th>
                <th class="note">Note</th>
              </tr>
            </thead>
            <tbody>
              ${rowsMorning}
            </tbody>
          </table>

          <br/>
          <br/>
          <h2>${name} - ${month} (Night)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th class="note">Note</th>
                <th>Check Out</th>
                <th class="note">Note</th>
              </tr>
            </thead>
            <tbody>
              ${rowsNight}
            </tbody>
          </table>
      </body>
    </html>`
)

export const monthRange = (month: number, year: number) => {
  
  let startDate = new Date()
  let endDate = new Date()
  const dateArray = [];

  if([1, 3, 5, 7, 8, 10, 12].includes(month)){
    startDate = new Date(`${year}-${month}-01`);
    endDate = new Date(`${year}-${month}-31`);
  } else if([4, 6, 9, 11].includes(month)){
    startDate = new Date(`${year}-${month}-01`);
    endDate = new Date(`${year}-${month}-30`);
  } else if(month === 2){
    startDate = new Date(`${year}-${month}-01`);
    endDate = new Date(`${year}-${month}-28`);
  }

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // We create a new Date instance so we don't just store references to the same object
    dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
    
    // Increment the day by 1
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}