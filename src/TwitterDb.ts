import { LZAccount, TwitterConfig } from './types';
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export class TwitterDb {
  sheetLZ_DB: Sheet;
  sheetConfig: Sheet;
  sheetConfigV2: Sheet;

  constructor() {
    // TODO: replace GOOGLE SHEET ID with your own
    const ss = SpreadsheetApp.openById('');
    this.sheetLZ_DB = ss.getSheetByName('LZ_DB');
    this.sheetConfig = ss.getSheetByName('Config');
  }

  // updateLocalCopy(accounts: any[][]) {
  //     this.sheet.getRange("A2:A200").setValues(accounts);
  // }
  updateLocalCopy(accounts: LZAccount[]) {
    console.log({ accounts: accounts });

    // clear all
    const values: any[][] = [];
    for (const account of accounts) {
      values.push([
        account.twitterProfile,
        account.screenName,
        account.accountId,
        account.lastTweetId,
        account.dateProcessed,
      ]);
    }
    // fill up the remaining as blank
    for (let i = accounts.length; i < 200; i++) {
      values.push(['', '', '', '', '']);
    }
    console.log({ updateLocalCopy: 'updateLocalCopy', values });

    this.sheetLZ_DB.getRange(2, 1, values.length, 5).setValues(values);
  }

  getLZAccounts(): LZAccount[] {
    const values = this.sheetLZ_DB.getRange('A2:E116').getValues();
    const accounts: LZAccount[] = [];
    for (const val of values) {
      if (val[0]) {
        accounts.push({
          twitterProfile: val[0],
          screenName: val[1],
          accountId: val[2],
          lastTweetId: val[3],
          dateProcessed: val[4],
        });
      }
    }
    return accounts;
  }

  getConfig(): TwitterConfig {
    const accounts = this.sheetConfig.getRange('A5:D6').getValues();

    return {
      ConsumerAPIKey: this.sheetConfig.getRange('B1').getValue(),
      ConsumerSecret: this.sheetConfig.getRange('B2').getValue(),
      TwitterAccount: accounts.map((c) => {
        return {
          ScreenName: c[0],
          AccountId: c[1],
          AccessToken: c[2],
          AccessSecret: c[3],
        };
      }),
    };
  }

  /*getConfigV2(): TwitterConfig2 {
    const twitterApps: { [key: string]: TwitterApp } = {};

    this.sheetConfigV2.getRange('G2:I50').getValues().forEach((c) => {
      if(c[0] && c[1] && c[2]) {
        twitterApps[c[0]] =  {
          appId: c[0],
          consumerAPIKey: c[1],
          consumerSecret: c[2],
        };
      }
    });

    const twitterAccounts = this.sheetConfigV2.getRange('A2:E57').getValues();

    return {
      ConsumerAPIKey: this.sheetConfig.getRange('B1').getValue(),
      ConsumerSecret: this.sheetConfig.getRange('B2').getValue(),
      TwitterAccount: accounts.map((c) => {
        return {
          ScreenName: c[0],
          AccountId: c[1],
          AccessToken: c[2],
          AccessSecret: c[3],
        };
      }),
    };
  }*/
}
