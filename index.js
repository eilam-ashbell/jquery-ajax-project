// --- FIRST INIT ---

const DEV_MODE = true;
const CACH = {};

// get coin list API as app loaded
$.ajax({
  type: "get",
  url: "https://api.coingecko.com/api/v3/coins/list",
  //   data: "data",
  //   dataType: "json",
  success: (res) => insertCardsToDom(res),
});

// gets array of coins
// creates for each coin HTML string card template in chain
// insert all cards HTML string to the DOM
function insertCardsToDom(arr) {
  let cards = "";
  if (DEV_MODE) {
    //DEV_MODE is for quick loading - only 6 coins cards
    const shortArr = arr.slice(0, 10);
    shortArr.forEach((coin) => {
      cards += createCoinCard(coin);
    });
    $("#cardWrapper").append(cards);
  } else {
    // all the cards
    arr.forEach((coin) => {
      cards += createCoinCard(coin);
    });
    $("#cardWrapper").append(cards);
  }
}

// coin card template
// coin object example:
// {id: '01coin', symbol: 'zoc', name: '01coin'}
function createCoinCard(coinObj) {
  return `<div class="card col-lg-4 col-12">
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

// --- HANDLE NAVIGATION ---
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

// --- HANDLE MORE INFO ---

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
      $(`#info-${resJ.id}`).html(createMoreInfo(resJ));
      CACH[resJ.id] = [resJ, new Date().getTime()]; // save in cach
    });
}

// more info template - return HTML string
function createMoreInfo(obj) {
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

// get number and currency type and return number as that currency
function formatToCurrency(num, currency) {
  return new Intl.NumberFormat("he-HE", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
    roundingMode: "floor",
  }).format(num);
}

// --- HANDLE SWITCHES FOR LIVE REPORT ---

let coinsToReport = [];
const reportModal = new bootstrap.Modal("#reportModal");

function setToReport(coin) {
  if (event.target.checked) {
    if (coinsToReport.length >= 5) {
      $("#saveModal").attr("data-coin-symbol", `${coin}`);
      getModalData(coin);
      $("#cancelModal").attr(
        "data-coin-list",
        `${JSON.stringify(coinsToReport)}`
      );
      reportModal.show();
      $(event.target).prop("checked", false);
    } else {
      coinsToReport.push(coin);
      $(`#select-${coin}`).prop("checked", true);
    }
  } else {
    removeCoinFromReport(coin);
  }
}

// set the active coins to the modal display
function getModalData(coinName) {
  $(".modal-table").html("");
  $("#coinSpan").html(`"${coinName}"`);
  coinsToReport.forEach((coin) => {
    $(".modal-table")
      .append(`<tr><td>${coin}</td><td><div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" checked onclick="setToReport('${coin}')">
        </div></td></tr>`);
  });
}

// remove a coin from the report list
function removeCoinFromReport(coin) {
  coinsToReport = coinsToReport.filter((element) => element !== coin);
  $(`#select-${coin}`).prop("checked", false);
}

function saveModalSettings(event) {
  if (coinsToReport.length < 5) {
    coinsToReport.push(event.target.dataset.coinSymbol);
    $(`#select-${event.target.dataset.coinSymbol}`).prop("checked", true);
  }
  reportModal.hide();
}

function cancelModal(event) {
  list = JSON.parse(event.target.dataset.coinList);
  list.forEach((element) => {
    $(`#select-${element}`).prop("checked", true);
  });
  coinsToReport = list;
}

// --- CHART ---

const canvas = document.getElementById("report");
let reportChart; //                                 will get the Chart object
const LABELS_NUMBER = 50; //                         define how much labels will be in the chart
const labels = new Array(LABELS_NUMBER); //         Array of all chart labels
let updateReportInterval; //                        will get the id of the chart update interval

function initData() {
  const dataset = []; //    Array of dataset objects
  //                        datasetObject = {  label: coinName,
  //                        yAxisID: coinName,
  //                        data: data from API [],
  //                        borderColor: string,
  //                        backgroundColor: string}
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToReport}&tsyms=USD`
  )
    .then((res) => res.json())
    .then((resJ) => {
      coinsPrice = Object.entries(resJ);
      // resJ example: [["HALF",{USD: 13659.5}],["ALGOHALF",{USD: 10666.5}],["BCHHALF",{USD: 6387}]]
      coinsPrice.forEach((element, index) => {
        dataset.push({
          label: `${element[0]}`,
          yAxisID: `A`,
          data: [element[1].USD],
          borderColor: getColor(index),
          backgroundColor: getColor(index),
        });
      });
      initLabels();
      createChart(dataset, labels);
    });
}

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
        // resJ example: [["HALF",{USD: 13659.5}],["ALGOHALF",{USD: 10666.5}],["BCHHALF",{USD: 6387}]]
        coinsPrice.forEach((element, i) => {
          if (reportChart.data.datasets[i].data.length < LABELS_NUMBER) {
            reportChart.data.datasets[i].data.push(element[1].USD);
          } else {
            reportChart.data.datasets[i].data.push(element[1].USD);
            reportChart.data.datasets[i].data.shift();
          }
        });
        if (reportChart.data.datasets[0].data.length >= LABELS_NUMBER) {
          labels.push(
            new Date(new Date().getTime() + 4000).toLocaleTimeString("en-US", {
              hour12: false,
            })
          );
          labels.shift();
        }

        reportChart.update();
      });
  }, 2000);
}

function stopLiveReport() {
  clearInterval(updateReportInterval);
  reportChart.destroy();
}

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
    $(".card").show();
  } else {
    $(".card").hide();
    $(`.card-body[data-symbol|="${term}"]`).parent().show();
  }
}

// I think this is more user friendly search so i used this one..
// shows all the coins that have the search term some where
function newSearch () {
    const term = $("#searchBox").val()
    if (term.length == 0) {
        $(".card").show();
    } else {
        $(".card").hide()
        $(".card").has(`h5:contains(${term})`).show();
    }
}

function toggleActive() {
    if ($("#showActive").hasClass("active")) {
        $(".card").show()
        $("#showActive").text("Selected").css("padding", "6px 12px")
        newSearch()
    } else {
        $("#showActive").text("All").css("padding", "6px 35px")
        $(".card").has(`input:checked`).show()
        $(".card").has(`input:not(:checked)`).hide()
    }
    $("#showActive").toggleClass("active")
}