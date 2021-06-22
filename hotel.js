/*jshint node: true, esversion:6 */

// Load the http module to create an http server.
let http = require('http');
let url = require('url');
let fs = require('fs');
const { Console } = require('console');

let rooms=[101, 102, 103, 104, 105, 201, 202, 203, 204, 205, 301, 302, 303, 304 ,305];


// Uwaga: miesiące się numerują od zera!

let reservations;

fs.readFile("lib/reservations.json",'utf-8',
  function(error, data){
    if(error){
      console.log("can't read file");
      process.exit();
    }
    else{
      reservations = JSON.parse(data);
    }
  }
);


function notFound(response){
  response.writeHead(404, {'Content-Type': 'text/html'});
  response.end('<h1>File not found!</h1>');
}  


function getReadFile (response,contentType) {
  return function(error, data){
    if(error) notFound(response);
    else{
      response.writeHead(200, {'Content-Type': contentType, 'Content-Length': Buffer.byteLength(data)});
      response.end(data);
    }
  }
};

function bookRoom(room, year, mon, day){
  let key=year+'-'+mon+'-'+day;
  if(reservations[key] && reservations[key][room]){
    return 'Pokój już jest zajęty';
  }
  else{
    if(reservations[key]){
      reservations[key][room]=true;
      console.log('Room '+room+' reserved');
    }
    else{
      reservations[key]={};
      reservations[key][room]=true;
      console.log('Room '+room+' reserved');
    }
    fs.writeFileSync("lib/reservations.json", JSON.stringify(reservations));
    getCalendar(year, mon, day);
    return 'OK';
  }
}

function releaseRoom(room, year, mon, day){ //wpis reservations[key] musi istnieć
  let key=year+'-'+mon+'-'+day;
  if((reservations[key] && reservations[key][room]===false) || !reservations[key]){
    return 'Pokój został już zwolniony';
  }
  else{
    if(reservations[key]){
      reservations[key][room]=false;
      console.log('Room '+room+' reserved');
    }
    fs.writeFileSync("lib/reservations.json", JSON.stringify(reservations));
    getCalendar(year, mon, day);
    return 'OK';
  }
}
    
function checkAvailability(key)
{
  if(!reservations[key]) return true; //brak wpisów dla dnia - true.

  let occupiedCounter = 0;

  for(let i=0; i<rooms.length;i++){
    if(reservations[key][rooms[i]]==true){ 
      occupiedCounter++;
    }
  }
  console.log(occupiedCounter);
  if(occupiedCounter==15)
  return false;
  else return true;
}

function getRooms(year,mon,day){
  let key=year+'-'+mon+'-'+day;
  let table = ['<ul>'];
  for(let i=0; i<rooms.length;i++){
    if(reservations[key] && reservations[key][rooms[i]]){
      //jest zarezerwowany
      table.push('<li class="booked">');
      table.push(rooms[i]);
      table.push(' <span onclick="release('+rooms[i]+','+year+','+mon+','+day+',this)">Zwolnij</span></li>');
    }
    else{
      //jest wolny
      table.push('<li class="free">');
      table.push(rooms[i]);
      table.push(' <span onclick="book('+rooms[i]+','+year+','+mon+','+day+',this)">Zarezerwuj</span></li>');
    }
  }
  table.push('</ul>');
  return table.join('\n');
}

