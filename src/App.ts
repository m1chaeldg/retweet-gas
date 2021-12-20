import { OAuth1UrlFetchApp } from './OAuth1UrlFetchApp';
import { TwitterDb } from './TwitterDb';
import { TwitterService } from './TwitterService';

export class App {
  public start() {
    console.log('start');

    const twitterDb = new TwitterDb();

    const config = twitterDb.getConfig();
    const lzAccounts = twitterDb.getLZAccounts();

    const twitterServices: TwitterService[] = [];

    config.TwitterAccount.forEach((account) => {
      const oauth1UrlFetchApp = new OAuth1UrlFetchApp(
        config.ConsumerAPIKey,
        config.ConsumerSecret,
        account.AccessToken,
        account.AccessSecret
      );

      twitterServices.push(new TwitterService(oauth1UrlFetchApp, account.AccountId));
    });

    // sort by dateProcessed date so that we can process the last ones first(non touch)
    lzAccounts.sort((a, b) => a.dateProcessed.localeCompare(b.dateProcessed));

    const twitterServicePrime = twitterServices[0];

    for (const lzAccount of lzAccounts) {
      let nextToken = null;
      let hasNextPage = true;

      Logger.log('Processing ' + lzAccount.screenName);

      while (hasNextPage) {
        const resp = twitterServicePrime.getUserTweets(
          lzAccount.accountId,
          lzAccount.lastTweetId || null,
          nextToken
        );

        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
          if (resp.data) {
            this.retweetAndLike(twitterServices, resp.data, (id) => {
              // update and store the last tweet id
              lzAccount.lastTweetId = id;
              lzAccount.dateProcessed = new Date().getTime().toString();
              twitterDb.updateLocalCopy(lzAccounts);
            });
            break;
          }
          if (resp.meta.next_token) {
            nextToken = resp.meta.next_token;
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
        break;
      }
    }
  }

  private retweetAndLike(
    twitterServices: TwitterService[],
    tweets: any[],
    cb: (id: string) => void
  ) {
    const tweetIds = tweets.map((t) => t.id.toString()).sort();

    for (const id of tweetIds) {
      for (const twitterService of twitterServices) {
        twitterService.reTweet(id);
        twitterService.like(id);
      }
      cb(id);
    }
  }
}
