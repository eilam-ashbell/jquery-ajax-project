// --- FIRST INIT --- //

// DEV_MODE is for quick loading - only 100 coins cards
// for loading all coins (+/- 13452) turn to false
const DEV_MODE = true;
const CACH = {};

// get coin list API as app loaded > start rendering coins cards to DOM
$.ajax({
  type: "get",
  url: "https://api.coingecko.com/api/v3/coins/list",
  success: (res) => insertCardsToDom(res),
});

// gets array of coins object from API
// ex. object: {id: '01coin', symbol: 'zoc', name: '01coin'}
// for each coin create HTML string card template and add it to "cards" variable
// after all coin's cards created > insert cards HTML string to the DOM
function insertCardsToDom(arr) {
  let cards = "";
  if (DEV_MODE) {
    // disply only 100 coins from the API
    const shortArr = arr.slice(0, 100);
    shortArr.forEach((coin) => {
      cards += createCoinCard(coin);
    });
    $("#cardWrapper").append(cards);
  } else {
    // disply all the coins from the API
    arr.forEach((coin) => {
      cards += createCoinCard(coin);
    });
    // insert to the DOM
    $("#cardWrapper").append(cards);
  }
  //hide the init loader
  $("#initLoader").hide();
}

// coin card template
// gets coin object and return string of HTML coin cart template
// ex. coinObj: {id: '01coin', symbol: 'zoc', name: '01coin'}
function createCoinCard(coinObj) {
  return `<div class="card card-search col-lg-4 col-12">
      <div class="card-body" data-id="${coinObj.id}" data-name="${coinObj.name}" data-symbol="${coinObj.symbol}">
          <div class="d-flex flex-row justify-content-between">
              <h5 class="card-title">${coinObj.symbol}</h5>
              <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="select-${coinObj.symbol}" data-coin-symbol="${coinObj.symbol}" onclick="setToReport('${coinObj.symbol}')">
              </div>
          </div>
          <p class="card-text">${coinObj.name}</p>
            <a class="btn btn-primary" data-bs-toggle="collapse" href="#data-${coinObj.id}" role="button"
                aria-expanded="false" aria-controls="data-${coinObj.id}" data-coin-id="${coinObj.id}" onclick="getMoreInfo(event)">
                More Info
            </a>
            <div class="collapse" id="data-${coinObj.id}">
                <div class="card card-body mt-2" id="info-${coinObj.id}">
                <div class="spinner-border text-primary m-auto" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
                </div>
            </div>
        </div>
    </div>`;
}

// --- HANDLE NAVIGATION --- //
// toggle visibility the relevant content
// if report > initalize chart | else > stop chart interval
function changeTab(event) {
  if ($(event.target).hasClass("nav-link")) {
    $(".nav-link").removeClass("active");
    $(event.target).addClass("active");
    $(".tab").hide();
    $(`#${event.target.dataset.tab}`).show();
    if (event.target.dataset.tab === "live") {
      initData();
    } else {
      stopLiveReport();
    }
  }
}

// --- HANDLE MORE INFO --- //

// get more info about spesific coin and display it with createMoreInfo template
// after first fetch > save in cach with timestamp
// if last fetch was over 2 min > fetch again. else get from cach
function getMoreInfo(event) {
  event.preventDefault();
  const BASE_URL = "https://api.coingecko.com/api/v3/coins/";
  const coinId = event.target.dataset.coinId;
  if (!CACH[coinId]) {
    // if not in cach > get with fetch
    getMoreData(BASE_URL, coinId);
  } else if (new Date().getTime() - CACH[coinId][1] > 120000) {
    // if over 2 min > get with fetch
    getMoreData(BASE_URL, coinId);
  } else {
    // if in cach & under 2 min > get with cach and display
    $(`#info-${coinId}`).html(createMoreInfo(CACH[coinId][0]));
  }
}

// fetch info from API & display > save in cach
function getMoreData(BASE_URL, coinId) {
  fetch(BASE_URL + coinId)
    .then((res) => res.json())
    .then((resJ) => {
      // gets coin object and creates a string of HTML template and render it to DOM
      $(`#info-${resJ.id}`).html(createMoreInfo(resJ));
      // save in cach resault & timestamp
      CACH[resJ.id] = [resJ, new Date().getTime()];
    });
}

