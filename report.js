// --- CHART ---

(() => {
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
            console.log(reportChart.data.datasets[i].data.length);
            if (reportChart.data.datasets[i].data.length < LABELS_NUMBER) {
              reportChart.data.datasets[i].data.push(element[1].USD);
            } else {
              reportChart.data.datasets[i].data.push(element[1].USD);
              reportChart.data.datasets[i].data.shift();
            }
          });
          console.log(reportChart.data.datasets[0].data.length);
          if (reportChart.data.datasets[0].data.length >= LABELS_NUMBER) {
            labels.push(
              new Date(new Date().getTime() + 4000).toLocaleTimeString(
                "en-US",
                {
                  hour12: false,
                }
              )
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
})();
