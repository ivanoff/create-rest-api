/**
 * Array lib
 **/
'use strict';

// JSON.stringify for each element of array
Object.defineProperty(Array.prototype, 'prettyJSON', {
  value: function () {
    return this.map(function (w) {
      return JSON.stringify(w, true);
    });
  },
});

