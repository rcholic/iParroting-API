var moment = require('moment');

var exp = moment().add(7, 'days').unix();

var today = moment().unix();
console.info('today is: ', today);
console.info('exp is: ', exp);
var tomorrow = moment.unix(exp);

if (moment.unix(exp).isAfter(today)) {
  console.log('expired!!')
} else {
  console.log('tomorrow: ', moment.unix(exp));
  console.log('today: ', today);
}

//
// if (exp.isAfter(moment().unix())) {
//   console.info('after today');
// } else {
//   console.info('before today');
// }s
