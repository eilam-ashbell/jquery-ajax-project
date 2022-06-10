const DEV_MODE = true;

// get coin list API
$.ajax({
  type: "get",
  url: "https://api.coingecko.com/api/v3/coins/list",
  data: "data",
  dataType: "json",
  success: (res) => insertCardsToDom(res),
});


// function getMoreInfo (event) {
//     const BASE_URL = "https://api.coingecko.com/api/v3/coins/"
//     const coinId = event.target.dataset.coinId;
//     console.log(event.target.dataset.coinId);

//     // need to return Image. PriceInUSD, PriceInEUR, PriceInILS
//     // image: obj.image.small
//     // PriceInUSD : obj.market_data.current_price.usd  
//     $.ajax({
//         type: "get",
//         url: BASE_URL + coinId,
//         data: "data",
//         dataType: "json",
//         success: (res) => {
//             const moreInfo = `<img class="coin-thumb"
//                                 src="${res.image.small}" />
//                             <table class="price-table">
//                                 <thead>
//                                     <th>USD</th>
//                                     <th>EUR</th>
//                                     <th>ILS</th>
//                                 </thead>
//                                 <tbody>
//                                     <td>${res.market_data.current_price.usd}</td>
//                                     <td>${res.market_data.current_price.eur}</td>
//                                     <td>${res.market_data.current_price.ils}</td>
//                                 </tbody>
//                             </table>
//             `
//             $("#info-res.id").html(moreInfo)
//         },
//       });
// }



// insert cards to the DOM
function insertCardsToDom(arr) {
  let cards = "";
  if (DEV_MODE) { //DEV_MODE is for quick loading - only 6 coins cards
    const shortArr = arr.slice(0, 6);
    console.log(shortArr);
    shortArr.forEach((coin) => {
      cards += coinCardTemplate(coin);
    });
    $("#cardWrapper").append(cards);
  } else { // all the cards
    arr.forEach((coin) => {
      cards += coinCardTemplate(coin);
    });
    $("#cardWrapper").append(cards);
  }
}



// coin object example:
// {id: '01coin', symbol: 'zoc', name: '01coin'}

function coinCardTemplate(coinObj) {
  return `<div class="card col-lg-4 col-md-12">
    <div class="card-body" data-id="${coinObj.id}" data-name="${coinObj.name}" data-symbol="${coinObj.symbol}">
        <div class="d-flex flex-row justify-content-between">
            <h5 class="card-title">${coinObj.symbol}</h5>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="select-${coinObj.symbol}">
            </div>
        </div>
        <p class="card-text">${coinObj.name}</p>
          <a class="btn btn-primary" data-bs-toggle="collapse" href="#data-${coinObj.symbol}" role="button"
              aria-expanded="false" aria-controls="data-${coinObj.symbol}" data-coin-id="${coinObj.id}" onclick="getMoreInfo(event)">
              More Info
          </a>
          <div class="collapse" id="data-${coinObj.symbol}">
              <div class="card card-body mt-2" id="info-${coinObj.id}">
                  {moreInfoData}
              </div>
          </div>
      </div>
  </div>`;
}
