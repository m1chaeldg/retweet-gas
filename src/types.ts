export interface TwitterConfig {
  ConsumerAPIKey: string;
  ConsumerSecret: string;
  TwitterAccount: TwitterAccount[];
}

export interface TwitterAccount {
  AccountId: string;
  AccessToken: string;
  AccessSecret: string;
  ScreenName: string;
}

export interface LZAccount {
  twitterProfile: string;
  screenName: string;
  accountId: string;
  lastTweetId: string;
  dateProcessed: string;
}
///////////////////////////////////////////////////

export interface TwitterConfig2 {
  [accountId: string]: ArrayNext;
}

export class ArrayNext {
  accounts: TwitterAccountV2[] = [];
  currentIndex = 0;

  constructor() { }

  public add(account: TwitterAccountV2) {
    this.accounts.push(account);
  }

  public next() {
    const cur = this.accounts[this.currentIndex++];

    // back to the beginning
    if (this.currentIndex >= this.accounts.length) {
      this.currentIndex = 0;
    }

    return cur;
  }
}

export interface TwitterAccountV2 {
  accountId: string;
  accessToken: string;
  accessSecret: string;
  screenName: string;
  consumerAPIKey: string;
  consumerSecret: string;
}

export interface TwitterApp {
  appId: string;
  consumerAPIKey: string;
  consumerSecret: string;
}