// gets coin object > return HTML string template
function createMoreInfo(obj) {
    if (obj.market_data.current_price.usd == undefined) {
        // if there is no data about that coin > disply message
        return `<p class="center">Sorry, don't have that data currently</p>`
    } else {
            return `<img class="coin-thumb"
                src="${obj.image.small}" />
            <table class="price-table">
                <thead>
                    <th class="usd">USD</th>
                    <th class="eur">EUR</th>
                    <th class="ils">ILS</th>
                </thead>
                <tbody>
                    <td class="usd">${formatToCurrency(
                        obj.market_data.current_price.usd,
                        "USD"
                    )}</td>
                    <td class="eur">${formatToCurrency(
                        obj.market_data.current_price.eur,
                        "EUR"
                    )}</td>
                    <td class="ils">${formatToCurrency(
                        obj.market_data.current_price.ils,
                        "ILS"
                    )}</td>
                </tbody>
            </table>`;
          }
}

// get number and currency type > return formated number as currency
function formatToCurrency(num, currency) {
  return new Intl.NumberFormat("he-HE", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
    roundingMode: "floor",
  }).format(num);
}

// --- HANDLE SWITCHES FOR LIVE REPORT --- //

let coinsToReport = [];                                     // collecting the coins to the report | max of 5
const reportModal = new bootstrap.Modal("#reportModal");    // sets the modal

// get the relevant coin symbol from the interaction switch and add / remove from coinsToReport array
function setToReport(coin) {
  if (event.target.checked) {
    if (coinsToReport.length >= 5) {                        // if coinsToReport has 5 elements > display modal
      $("#saveModal").attr("data-coin-symbol", `${coin}`);  // save the 6 switch to handle later if selection changed
      getModalData(coin);                                   // display selected coins to the modal
      $("#cancelModal").attr(                               // save the origin coinsToReport array to handle if modal canceled
        "data-coin-list",
        `${JSON.stringify(coinsToReport)}`
      );
      reportModal.show();                                   // shows modal
      $(event.target).prop("checked", false);               // unselect the 6 switch
    } else {                                                // if coinsToReport is less then 5
      coinsToReport.push(coin);                             // add this coin to coinsToReport array
      $(`#select-${coin}`).prop("checked", true);           // select this switch
      $(`#td-${coin}`).css({ "text-decoration": "none", opacity: "1" });
    }
  } else {
    removeCoinFromReport(coin);                             // if switch turn off > remove from coinsToReport array
  }
}

// set the selected coins to the modal display
function getModalData(coinName) {
  $(".modal-table").html("");
  $("#coinSpan").html(`"${coinName}"`);
  coinsToReport.forEach((coin) => {
    $(".modal-table")
      .append(`<tr class="tr-modal"><td><div class="form-check form-switch modalSwitch">
        <input class="form-check-input" type="checkbox" role="switch" checked onclick="setToReport('${coin}')">
        </div></td><td id="td-${coin}">${coin}</td></tr>`);
  });
}

// remove unselected coin from coinsToReport array
function removeCoinFromReport(coin) {
  coinsToReport = coinsToReport.filter((element) => element !== coin);
  $(`#select-${coin}`).prop("checked", false);
  $(`#td-${coin}`).css({ "text-decoration": "line-through", opacity: "0.3" });
}

// if coinsToReport shrink to less the 5 > add the 6 coin to that array and hide modal
function saveModalSettings(event) {
  if (coinsToReport.length < 5) {
    coinsToReport.push(event.target.dataset.coinSymbol);
    $(`#select-${event.target.dataset.coinSymbol}`).prop("checked", true);
  }
  reportModal.hide();
}

// if modal cancel > set coinsToReport to its origin 5 coins
function cancelModal(event) {
  list = JSON.parse(event.target.dataset.coinList);
  list.forEach((element) => {
    $(`#select-${element}`).prop("checked", true);
  });
  coinsToReport = list;
}

// --- CHART ---

const canvas = document.getElementById("report");   // sets the canvas to disply the report
let reportChart;                                    // will get the Chart object
const LABELS_NUMBER = 50;                           // define how much labels will be in the chart
const labels = new Array(LABELS_NUMBER);            // Array of all chart labels
let updateReportInterval;                           // will get the id of the chart update interval

