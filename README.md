
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Build Status: Linux][travis-image]][travis-url]
[![Build Status: Windows][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]


# Create REST API

  v.1.0.4

  Create your REST API from scarch


## Install

  `npm install --save create-rest-api`


## Simple Usage Example

```javascript
// index1.js
var Api = require('./create-rest-api');
var api = new Api();

api.registerModel('writers', {
  name: { type: 'string', required: true },
  sex: { type: 'string', match: /^M|F$/ }
});

api.start();
```

```
DB_URL=localhost:27017/test DB_AUTH=test:pass node index1.js
```

## Terminal

- Add new document

```curl -X POST -H 'Content-Type: application/json' -d '{"name":"Alexandre Dumas"}' 127.0.0.1:8877/writers```
```
{"name":"Alexandre Dumas","_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","_links":{"self":{"href":"writers/5bdac691-7f6c-470f-94e7-24e7986e3dae"}}}
```

- Get all documents

```curl 127.0.0.1:8877/writers```
```
[{"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}]
```

- Get one document by id

```curl 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae```
```
{"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}
```

- Update part of document

```curl -X PATCH -H 'Content-Type: application/json' -d '{"sex":"M"}' 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae```
```
{"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas","sex":"M"}
```

- Replace document

```curl -X PUT -H 'Content-Type: application/json' -d '{"name":"Alexandre Dumas"}' 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae```
```
{"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}
```

- Delete document

```curl -X DELETE 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae```
```
{"ok":1,"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae"}
```


## Change Log

  [all changes](CHANGELOG.md)


## Created by

  Dimitry Ivanov <2@ivanoff.org.ua> # curl -A cv ivanoff.org.ua

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/create-rest-api
[npm-version-image]: http://img.shields.io/npm/v/create-rest-api.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/create-rest-api.svg?style=flat

[travis-url]: https://travis-ci.org/ivanoff/create-rest-api
[travis-image]: https://travis-ci.org/ivanoff/create-rest-api.svg?branch=master

[appveyor-url]: https://ci.appveyor.com/project/ivanoff/create-rest-api/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/lp3nhnam1eyyqh33/branch/master?svg=true

[coveralls-url]: https://coveralls.io/github/ivanoff/create-rest-api?branch=master
[coveralls-image]: https://coveralls.io/repos/github/ivanoff/create-rest-api/badge.svg?branch=master

