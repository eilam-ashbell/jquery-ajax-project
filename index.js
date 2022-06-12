const DEV_MODE = true;

// get coin list API as app loaded
$.ajax({
  type: "get",
  url: "https://api.coingecko.com/api/v3/coins/list",
  //   data: "data",
  //   dataType: "json",
  success: (res) => insertCardsToDom(res),
});

// get more data about spesific coin and display it with createMoreInfo template
function getMoreInfo(event) {
  event.preventDefault();
  const BASE_URL = "https://api.coingecko.com/api/v3/coins/";
  const coinId = event.target.dataset.coinId;
  $.ajax({
    type: "get",
    url: BASE_URL + coinId,
    // data: "data",
    // dataType: "json",
    success: (res) => {
      const moreInfo = createMoreInfo(res);
      $(`#info-${res.id}`).html(moreInfo);
    },
    error: (err) => console.log(err),
  });
}

// disply number as currency
function formatToCurrency(num, currency) {
  return new Intl.NumberFormat("he-HE", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
    roundingMode: "floor",
  }).format(num);
}

// insert cards to the DOM
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

// more info template
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

// REPORTS

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
      console.log(coinsToReport);
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
  console.log(coinsToReport);
}

function saveModalSettings(event) {
  if (coinsToReport.length < 5) {
    coinsToReport.push(event.target.dataset.coinSymbol);
    $(`#select-${event.target.dataset.coinSymbol}`).prop("checked", true);
    console.log(coinsToReport);
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

// Navigation

function changeTab(event) {
  $(".nav-link").removeClass("active");
  $(event.target).addClass("active");
  $(".tab").hide();
  console.log(event.target.dataset.tab);
  $(`#${event.target.dataset.tab}`).show();
}
