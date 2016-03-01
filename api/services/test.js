var moment = require('moment');

var exp = moment().add(7, 'days').unix();

var today = moment();
console.info('today is: ', today);
var tomorrow = moment.unix(exp);

if (tomorrow.isAfter(today)) {
  console.log('after')
}

//
// if (exp.isAfter(moment().unix())) {
//   console.info('after today');
// } else {
//   console.info('before today');
// }
