import { axisTop } from 'd3-axis'
import { csv } from 'd3-request'
import { extent } from 'd3-array'
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force'
import { nest } from 'd3-collection'
import { scaleTime } from 'd3-scale'
import { select } from 'd3-selection'

const d3 = {
  axisTop,
  csv,
  extent,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  nest,
  scaleTime,
  select,
};

d3.csv('pennies.csv', (err, csv) => {
  csv.forEach(row => {
    row.timestamp = new Date(+row.timestamp);
    row.denomination = +row.denomination;
  })

  const timeExtent = d3.extent(csv, d => d.timestamp);

  const byPerson = d3.nest()
    .key((d) => d.person)
    .entries(csv);

  drawTable(byPerson);

  drawTimelines(byPerson, timeExtent);

  const byPersonByCoin = d3.nest()
    .key((d) => d.person)
    .key(coin)
    .entries(csv);

  drawDistributions(byPersonByCoin);
});

function round(num, precision = 2) {
  return num.toFixed(precision);
}

function drawTable(byPerson) {
  const table = d3.select('.by-person')
    .append('table');

  table.append('thead')
    .selectAll('th')
      .data(['Person', 'Total Coins', 'Total Value'])
      .enter()
        .append('th')
          .text(d => d)

  const tr = table.append('tbody')
    .selectAll('tr')
      .data(byPerson)
      .enter()
        .append('tr');

  tr.append('th')
    .text(d => d.key)

  tr.append('td')
    .text(d => d.values.length)

  tr.append('td')
    .text(d => {
      var sumByCurrency = {};
      d.values.forEach(d => {
        sumByCurrency[d.currency] = sumByCurrency[d.currency] || 0;
        sumByCurrency[d.currency] += d.denomination;
      });

      return Object.keys(sumByCurrency)
        .map(currency => `${round(sumByCurrency[currency])} ${currency}`)
        .join("\n");
    })
}

const padding = { top: 20, left: 10, right: 10, bottom: 10 };
const width = 520;

function drawTimelines(byPerson, timeExtent) {
  const rowHeight = 75;
  const axisHeight = 30;

  const x = d3.scaleTime()
    .domain(timeExtent)
    .range([0, width]);

  const svg = d3.select('.by-time')
    .append('svg')
      .attr('width', width + padding.left + padding.right)
      .attr('height', axisHeight + (byPerson.length * rowHeight) + padding.top + padding.bottom);

  const xAxis = d3.axisTop(x);

  svg.selectAll('g.x.axis')
    .data([1])
      .enter()
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', translate(padding.left, padding.top))
        .call(xAxis)

  var rows = svg.selectAll('g.row')
    .data(byPerson, d => d.key)

  const enterRows = rows
    .enter()
      .append('g')
        .attr('class', 'row')
        .attr('transform', (d, i) => translate(padding.left, padding.top + axisHeight + (i * rowHeight)))

  enterRows
    .append('text')
      .attr('class', 'name')
      .text(d => d.key)

  rows = rows.merge(enterRows)

  rows.each(d => {
    const simulation = d3.forceSimulation(d.values)
      .force('x', d3.forceX(function(d) { return x(d.timestamp); }).strength(1))
      .force('y', d3.forceY(rowHeight / 2))
      .force('collide', d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();
  });

  rows.selectAll('g.coin')
    .data(d => d.values)
    .enter()
      .append('g')
        .attr('class', 'coin')
        .attr('transform', d => translate(d.x, d.y))
        .each(appendCoin)

}

function coin(d) {
  return `${d.denomination}${d.currency}`;
}

const mmToInch = 1 / 10 / 2.54;

// r (radii) values are diameters in inches
// https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications
// https://www.fleur-de-coin.com/eurocoins/specifications
// https://en.wikipedia.org/wiki/Coins_of_the_pound_sterling#Specifications
const coinMapping = {
  '0.01USD': {
    name: 'Penny',
    r: 0.75,
    color: 'brown',
  },
  '0.05USD': {
    name: 'Nickel',
    r: 0.835,
    color: 'gray',
  },
  '0.1USD': {
    name: 'Dime',
    r: 0.705,
    color: 'gray',
  },
  '0.25USD': {
    name: 'Quarter',
    r: 0.955,
    color: 'gray',
  },
  '1USD': {
    name: 'Dollar Bill',
    square: true,
    color: 'green',
    ratio: 7/3,
  },
  '0.01EUR': {
    name: 'Euro Penny',
    r: 16.25 * mmToInch,
    color: 'brown',
  },
  '0.01GBP': {
    name: 'UK Penny',
    r: 20.3 * mmToInch,
    color: 'brown',
  },
  '0.02GBP': {
    name: 'Two Pence',
    r: 25.9 * mmToInch,
    color: 'brown',
  },
  '0.2GBP': {
    name: 'Twenty Pence',
    r: 21.4 * mmToInch,
    color: 'silver',
  }
};

const itemSize = 4;

function appendCoin(d) {
  const g = d3.select(this);

  const coinData = coinMapping[coin(d)];

  var elem;

  if (coinData.square) {
    elem = g.append('rect')
      .attr('x', -0.5 * coinData.ratio * itemSize)
      .attr('y', -0.5 * itemSize)
      .attr('width', coinData.ratio * itemSize)
      .attr('height', itemSize)
  } else {
    elem = g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', itemSize * coinData.r)
  }

  elem.style('fill', coinData.color || 'black')
    .append('title')
      .text(coinData.name)
}

function drawDistributions(byPersonByCoin) {
}

function translate(x, y) {
  return `translate(${x},${y})`;
}