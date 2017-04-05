
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Build Status: Linux][travis-image]][travis-url]
[![Build Status: Windows][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]


# Create REST API

### v.2.2.1

###  Create your REST API from scarch


- [Instalation](#instalation)

- [Simple Usage Example](#simple-usage-example)

- [Start API server](#start-api-server)

- [Searching](#searching)

- [Filters and orders](#filters-and-orders)

- [HATEOAS](#hateoas)

- [Linked Usage Example](#linked-usage-example)

- [Error examples](#error-examples)

- [Change Log](CHANGELOG.md)


## Instalation

  ```npm install --save create-rest-api```


## Simple Usage Example

```javascript
// index.js
var Api = require('create-rest-api');
var api = new Api();

api.registerModel('writers', {
  name: { type: 'string', required: true },
  sex: { type: 'any', one: ['M', 'F'] }
});

api.start();
```

### Methods

 Method | URL | Description | Response | Posible errors
--------|-----|-------------|----------|----------------
GET | /writers | List of writers | 200 OK | 404 NOT_FOUND
GET | /writers/{id} | Single writer info | 200 OK | 404 NOT_FOUND
POST | /writers | Add new writer | 201 CREATED | 400 DATA_VALIDATION_ERROR
PUT | /writers/{id} | Update some writer's information | 200 OK | 400 DATA_VALIDATION_ERROR, 404: NOT_FOUND
PATCH | /writers/{id} | Update all writer' record | 200 OK | 400 DATA_VALIDATION_ERROR, 404 NOT_FOUND
DELETE | /writers/{id} | Delete writer by id | 200 OK | 400 DATA_VALIDATION_ERROR, 404 NOT_FOUND
GET | /api.raml | Raml API documentation | 200 OK |


## Start REST API server

- Mongodb storage starting

  ```DB_URL=localhost:27017/database DB_AUTH=user:password node index.js```

- Memory storage starting (all data will save in the memory and will be erased after restart, no horizontal scalability)

  ```DB_STORAGE=memory node index.js```


## Searching

Define field name with searching text after ```?``` in the URL to find necessary resource. Searching text can be regular expression.

### Examples

- Find male writers

```
  curl 127.0.0.1:8877/writers?sex=M
    [{"name":"Alexandre Dumas","sex":"M","_id":"5e806693-727b-4956-b539-e797d5bcef2b"}]
```

- Find writers with name begins with ```alex```, using regular expression, case insensitive

```
  curl "127.0.0.1:8877/writers?name=/^alex/i"
    [{"name":"Alexandra Ripley","sex":"F","_id":"1bec2412-cdd3-4e78-b22b-25a1006e016a"},{"name":"Alexandre Dumas","sex":"M","_id":"5e806693-727b-4956-b539-e797d5bcef2b"}]
```


## Filters and orders

All filter and orders parameters are located after ```?``` sign in the URL.

 Parameter name | Synonyms | Description
----------------|---------|-------------
_fields | _filter | List field names to show, separate by comma
_sort | _order | List field names to sort, separate by comma, descending sort if begins with '-'
_start | _begin, _page | Start page
_limit | _per_page | Limit per page


### Examples

- Find all writers, show only ```name``` field, sorting by ```name```

```
  curl "127.0.0.1:8877/writers?_filter=name&_sort=name"
    [{"name":"Alexandra Ripley","sex":"F","_id":"1bec2412-cdd3-4e78-b22b-25a1006e016a"},{"name":"Alexandre Dumas","sex":"M","_id":"5e806693-727b-4956-b539-e797d5bcef2b"}]
```

- Find ```alex``` in writers, case insensitive, show only ```name``` field, sort by ```name``` descending

```
  curl "127.0.0.1:8877/writers?name=/alex/i&_filter=name&_sort=-name"
    [{"name":"Alexandre Dumas","_id":"171b51f5-1dc9-4b3c-ad1f-6af8c9a53c3a"},{"name":"Alexandra Ripley","_id":"10b7d763-4ea4-4b56-924c-2e6b4b426b31"}]
```


## HATEOAS

  Each response is complemented by ```_links``` object which refer to other methods and resources using URIs as key. For example, result of POST response:

```{"name":"Alexandra Ripley","sex":"F","_id":"40abf64d-a317-4735-a8d2-a8fe08fd4a5b","_links":{"/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b":{"self":"GET","update":"PUT","replace":"PATCH","delete":"DELETE"},"/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b/books":{"books":"GET"}}}```

  This document includes links to both ```/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b``` collection and ```/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b/books``` resource

```
  {
    "_links": {
      "/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b": {
        "self":"GET",
        "update":"PUT",
        "replace":"PATCH",
        "delete":"DELETE"
      },
      "/writers/40abf64d-a317-4735-a8d2-a8fe08fd4a5b/books": {
        "books":"GET"
      }
    }
  }
```


## Lnked Usage Example

```javascript
// index.js
var Api = require('create-rest-api');
var api = new Api();

api.registerModel('writers', {
  name: { type: 'string', required: true },
  sex: { type: 'any', one: ['M', 'F'] }
});

api.registerModel('books', {
  name: { type: 'string', required: true },
  year: { type: 'integer' },
  writers: { type: 'array', link: 'writers' },
});

api.start();
```

### Methods

 Method | URL | Description | Posible errors
--------|-----|-------------|----------------
GET | /writers | List of writers | 404: NOT_FOUND
GET | /books | List of books | 404: NOT_FOUND
GET | /writers/{id} | Single writer info | 404: NOT_FOUND
GET | /books/{id} | Single book info | 404: NOT_FOUND
GET | /writers/{id}/books | All writer's books | 404: NOT_FOUND
GET | /books/{id}/writers | List of writers, linked to book | 404: NOT_FOUND
POST | /writers | Add new writer | 400: DATA_VALIDATION_ERROR
POST | /books | Add new book | 400: DATA_VALIDATION_ERROR
PUT | /writers/{id} | Update some writer's information | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
PUT | /books/{id} | Update some book's information | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
PATCH | /writers/{id} | Update all writer's record | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
PATCH | /books/{id} | Update all books's record | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
DELETE | /writers/{id} | Delete writer by id | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
DELETE | /books/{id} | Delete book by id | 400: DATA_VALIDATION_ERROR, 404: NOT_FOUND
GET | /api.raml | API documentation |


## Examples

- Add new document

```
  curl -X POST -H 'Content-Type: application/json' -d '{"name":"Alexandre Dumas"}' 127.0.0.1:8877/writers
  {"name":"Alexandre Dumas","_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","_links":{"self":{"href":"writers/5bdac691-7f6c-470f-94e7-24e7986e3dae"}}}
```

- Get all documents

```
  curl 127.0.0.1:8877/writers
  [{"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}]
```

- Get one document by id

```
  curl 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae
  {"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}
```

- Update part of document

```
  curl -X PATCH -H 'Content-Type: application/json' -d '{"sex":"M"}' 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae
  {"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas","sex":"M"}
```

- Replace document

```
  curl -X PUT -H 'Content-Type: application/json' -d '{"name":"Alexandre Dumas"}' 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae
  {"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae","name":"Alexandre Dumas"}
```

- Delete document

```
  curl -X DELETE 127.0.0.1:8877/writers/5bdac691-7f6c-470f-94e7-24e7986e3dae
  {"ok":1,"_id":"5bdac691-7f6c-470f-94e7-24e7986e3dae"}
```

- Add two writers: Alexandra Ripley and Alexandre Dumas

```
  curl -X POST -H 'Content-Type: application/json' -d '{"name":"Alexandra Ripley","sex":"F"}' 127.0.0.1:8877/writers
    {"name":"Alexandra Ripley","sex":"F","_id":"1bec2412-cdd3-4e78-b22b-25a1006e016a","_links":{"self":{"href":"writers/1bec2412-cdd3-4e78-b22b-25a1006e016a"}}}
  curl -X POST -H 'Content-Type: application/json' -d '{"name":"Alexandre Dumas", "sex":"M"}' 127.0.0.1:8877/writers
  {"name":"Alexandre Dumas","sex":"M","_id":"6b9576dd-730a-41e1-97b3-41ee67cf9e4f","_links":{"self":{"href":"writers/6b9576dd-730a-41e1-97b3-41ee67cf9e4f"}}}
```

- Add couple books

```
  curl -X POST -H 'Content-Type: application/json' -d '{"name":"The Three Musketeers", "writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"]}' 127.0.0.1:8877/books
  {"name":"The Three Musketeers","writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"],"_id":"7801cc6d-84f4-4506-8eaa-56e5369983fc","_links":{"self":{"href":"books/7801cc6d-84f4-4506-8eaa-56e5369983fc"}}}

  curl -X POST -H 'Content-Type: application/json' -d '{"name":"The Count of Monte Cristo", "writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"]}' 127.0.0.1:8877/books
  {"name":"The Count of Monte Cristo","writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"],"_id":"5435b002-ef7b-4ff1-9dd1-9a0ff22c829a","_links":{"self":{"href":"books/5435b002-ef7b-4ff1-9dd1-9a0ff22c829a"}}}
```

- Find books by writer

```
  curl 127.0.0.1:8877/writers/6b9576dd-730a-41e1-97b3-41ee67cf9e4f/books
  [{"name":"The Three Musketeers","writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"],"_id":"7801cc6d-84f4-4506-8eaa-56e5369983fc"},{"name":"The Count of Monte Cristo","writers":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"],"_id":"5435b002-ef7b-4ff1-9dd1-9a0ff22c829a"}]
```

- Find writers by books

```
  curl 127.0.0.1:8877/books/7801cc6d-84f4-4506-8eaa-56e5369983fc/writers
  [{"name":"Alexandre Dumas","sex":"M","_id":"6b9576dd-730a-41e1-97b3-41ee67cf9e4f"}]
```


## Error examples

```
  curl 127.0.0.1:8877/writers
  {"status":404,"name":"NOT_FOUND","message":"writers not found","developerMessage":{}}

  curl 127.0.0.1:8877/writers/123
  {"status":404,"name":"NOT_FOUND","message":"writer not found","developerMessage":{"_id":"123"}}

  curl -X POST -H 'Content-Type: application/json' -d '{"sex":"yes"}' 127.0.0.1:8877/writers
  {"status":400,"name":"DATA_VALIDATION_ERROR","message":"Field .sex not matched with type any. Field .name not found","developerMessage":{"text":"Field .sex not matched with type any. Field .name not found","notMatched":{".sex":"any"},"notFound":[".name"]}}

  curl 127.0.0.1:8877/writers/6b9576dd-730a-41e1-97b3-41ee67cf9e4f/books
  {"status":404,"name":"NOT_FOUND","message":"books not found","developerMessage":{"writers":{"$in":["6b9576dd-730a-41e1-97b3-41ee67cf9e4f"]}}}

  curl -X DELETE 127.0.0.1:8877/books/d3f49bee-510e-44b5-9ee6-0e7440b053bc
  {"status":404,"name":"NOT_FOUND","message":"book not found","developerMessage":{"_id":"d3f49bee-510e-44b5-9ee6-0e7440b053bc"}}
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

