## Service Worker Demo
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/AmitM30/basic-service-worker/master/LICENSE) [![Code Climate](https://codeclimate.com/github/AmitM30/basic-service-worker/badges/gpa.svg)](https://codeclimate.com/github/AmitM30/basic-service-worker)

[Demo Page](https://amitm30.github.io/basic-service-worker/)
- Load the page
- Turn Wi-Fi / Internet off
- Reload the page

*Voila !* Page still loads. ```src/sw.js``` is where the Magic is!

### Usage

Simply refer to ```src/sw.js``` script file in your site and the setup is done. To change what APIs and assets are cached, update variables ```CACHE_FILE_LIST``` and ```CACHE_API_LIST``` in ```src/sw.js```
```javascript
<script src="sw.js">
```
> Note: service worker file needs to be served from the root of the domain, as default. This path can be changed using header ```Service-Worker-Allowed```

### About

There are multiple strategies one can implelment - network first, cache first, fastest first (race between network and cache). The choice depends upon the type of application and the situation one is trying to handle.

This application demonstrates:
- Cache First strategy - i.e. serve from service worker cache if available
- Cached API calls have a *max age* - we don't want to serve the same thing all life!
- Version controlled cache - updates on any change to sw.js

I have tried to use cache first for API calls, and cache all the time for static assets. The API calls are cached for 5 minutes.

### More

There is a lot more one can do using service worker:
- Background data synchronization
- Push messages
- Responding to resource requests from other origins
- Hooks for background services

References:

- Jake Archibald's [cookbook](https://jakearchibald.com/2014/offline-cookbook/)
- Good old [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [developers.google.com](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)

### Support

Service Workers are not quite widely supported (except IE). Check [caniuse](https://caniuse.com/serviceworkers) for more detailed info

### Catch

The cache storage used by service workers do not get deleted by browser unlike browser cache, who have no reliability. So it is important to delete stale objects.
