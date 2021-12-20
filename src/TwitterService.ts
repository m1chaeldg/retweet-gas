import { OAuth1UrlFetchApp } from './OAuth1UrlFetchApp';

export class TwitterService {
  constructor(private oauth1UrlFetchApp: OAuth1UrlFetchApp, private twitterUsesId: string) {}

  public getUserId(screenName: string): number {
    const url = `https://api.twitter.com/2/users/by/username/:username`.replace(
      ':username',
      screenName
    );
    Logger.log({ _method: 'getUserId', url });

    const response = this.oauth1UrlFetchApp.fetch(url, null, { method: 'GET' });

    const content = response.getContentText();
    Logger.log({ _method: 'getUserId', response: content });

    const json = JSON.parse(content);

    return json.data.id;
  }

  public getUserTweets(userId: string, since_id: string, nextToken: string): any {
    Logger.log('Retrieving Tweets...');

    const url = `https://api.twitter.com/2/users/:id/tweets`.replace(':id', userId);

    Logger.log({ getUserId: 'getUserTweets', url });

    const query_params = {
      max_results: '20',
    };
    if (since_id) {
      query_params['since_id'] = since_id;
    }

    if (nextToken) {
      query_params['pagination_token'] = nextToken;
    }

    const response = this.oauth1UrlFetchApp.fetch(url, query_params, { method: 'GET' });

    if (response.getResponseCode() != 200) {
      Logger.log({ _method: 'getUserTweets', response: response.getContentText() });
      return null;
    }

    const json = JSON.parse(response.getContentText());
    Logger.log({ _method: 'getUserTweets', response: json });
    return json;
  }

  public getMultipleTweets(tweetIds: string[]): any {
    Logger.log('Retrieving Tweet Info...');

    const url = `https://api.twitter.com/2/tweets`;

    Logger.log({ _method: 'getMultipleTweets', url });

    const query_params = {
      ids: tweetIds,
    };

    const response = this.oauth1UrlFetchApp.fetch(url, query_params, { method: 'GET' });

    if (response.getResponseCode() != 200) {
      Logger.log({ _method: 'getMultipleTweets', response: response.getContentText() });
      return null;
    }

    const json = JSON.parse(response.getContentText());
    Logger.log({ _method: 'getMultipleTweets', response: json });
    return json;
  }
  public reTweet(tweetId: string): any {
    Logger.log('reTweeting...');

    const url = `https://api.twitter.com/2/users/:id/retweets`.replace(':id', this.twitterUsesId);
    const body = {
      tweet_id: tweetId,
    };

    return this.doPost('reTweet', url, body);
  }
  public like(tweetId: string): any {
    Logger.log('liking...');

    const url = `https://api.twitter.com/2/users/:id/likes`.replace(':id', this.twitterUsesId);
    const body = {
      tweet_id: tweetId,
    };

    return this.doPost('like', url, body);
  }

  private doPost(logMethod: string, url: string, payload: any) {
    Logger.log('doPost...');

    Logger.log({ _method: logMethod, url });

    const response = this.oauth1UrlFetchApp.fetch(url, null, {
      method: 'POST',
      // muteHttpExceptions: true,
      payload: JSON.stringify(payload),
    });

    if (response.getResponseCode() != 200) {
      Logger.log({ _method: logMethod, response: response.getContentText() });
      return null;
    }

    const json = JSON.parse(response.getContentText());
    Logger.log({ _method: logMethod, response: json });
    return json;
  }
}
