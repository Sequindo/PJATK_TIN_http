/* jshint browser: true, devel: true, unused: true, globalstrict: true, esversion: 6*/
'use strict';

let loadEverything = function() {
  let now=new Date();
  let year=now.getFullYear();
  let month=now.getMonth();
  let day=now.getDate();
  loadCalendar(year,month,day);
  loadRooms(year,month,day);
  setDate(year,month,day);
}
  
function book(room,year,month,day,element){
  let calendarElem = document.getElementById('calendar');
  fetch( `?data=book&room=${room}&month=${month}&year=${year}&day=${day}`)
  .then(response => {
     if(response.ok){
        return response.text();
     }
     else{
        loadRooms (year,month,day)
        throw new Error("Błąd: " + response.status);
     }
  })
  .then(
     text => {
      loadRooms (year,month,day);
        if(text == 'OK'){
            element.innerHTML='Zwolnij';
            element.parentElement.className='booked';
            element.onclick=function(){release(room,year,month,day,element)};
        }
        else{
           throw new Error("Nie udało się zarezerwować pokoju: " + text);
        }
     }
   )
  .catch( error => alert(error));
}

function release(room,year,month,day,element){
   let calendarElem = document.getElementById('calendar');
  fetch( `?data=release&room=${room}&month=${month}&year=${year}&day=${day}`)
  .then(response => {
     if(response.ok){
        return response.text();
     }
     else{
      loadRooms (year,month,day)
        throw new Error("Błąd: " + response.status);
     }
  })
  .then(
     text => {
      loadRooms (year,month,day);
        if(text == 'OK'){
            element.innerHTML='Zarezerwuj';
            element.parentElement.className='free';
            element.onclick=function(){book(room,year,month,day,element)};
        }
        else{
           throw new Error("Nie udało się zwolnić pokoju: " + text);
        }
     }
   )
  .catch( error => alert(error));
}
  


function loadCalendar (year, month, day){
  let calendarElem = document.getElementById('calendar');
  fetch( `?data=calendar&month=${month}&year=${year}&day=${day}`)
  .then(response => {
     if(response.ok){
        return response.text();
     }
     else{
        throw new Error("Błąd: " + response.status);
     }
  })
  .then(
     text => {
        calendarElem.innerHTML = text
     }
   )
  .catch( error => alert(error));
}

function loadRooms (year,month,day){
  let roomsElem = document.getElementById('rooms');
  setDate(year, month, day);
  fetch( `?data=rooms&month=${month}&year=${year}&day=${day}`)
  .then(response => {
     if(response.ok){
        loadCalendar (year, month, day)
        return response.text();
     }
     else{
        throw new Error("Błąd: " + response.status);
     }
  })
  .then(
     text => {
        roomsElem.innerHTML = text
     }
   )
  .catch( error => alert(error));
}

function changeCalendarHeader(param) {
   console.log("Wywołano");
   let year_header = document.getElementById('calendar_header_year');
   let month_header = document.getElementById('calendar_header_month');
   fetch( `?data=calendar_header&month=${month_header.innerHTML}&year=${year_header.innerHTML}&param=${param}`)
   .then(response => {
     if(response.ok){
        return response.json();
     }
     else{
        throw new Error("Błąd: " + response.status);
     }
  })
  .then(
     text => {
      setDate(text.new_year, text.new_month, 1);
      loadCalendar(text.new_year, text.new_month, 1);
     }
   )
  .catch( error => alert(error));
}

function setDate (year,month,day){
  let date=new Date(year,month,day);
  let tim=document.getElementById('dat');
  tim.innerHTML=date.toLocaleDateString();
  tim.datetime=date.toISOString();

  let header_year = document.getElementById('calendar_header_year');
  let header_month = document.getElementById('calendar_header_month');
  header_year.innerHTML = date.getFullYear();
  let monthForHeader = date.getMonth();
  switch(monthForHeader) {
     case 0: header_month.innerHTML = 'Styczeń'; break;
     case 1: header_month.innerHTML = 'Luty'; break;
     case 2: header_month.innerHTML = 'Marzec'; break;
     case 3: header_month.innerHTML = 'Kwiecień'; break;
     case 4: header_month.innerHTML = 'Maj'; break;
     case 5: header_month.innerHTML = 'Czerwiec'; break;
     case 6: header_month.innerHTML = 'Lipiec'; break;
     case 7: header_month.innerHTML = 'Sierpień'; break;
     case 8: header_month.innerHTML = 'Wrzesień'; break;
     case 9: header_month.innerHTML = 'Październik'; break;
     case 10: header_month.innerHTML = 'Listopad'; break;
     case 11: header_month.innerHTML = 'Grudzień'; break;
     default: header_month.innerHTML = ''; break;
  }
}
