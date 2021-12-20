import { Trigger } from './createTrigger';
import { App } from './App';
import { Menu } from './menu';
import { LZAccounts } from './LZAccounts';
import { TwitterDb } from './TwitterDb';
import { OAuth1UrlFetchApp } from './OAuth1UrlFetchApp';
import { TwitterService } from './TwitterService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

global.test = async () => {
  Logger.log('test start');

  const lz = new LZAccounts();
  const accounts = lz.getCopyLzTwitterAccountsToLocalSheet().map((c) => c[0].trim().toLowerCase());
  const accountsMap = new Map<string, any>();
  accounts.forEach((el) => {
    accountsMap.set(el, el);
  });

  const twitterDb = new TwitterDb();

  const config = twitterDb.getConfig();
  const lzAccounts = twitterDb.getLZAccounts();

  Logger.log({ config });
  Logger.log({ lzAccounts });

  const oauth1UrlFetchApp = new OAuth1UrlFetchApp(
    config.ConsumerAPIKey,
    config.ConsumerSecret,
    config.TwitterAccount[0].AccessToken,
    config.TwitterAccount[0].AccessSecret
  );

  Logger.log('test complete');
};

global.updateLZAccountTrigger = async () => {
  Logger.log('updateLZAccountTrigger start');

  const lz = new LZAccounts();
  const accounts = lz.getCopyLzTwitterAccountsToLocalSheet().map((c) => c[0].trim().toLowerCase());
  const accountsMap = new Map<string, any>();
  accounts.forEach((el) => {
    accountsMap.set(el, el);
  });

  const twitterDb = new TwitterDb();

  const config = twitterDb.getConfig();
  const lzAccounts = twitterDb.getLZAccounts();

  Logger.log({ config });
  Logger.log({ lzAccounts });

  const oauth1UrlFetchApp = new OAuth1UrlFetchApp(
    config.ConsumerAPIKey,
    config.ConsumerSecret,
    config.TwitterAccount[0].AccessToken,
    config.TwitterAccount[0].AccessSecret
  );
  const twitterService = new TwitterService(oauth1UrlFetchApp, config.TwitterAccount[0].AccountId);

  // remove local copy of accounts that is no longer in LZ
  for (let i = lzAccounts.length - 1; i >= 0; i--) {
    if (!accountsMap.has(lzAccounts[i].twitterProfile.trim().toLowerCase())) {
      lzAccounts.splice(i, 1);
    }
  }

  // add new accounts
  for (let i = 0; i < accounts.length; i++) {
    const profile = accounts[i];
    if (profile) {
      const screenName = profile.replace('https://twitter.com/', '').trim();
      if (!lzAccounts.find((el) => el.screenName === screenName)) {
        try {
          const userId = twitterService.getUserId(screenName);

          lzAccounts.push({
            twitterProfile: profile.trim(),
            accountId: userId.toString(),
            screenName: screenName,
            lastTweetId: '0',
            dateProcessed: '0',
          });
        } catch (e) {
          Logger.log({ e });
        }

        Utilities.sleep(1000);
      }
    }
  }

  twitterDb.updateLocalCopy(lzAccounts);

  Logger.log('updateLZAccountTrigger complete');
};

global.onOpen = () => {
  const menu = new Menu();
  menu.createCustomMenu();
};

global.initialize = () => {
  const trigger = new Trigger();
  trigger.initialize();
};

global.start = async () => {
  Logger.log('Twitterbot start');

  const app = new App();

  app.start();

  Logger.log('Twitterbot complete');
};