function initData() {
  const dataset = [];   // Array of dataset objects
                        // datasetObject = {label: coinName, yAxisID: coinName, data: data from API [], borderColor: string, backgroundColor: string}
  if (coinsToReport != 0) {
    $("#reportWarning").hide();
    // get price data of all selected currency in USD
    fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToReport}&tsyms=USD`
    )
      .then((res) => res.json())
      .then((resJ) => {
        if (resJ.Response == "Error") {
            // if that API dont have data on single currency, disply message
            // ex. error from server {"Response":"Error","Message":"cccagg_or_exchange market does not exist for this coin pair (ASDHALF-USD)","HasWarning":false,"Type":1,"RateLimit":{},"Data":{},"Cooldown":0}
            $("#reportWarning").text(`We don't have ${coinsToReport[0]} data currently`).show();
            $("#spinner").hide();
        } else {
            coinsPrice = Object.entries(resJ); // converts resJ to an array
            // coinsPrice example: [["HALF",{USD: 13659.5}],["ALGOHALF",{USD: 10666.5}],["BCHHALF",{USD: 6387}]]
            coinsPrice.forEach((element, index) => {    // set dataset for each coin
            dataset.push({
                label: `${element[0]}`,
                yAxisID: `A`,
                data: [element[1].USD],
                borderColor: getColor(index),
                backgroundColor: getColor(index),
            });
            });
            initLabels(); // sets time lables for X axis
            createChart(dataset, labels); // draw the chart
            $("#spinner").hide();
    }});
  } else { // if no coin selected > disply message
    $("#reportWarning").text(`Pleas select at least one coin to start Live Report`).show();
    $("#spinner").hide();
  }
}

// sets labels as LABELS_NUMBER from current time + 2 sec for every label
function initLabels() {
  const currentTime = new Date().getTime();
  labels[0] = new Date(currentTime).toLocaleTimeString("en-US", {
    hour12: false,
  });
  for (let i = 1; i <= LABELS_NUMBER; i++) {
    labels[i] = new Date(currentTime + 2000 * i).toLocaleTimeString("en-US", {
      hour12: false,
    });
  }
}

// draw chart with relevant data and start interval to update it every 2 seconds
function createChart(dataset, labels) {
  reportChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: dataset,
    },
    options: {
      animation: false,
    },
  });
  startInterval(reportChart);
}

function startInterval(reportChart) {
  updateReportInterval = setInterval(() => {
    fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToReport}&tsyms=USD`
    )
      .then((res) => res.json())
      .then((resJ) => {
        coinsPrice = Object.entries(resJ);
        // coinsPrice example: [["HALF",{USD: 13659.5}],["ALGOHALF",{USD: 10666.5}],["BCHHALF",{USD: 6387}]]
        coinsPrice.forEach((element, i) => {
          if (reportChart.data.datasets[i].data.length < LABELS_NUMBER) {
            //   if number of data values under LABELS_NUMBER > add the new value
            reportChart.data.datasets[i].data.push(element[1].USD);
          } else {
            //   if number of data values equal or over LABELS_NUMBER > add the new value & remove the first one
            reportChart.data.datasets[i].data.push(element[1].USD);
            reportChart.data.datasets[i].data.shift();
          }
        });
        if (reportChart.data.datasets[0].data.length >= LABELS_NUMBER) {
            // if number of data values equal or over LABELS_NUMBER > add new label to x axis and remove the first one
          labels.push(
            new Date(new Date().getTime() + 4000).toLocaleTimeString("en-US", {
              hour12: false,
            })
          );
          labels.shift();
        }
        // update the chart
        reportChart.update();
      });
  }, 2000);
}

// stops the chart updating and destroied id to enable the next init
function stopLiveReport() {
  clearInterval(updateReportInterval);
  if (reportChart) {
    //   destroy chart only if initioned. else do nothing.
  reportChart.destroy();
  }
}

// set different color to each coin line on the chart
function getColor(index) {
  switch (index) {
    case 0:
      return "#046E8F";
      break;
    case 1:
      return "#70929F";
      break;
    case 2:
      return "#38AECC";
      break;
    case 3:
      return "#0090C1";
      break;
    case 4:
      return "#183446";
      break;
  }
}

// --- SEARCH & FILTER---

// this is the search we was asked to do
// shows only if searching the exact term
function handleSearch(term) {
  if (term.length == 0) {
    $(".card-search").show();
  } else {
    $(".card-search").hide();
    $(`.card-body[data-symbol|="${term}"]`).parent().show();
  }
}

// I think this is more user friendly search so i used this one..
// shows all the coins that have the search term some where
function newSearch() {
  const term = $("#searchBox").val();
  $("#noRes").hide();
  if (term.length == 0) {
    $(".card-search").show();
  } else {
    $(".card-search").hide();
    $(".card-search").has(`h5:contains(${term})`).show();
    if ($(".card-search:visible").length == 0) {
      $("#noRes").show();
      $("#searchTerm").text(term);
    }
  }
}

// handle the 'selected' filter and toggle visibility of selected coins
function toggleActive() {
  if ($("#showActive").hasClass("active")) {
    $(".card-search").show();
    $("#showActive").text("Selected").css("padding", "6px 12px");
    newSearch();
  } else {
    $("#showActive").text("All").css("padding", "6px 35px");
    $(".card-search").has(`input:checked`).show();
    $(".card-search").has(`input:not(:checked)`).hide();
  }
  $("#showActive").toggleClass("active");
}
