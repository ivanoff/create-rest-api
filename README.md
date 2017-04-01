
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Build Status: Linux][travis-image]][travis-url]
[![Build Status: Windows][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]


# Create REST API

  v.0.1.1

  Create your REST API from scarch


## Install

  `npm i -S create-rest-api`


## Usage Example

```javascript
var Api = require('create-rest-api');
var api = new Api({
  db: { mongo: '127.0.0.1:27017/testAPI' }
});

api.registerModel('books', {
  name: { type: 'string', required: true },
  numberOfPages: { type: 'integer' },
  category: { type: 'string', required: true, match: /^fiction|drama|religion|science|historical novel|other$/ },
  author: {
    name: { type: 'string' },
    email: { type: 'email' }
  }
});

api.start();
```

## Terminal

curl -X POST -H 'Content-Type: application/json' -d '{"name":"Bible","category":"religion","numberOfPages":1415}' 127.0.0.1:8877/books
curl -X POST -H 'Content-Type: application/json' -d '{"name":"The Three Musketeers","author":{"name":"Alexandre Dumas"},"category":"historical novel"}' 127.0.0.1:8877/books
curl -X GET 127.0.0.1:8877/books
curl -X GET 127.0.0.1:8877/books/id
curl -X PATCH 127.0.0.1:8877/books/id
curl -X PUT 127.0.0.1:8877/books/id
curl -X DELETE 127.0.0.1:8877/books/id


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

