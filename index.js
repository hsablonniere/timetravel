const AIRPORTS = {
  CDG: {
    code: 'CDG',
    name: 'Charles de Gaulle International Airport',
    city: 'Paris',
    shift: 1 * 60 * 60 * 1000,
    shiftTimezone: '+01:00',
    timezone: 'Europe/Paris',
    emoji: '🇫🇷',
  },
  SIN: {
    code: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    shift: 8 * 60 * 60 * 1000,
    shiftTimezone: '+08:00',
    timezone: 'Asia/Singapore',
    emoji: '🇸🇬',
  },
  PNH: {
    code: 'PNH',
    name: 'Pochentong International Airport',
    city: 'Phnom Penh',
    shift: 7 * 60 * 60 * 1000,
    shiftTimezone: '+07:00',
    timezone: 'Asia/Phnom_Penh',
    emoji: '🇰🇭',
  },
};

const data = `
CDG 2024-02-28T21:05 SIN 2024-02-29T16:55
SIN 2024-02-29T19:55 PNH 2024-02-29T21:00
PNH 2024-03-13T14:45 SIN 2024-03-13T18:00
SIN 2024-03-13T23:05 CDG 2024-03-14T06:10
`;

function loop () {

  const now = new Date();

  let travelList = data
    .trim()
    .split('\n')
    .map((line) => {
      const [fromAirportCode, rawFromDate, toAirportCode, rawToDate] = line.trim().split(' ');
      const fromAirport = AIRPORTS[fromAirportCode];
      const fromDate = new Date(rawFromDate + ':00' + fromAirport.shiftTimezone);
      const toAirport = AIRPORTS[toAirportCode];
      const toDate = new Date(rawToDate + ':00' + toAirport.shiftTimezone);
      return { fromAirport, fromDate, toAirport, toDate };
    });

  const travel = travelList
    .find(({ fromDate, toDate }) => fromDate <= now && now <= toDate);

  if (travel != null) {
    displayTravel(travel);
  }
  else {
    const cities = Object.values(
      Object.fromEntries(
        travelList.flatMap(({ fromAirport, toAirport }) => {
          return [
            [fromAirport.code, fromAirport],
            [toAirport.code, toAirport],
          ];
        }),
      ),
    );
    displayCurrentTime(cities);
  }
}

function displayTravel (travel) {

  const now = new Date();
  const travelDuration = travel.toDate.getTime() - travel.fromDate.getTime();
  const timezoneShift = (travel.toAirport.shift - travel.fromAirport.shift);

  const warp = travelDuration / timezoneShift;
  const elapsed = now - travel.fromDate.getTime();
  const warpedElapsed = Math.floor(elapsed * warp);

  const startTimeAsUtc = travel.fromDate.getTime() + travel.fromAirport.shift;
  const planeTimeAsUtc = startTimeAsUtc + warpedElapsed;

  // language=HTML
  document.body.innerHTML = `
    <div class="line from">
      <div class="time">${formatTime(now, travel.fromAirport.timezone)}</div>
      <div class="emoji">${travel.fromAirport.emoji}</div>
      <div class="city">${travel.fromAirport.city}</div>
    </div>
    <div class="line plane">
      <div class="time">${formatTime(planeTimeAsUtc, 'UTC')}</div>
      <div class="emoji">✈️</div>
      <div class="city">Plane</div>
    </div>
    <div class="line to">
      <div class="time">${formatTime(now, travel.toAirport.timezone)}</div>
      <div class="emoji">${travel.toAirport.emoji}</div>
      <div class="city">${travel.toAirport.city}</div>
    </div>
  `;
}

function formatTime (date, timeZone) {
  const dtf = new Intl.DateTimeFormat('fr', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    timeZone,
  });
  return dtf.format(date).replace(', ', ' ');
}

function displayCurrentTime (airports) {

  const now = new Date();

  // language=HTML
  document.body.innerHTML = airports
    .sort((a, b) => a.shift - b.shift)
    .map((airport) => {
      return `
        <div class="line now">
          <div class="time">${formatTime(now, airport.timezone)}</div>
          <div class="emoji">${airport.emoji}</div>
          <div class="city">${airport.city}</div>
        </div>
      `;
    })
    .join('\n');
}

loop();
setInterval(loop, 500);

window.addEventListener('click', function () {
  document.body.classList.toggle('display-real-times');
}, false);
