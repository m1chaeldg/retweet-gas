/**
 * Adds a OAuth1 object to the global scope. This can be used as follows:
 *
 * let urlFetch = OAuth1.withAccessToken(consumerKey, consumerSecret,
 *     accessToken, accessSecret);
 * let response = urlFetch.fetch(url, params, options);
 */
// ref: https://developers.google.com/google-ads/scripts/docs/examples/oauth10-library

export class OAuth1UrlFetchApp {
  /**
   * Creates an object to provide OAuth1-based requests to API resources.
   * @param {string} consumerKey
   * @param {string} consumerSecret
   * @param {string} accessToken
   * @param {string} accessSecret
   * @constructor
   */
  constructor(
    private consumerKey,
    private consumerSecret,
    private accessToken,
    private accessSecret
  ) {}

  /**
   * Sends a signed OAuth 1.0 request.
   * @param {string} url The URL of the API resource.
   * @param {?Object.<string>=} opt_params Map of parameters for the URL.
   * @param {?Object.<string>=} opt_options Options for passing to UrlFetchApp
   *     for example, to set the method to POST, or to include a form body.
   * @return {?Object} The resulting object on success, or null if a failure.
   */
  public fetch(url: string, opt_params, opt_options) {
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_timestamp: new Date().getTime() / 1000,
      oauth_nonce: this.generateNonce(),
      oauth_version: '1.0',
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
    };

    let method = 'GET';
    let formPayload: any;
    if (opt_options && opt_options.method) {
      method = opt_options.method;
    }
    if (opt_options && opt_options.payload) {
      formPayload = opt_options.payload;
    }

    const requestString = this.generateRequestString(oauthParams, opt_params);
    const signatureBaseString = this.generateSignatureBaseString(method, url, requestString);
    Logger.log({ signatureBaseString });

    const signature = Utilities.computeHmacSignature(
      Utilities.MacAlgorithm.HMAC_SHA_1,
      signatureBaseString,
      this.getSigningKey()
    );
    const b64signature = Utilities.base64Encode(signature);

    oauthParams['oauth_signature'] = this.escape(b64signature);
    const fetchOptions = opt_options || {};
    fetchOptions['headers'] = {
      'User-Agent': 'v2UserTweetsJS',
      'Content-Type': 'application/json',
      Authorization: this.generateAuthorizationHeader(oauthParams),
    };
    //if (fetchOptions.payload) {
    //  fetchOptions.payload = this.escapeForm(fetchOptions.payload);
    //}

    const finalUrl = this.joinUrlToParams(url, opt_params);
    Logger.log({ finalUrl });
    Logger.log({ fetchOptions });

    return UrlFetchApp.fetch(finalUrl, fetchOptions);
  }

  /**
   * Concatenates request URL to parameters to form a single string.
   * @param {string} url The URL of the resource.
   * @param {?Object.<string>=} opt_params Optional key/value map of parameters.
   * @return {string} The full path built out with parameters.
   */
  private joinUrlToParams(url: string, opt_params) {
    if (!opt_params) {
      return url;
    }
    const paramKeys = Object.keys(opt_params);
    const paramList = [];
    for (let i = 0, paramKey; (paramKey = paramKeys[i]); i++) {
      paramList.push([paramKey, opt_params[paramKey]].join('='));
    }
    return url + '?' + paramList.join('&');
  }

  /**
   * Generates a random nonce for use in the OAuth request.
   * @return {string} A random string.
   */
  private generateNonce(): string {
    const rand = Math.floor(Math.random() * 10000).toString();
    return Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, rand)
    ).replace(/[/=_+]/g, '');
  }

  /**
   * Creates a properly-formatted string from a map of key/values from a form
   * post.
   * @param {!Object.<string>} payload Map of key/values.
   * @return {string} The formatted string for the body of the POST message.
   */
  private escapeForm(payload) {
    const escaped = [];
    const keys = Object.keys(payload);
    for (let i = 0, key; (key = keys[i]); i++) {
      escaped.push([this.escape(key), this.escape(payload[key])].join('='));
    }
    return escaped.join('&');
  }

  /**
   * Returns a percent-escaped string for use with OAuth. Note that
   * encodeURIComponent is not sufficient for this as the Twitter API expects
   * characters such as exclamation-mark to be encoded. See:
   *     https://dev.twitter.com/discussions/12378
   * @param {string} str The string to be escaped.
   * @return {string} The escaped string.
   */
  private escape(str) {
    return encodeURIComponent(str).replace(/[!*()']/g, function (v) {
      return '%' + v.charCodeAt(0).toString(16);
    });
  }

  /**
   * Generates the Authorization header using the OAuth parameters and
   * calculated signature.
   * @param {!Object} oauthParams A map of the required OAuth parameters. See:
   *     https://dev.twitter.com/oauth/overview/authorizing-requests
   * @return {string} An Authorization header value for use in HTTP requests.
   */
  generateAuthorizationHeader(oauthParams) {
    const params = [];
    const keys = Object.keys(oauthParams).sort();
    for (let i = 0, key; (key = keys[i]); i++) {
      params.push(key + '="' + oauthParams[key] + '"');
    }
    return 'OAuth ' + params.join(', ');
  }

  /**
   * Generates the signature string for the request.
   * @param {string} method The HTTP method e.g. GET, POST
   * @param {string} The URL.
   * @param {string} requestString The string representing the parameters to the
   *     API call as constructed by generateRequestString.
   * @return {string} The signature base string. See:
   *     https://dev.twitter.com/oauth/overview/creating-signatures
   */
  generateSignatureBaseString(method, url, requestString) {
    return [method, this.escape(url), this.escape(requestString)].join('&');
  }

  /**
   * Generates the key for signing the OAuth request
   * @return {string} The signing key.
   */
  getSigningKey() {
    return this.escape(this.consumerSecret) + '&' + this.escape(this.accessSecret);
  }

  /**
   * Generates the request string for signing, as used to produce a signature
   * for the Authorization header. see:
   * https://dev.twitter.com/oauth/overview/creating-signatures
   * @param {!Object} oauthParams The required OAuth parameters for the request,
   *     see: https://dev.twitter.com/oauth/overview/authorizing-requests
   * @param {?Object=} opt_params Optional parameters specified as part of the
   *     request, in map form, for example to specify /path?a=b&c=d&e=f... etc
   * @param {?Object=} opt_formPayload Optional mapping of pairs used in a form
   *     as part of a POST request.
   * @return {string} The request string
   */
  generateRequestString(...args) {
    Logger.log({ args });

    const requestParams = {};
    const requestPath = [];
    for (let i = 0; i < args.length; i++) {
      const mapping = args[i];
      if (mapping) {
        const paramKeys = Object.keys(mapping);
        for (let j = 0, paramKey; (paramKey = paramKeys[j]); j++) {
          requestParams[paramKey] = mapping[paramKey];
        }
      }
    }
    const requestKeys = Object.keys(requestParams);
    requestKeys.sort();

    for (let m = 0, requestKey; (requestKey = requestKeys[m]); m++) {
      requestPath.push([this.escape(requestKey), this.escape(requestParams[requestKey])].join('='));
    }
    return requestPath.join('&');
  }
}
