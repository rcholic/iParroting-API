var Q = require('q');
var Promise = require('bluebird');

var deferred = Q.defer();
function sayHello() {
  deferred.resolve({message: 'hello world'});
  return deferred.promise;
}

sayHello().then(function(data) {
  console.log('data is: ', data);
});

var fs = require('fs');
Promise.promisifyAll(fs);
fs.readFile('./package.json', 'utf8').then(function(data) {
  console.log('data: ', data);
});
