var randomColorComponent = () => Math.floor(Math.random() * 255)


var randomColor = () => 'rgb(' + randomColorComponent() + ',' +
  randomColorComponent() + ',' + randomColorComponent() + ')'


$.getJSON('analyse.json', data => $(document).ready(() =>
  new Chart(myChart, {
    type: 'line',
    data: {
      labels: new Array(data.length),
      datasets: data.data.map(([sample, mean], index) =>
        ({
          label: index,
          borderColor: randomColor(),
          borderWidth: Math.log2(sample) + 1,
          fill: false,
          data: mean, })), }, })))