function getCalendar(year,mon,day) {
  function getDay(date) { // numer dnia tygodnia, od 0(pn) do 6(nd)
    let day = date.getDay();
    if (day == 0) day = 7;
    return day - 1;
  }

  let d = new Date(year, mon);
  let currentDate = new Date();

  let table = ['<table><tr><th>pn</th><th>wt</th><th>śr</th><th>czw</th><th>pt</th><th>sb</th><th>nie</th></tr><tr>'];

  // pierwszy wiersz od poniedziałka
  // do pierwszego
  // * * * | 1  2  3  4
  for (let i=0; i<getDay(d); i++) {
    table.push('<td></td>');
  }
  
  // komórki z datami
  while(d.getMonth() == mon) {
    let dd=d.getDate();
    let key=year+'-'+mon+'-'+dd;
    if(dd==day){
       table.push('<td class="today"  onclick="loadRooms('+year+','+mon+','+dd+')">'+dd+'</td>');
     }
     else{
      if(checkAvailability(key))
      {
        if(getDay(d)==5 || getDay(d)==6)
          table.push('<td class="weekend available" onclick="loadRooms('+year+','+mon+','+dd+')">'+dd+'</td>'); 
        else
          table.push('<td class="available" onclick="loadRooms('+year+','+mon+','+dd+')">'+dd+'</td>');
      }
      else
      {
        if(getDay(d)==5 || getDay(d)==6)
          table.push('<td class="weekend notAvailable" onclick="loadRooms('+year+','+mon+','+dd+')">'+dd+'</td>');
        else
        table.push('<td class="notAvailable" onclick="loadRooms('+year+','+mon+','+dd+')">'+dd+'</td>');
      }
     }

    if (getDay(d) % 7 == 6) { // niedziela, koniec wiersza
      table.push('</tr><tr>');
    }

    d.setDate(d.getDate()+1);
  }

  // dodać puste komórki na końcu
  if (getDay(d) != 0) {
    for (let i=getDay(d); i<7; i++) {
      table.push('<td></td>');
    }
  }

  // zamknąć tabelę
  table.push('</tr></table>');

  return table.join('\n')
}

function setCalendarHeader(year, month, param) {
  console.log(month+' '+year+' '+param);
  let month_int = -1;
  let year_int = year;
  switch(month) {
    case 'Styczeń': month_int = 0; break;
    case 'Luty': month_int = 1; break;
    case 'Marzec': month_int = 2; break;
    case 'Kwiecień': month_int = 3; break;
    case 'Maj': month_int = 4; break;
    case 'Czerwiec': month_int = 5; break;
    case 'Lipiec': month_int = 6; break;
    case 'Sierpień': month_int = 7; break;
    case 'Wrzesień': month_int = 8; break;
    case 'Październik': month_int = 9; break;
    case 'Listopad': month_int = 10; break;
    case 'Grudzień': month_int = 11; break;
    default: month_int.innerHTML = -1; break;
 }
  if(param=='next')
  {
    month_int++;
    if(month_int>11) {
      month_int = 0;
      year_int++;
    }
  }
  else {
    month_int--;
    if(month_int<0)
    {
      month_int = 11;
      year_int--;
    }
  }
  console.log('Do zwrotu '+month_int+' '+year_int+' ');
  return JSON.stringify({ 'new_month': month_int, 'new_year':  year_int});
}


let hotel=function (request, response) {
   // Attach listener on end event.
   // Parse the request for arguments and store them in get variable.
   // This function parses the url from request and returns object representation.
   let get = url.parse(request.url, true).query;
   if(request.url=='/hotel.js'){
      notFound(response);
   }
   else if(request.url=='/' || request.url=='/hotel.html'){
      fs.readFile('hotel.html', 'utf-8', getReadFile(response,'text/html'));    
   }
   else if(request.url.substr(-3)=='.js'){
      fs.readFile('.'+request.url, 'utf-8', getReadFile(response,'application/javascript'));
   }
   else if(request.url=='/public/style.css'){
    fs.readFile('public/style.css', 'utf-8', getReadFile(response,'text/css'));
   }
   else if(get['data']=='calendar'){
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end(getCalendar(get['year'],get['month'],get['day']));
   }
   else if(get['data']=='calendar_header'){ //nagłówek kalendarza z miesiącem i rokiem
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(setCalendarHeader(get['year'],get['month'],get['param']));
   }
   else if(get['data']=='rooms'){
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end(getRooms(get['year'],get['month'],get['day']));
   }
   else if(get['data']=='book'){
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end(bookRoom(get['room'],get['year'],get['month'],get['day']));
   }
   else if(get['data']=='release'){
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(releaseRoom(get['room'],get['year'],get['month'],get['day']));
 }
   else{
      notFound(response);
   }
}

// Create the server.
let server=http.createServer(hotel)

// Listen on port 8080, IP defaults to 127.0.0.1
server.listen(8080);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8080/");



process.on('SIGINT',function(){
  console.log(JSON.stringify(reservations));
  fs.writeFileSync("lib/reservations.json", JSON.stringify(reservations));
  console.log('\nshutting down');
  process.exit();
});
