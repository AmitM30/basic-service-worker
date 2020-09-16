## Service Worker Demo
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/AmitM30/basic-service-worker/master/LICENSE) [![Code Climate](https://codeclimate.com/github/AmitM30/basic-service-worker/badges/gpa.svg)](https://codeclimate.com/github/AmitM30/basic-service-worker)

**Get up and running with service worker for your site in less than 5 mins.**

[Demo Page](https://amitm30.github.io/basic-service-worker/)
- Load the page
- Turn Wi-Fi / Internet off
- Reload the page

*Voila !* Page still loads. ```src/sw.js``` is where the Magic is!

There are multiple strategies one can implelment - network first, cache first, fastest first (race between network and cache). The choice depends upon the type of application and the situation one is trying to handle.

This application demonstrates:
- Cache First strategy - i.e. serve from service worker cache if available
- Cached API calls have a *max age* - we don't want to serve the same thing all life!
- Version controlled cache - updates on any change to sw.js

I have tried to use cache first for API calls, and cache all the time for static assets. The API calls are cached for 5 minutes.

References:

- Jake Archibald's [cookbook](https://jakearchibald.com/2014/offline-cookbook/)
- Good old [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [developers.google.com](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)


#### Building

1. Install [Yarn](https://github.com/yarnpkg/yarn/)

  ```shell
  $ npm install -g yarn
  ```

2. Installing App
  ```shell
  $ yarn install
  ```

#### Running

```sh
npm run serve
```

The server will be running at:
> [http://localhost:8000/](http://localhost:8000/)

#### Catch
- This is an experimental technology by google and has not been standardised yet. Works only on Chrome and Firefox. IE is on the way to adapting it. Safari has given hints about it.
- The cache storage used by service workers do not get deleted by browser unlike browser cache, who have no reliability. So it is important to delete stale objects.
