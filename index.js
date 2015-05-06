//(function () {
var departureTime = 'Wed Feb 06 2013 12:15:00',
    arrivalTime = 'Wed Feb 06 2013 19:10:00',
    departureTimeshift = 1,
    arrivalTimeshift = -8,
    departureTimeNode = document.querySelector('.departure-time'),
    fakeTimeNode = document.querySelector('.fake-time'),
    arrivalTimeNode = document.querySelector('.arrival-time');

var timeshiftToTimezone = function (timeshift) {
  timeshift *= 100;

  if (timeshift >= 0) {
    timeshift = '+' + timeshift;
  } else {
    timeshift = -timeshift;
    timeshift = '-' + timeshift;
  }

  if (timeshift.length < 5) {
    timeshift = timeshift[0] + '0' + timeshift.substr(1);
  }
  return timeshift;
};

var realDate = function (relativeDateString, timeshiftInMinutes) {
  var timezone = timeshiftToTimezone(timeshiftInMinutes);
  return new Date(relativeDateString + ' GMT' + timezone);
};

var paddingZeros = function (number) {
  if (number < 10) {
    return '0' + number;
  } else {
    return '' + number;
  }
};

var shiftTime = function (date, timeshiftInMillisec) {
  return new Date(date.getTime() + timeshiftInMillisec);
};

var formatTime = function (date) {
  var hours = paddingZeros(date.getHours()),
      minutes = paddingZeros(date.getMinutes()),
      seconds = paddingZeros(date.getSeconds());

  return date.toString().substr(0, 3) + ' ' + hours + ':' + minutes + ':' + seconds;
};

var fakeDuration = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();

var realDuration = realDate(arrivalTime, arrivalTimeshift).getTime() - realDate(departureTime, departureTimeshift).getTime();

setInterval(function () {
  var date = new Date(),
      departureDate,
      fakeDate,
      arrivalDate,
      currentDuration,
      currentDurationPercent,
      fakeCurrentDuration;

  currentDuration = date.getTime() - realDate(departureTime, departureTimeshift).getTime();

  currentDurationPercent = currentDuration / realDuration;

  fakeCurrentDuration = fakeDuration * currentDurationPercent;

  date.setTime(date.getTime() + date.getTimezoneOffset() * 60000);

  departureDate = shiftTime(date, departureTimeshift * 3600000);
  departureTimeNode.innerHTML = formatTime(departureDate);

  fakeDate = shiftTime(realDate(departureTime, departureTimeshift), fakeCurrentDuration);
  fakeTimeNode.innerHTML = formatTime(fakeDate);

  arrivalDate = shiftTime(date, arrivalTimeshift * 3600000);
  arrivalTimeNode.innerHTML = formatTime(arrivalDate);
}, 300);

//})();

window.addEventListener('click', function () {
  document.body.classList.toggle('display-real-times');
}, false);
