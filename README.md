# Retweet-gas

retweet and like twitter client implemented using google appscripts.
you need google sheet to store and sync the the lz accounts

#two sheet needed : LZ_DB and Config

- LZ_DB - this will store the LZ accounts from 1EkLdjOQruGzJLiQm5s9J55goRkrUKZdBV78VXrl5CPo sheet
- Config - fill up your consumer key, secret key, authorization token and authorization secret

# setup needed

- google appscript
- google sheet to act as db
- fill up the google sheet id in TwitterDb.ts
- create a trigger that execute start every 30 mins
