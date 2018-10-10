[![Build status](https://travis-ci.org/City-of-Helsinki/helpt-ui.svg?branch=master)](https://travis-ci.org/City-of-Helsinki/helpt-ui)
[![codecov](https://codecov.io/gh/City-of-Helsinki/helpt-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/City-of-Helsinki/helpt-ui)

Helsinki Project Tracking UI
==================

This is the UI for the Project and Hour reporting tool for City of Helsinki
projects. The [backend component](https://github.com/City-of-Helsinki/helpt)
is also available as open source.

Installation
------------

Requirements:
* Node v8 (LTS), fe. using NVM
* [yarn](https://yarnpkg.com/en/docs/install)

Also you might need to install C development toolchain and Python, if they
are not already available in your system.

Preparing:

Install modules: `yarn`

### Dev

Configure: `cp .env.example .env` and check the settings

Start in dev mode:
```
yarn run mock-api
yarn start
```

### Production

Configure: `cp .env.example .env`

Configuration is not actually used during transpilation, some code still
thinks it is.

Transpile:
```
yarn dist
```

Now actually do the configuration:
```
export WEB_ROOT=dist
export API_URL=https://something/
...same for all variables in .env.example
```
WEB_ROOT in special: it specifies where the file
will be written to. Usually you will want it to be `dist`

Convert the configuration to json: `yarn create_config`

This will create a dist/config.js, that the app will include.

You can now copy the contents of `dist` folder wherever you want, or
just leave it within the source tree. This will make changing the
configuration a bit easier, if you wish to begin from environment
variables again.

Configure you web server to always serve index.html, if no file matching
the URL is found. This makes it possible to link within the application.