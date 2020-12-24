import { axisBottom, axisTop } from 'd3-axis'
import { csv } from 'd3-request'
import { extent, max } from 'd3-array'
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force'
import { nest } from 'd3-collection'
import { path } from 'd3-path'
import { scaleBand, scaleLinear, scaleOrdinal, scaleTime, schemeCategory20 } from 'd3-scale'
import { creator, select, selection } from 'd3-selection'
import { timeFormat } from 'd3-time-format'

import Prerender from 'd3-pre'

const d3 = {
  axisBottom,
  axisTop,
  creator,
  csv,
  extent,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  max,
  nest,
  path,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  scaleTime,
  schemeCategory20,
  select,
  selection,
  timeFormat,
  version: '4', // needed to instruct d3-pre we're on version 4+
};

const prerender = Prerender(d3);

d3.csv('pennies.csv', (err, csv) => {
  csv.forEach(row => {
    row.timestamp = new Date(+row.timestamp);
    row.denomination = +row.denomination;
  })

  const byYear = d3.nest()
    .key((d) => d.timestamp.getFullYear())
    .entries(csv);

  prerender.start();
  drawYearSelector(byYear);

  const mostRecentYearData = byYear.find(d => d.key == d3.max(byYear, d => d.key));

  drawYear(mostRecentYearData);
  if (!window.navigator.userAgent.includes('Electron')) {
    // HACK to fix blank axis on first render after prerender
    setTimeout(() => drawYear(mostRecentYearData), 0);
  }

  prerender.stop();
});

function drawYearSelector(byYear) {
  const selectors = d3.select('.year-selector')
    .selectAll('li')
      .data(byYear, (d, i) => i)

  selectors.exit().remove()

  const as = selectors
      .enter()
        .append('li')
          .append('a')
            .attr('class', 'year-link')
            .text(d => d.key)
            .attr('href', '#')

  as.merge(selectors.selectAll('li a'))
    .on('click', d => {
      drawYear(d);
      return false;
    });
}

function drawYear(keyValue) {
  const year = keyValue.key;

  d3.select('.year-selector')
    .selectAll('.year-link')
      .classed('active', d => (d && d.key == year))

  const data = keyValue.values;
  const timeExtent = d3.extent(data, d => d.timestamp);

  const byPerson = d3.nest()
    .key((d) => d.person)
    .entries(data);

  const byCoinByPerson = d3.nest()
    .key(coin)
    .key((d) => d.person)
    .entries(data);

  drawTable(byPerson);

  drawTimelines(byPerson, timeExtent);

  drawLegend(byCoinByPerson);

  drawByCoinTable(byCoinByPerson, byPerson);
}

function round(num, precision = 2) {
  return num.toFixed(precision);
}

function drawTable(byPerson) {
  const table = d3.select('.by-person')
    .selectAll('table')
      .data([1])

  const enterTable = table.enter()
    .append('table')
      .style('width', '100%')

  enterTable.append('thead')
    .selectAll('th')
      .data(['Person', 'Total Coins', 'Total Value'])
      .enter()
        .append('th')
          .text(d => d)

  const tbody = table.merge(enterTable)
    .selectAll('tbody')
      .data([1])

  const tr = tbody.enter()
    .append('tbody')
    .merge(tbody)
    .selectAll('tr')
      .data(byPerson, d => d && d.key)

  tr.exit().remove();

  const enterTr = tr.enter().append('tr');

  const th = tr.merge(enterTr)
    .selectAll('th')
      .data(d => [d], d => d && d.key);

  th.exit().remove()

  th.enter()
    .append('th')
    .merge(th)
      .text(d => d && d.key)

  const td = tr.merge(enterTr)
    .selectAll('td')
      .data(d => {
        const numCoins = d.values.length;

        var sumByCurrency = {};
        d.values.forEach(d => {
          sumByCurrency[d.currency] = sumByCurrency[d.currency] || 0;
          sumByCurrency[d.currency] += d.denomination;
        });

        const byCurrencyText =  Object.keys(sumByCurrency)
          .map(currency => `${round(sumByCurrency[currency])} ${currency}`)
          .join("\n");

        return [numCoins, byCurrencyText]
      }, (d, i) => i)

  td.exit().remove();

  td.enter()
    .append('td')
    .merge(td)
      .text(d => d)
}

const width = 520;

function drawTimelines(byPerson, timeExtent) {
  const padding = { top: 20, left: 10, right: 10, bottom: 20 };
  const rowHeight = 75;
  const axisHeight = 30;

  const x = d3.scaleTime()
    .domain(timeExtent)
    .range([0, width]);

  const xAxis = d3.axisTop(x)
    .tickFormat(d3.timeFormat('%b'));

  var svg = d3.select('.by-time')
    .selectAll('svg')
      .data([1])

  svg = svg.enter()
    .append('svg')
    .merge(svg)
      .attr('width', width + padding.left + padding.right)
      .attr('height', axisHeight + (byPerson.length * rowHeight) + padding.top + padding.bottom)

  const xAxisElem = svg.selectAll('g.x.axis')
    .data([1])

  xAxisElem.enter()
    .append('g')
    .attr('class', 'x axis')
    .merge(xAxisElem)
      .attr('transform', translate(padding.left, padding.top))
      .call(xAxis)

  var rows = svg.selectAll('g.row')
    .data(byPerson, d => d && d.key)

  const enterRows = rows
    .enter()
      .append('g')
        .attr('class', 'row')
        .attr('transform', (d, i) => translate(padding.left, padding.top + axisHeight + (i * rowHeight)))


  rows = rows.merge(enterRows)

  var labels = rows.selectAll('text.name')
    .data(d => [d.key], d => d)

  const enterLabels = labels.enter()
    .append('text')
      .attr('class', 'name')

  labels.merge(enterLabels)
    .text(d => d)

  rows.each(d => {
    const simulation = d3.forceSimulation(d.values)
      .force('x', d3.forceX(function(d) { return x(d.timestamp); }).strength(1))
      .force('y', d3.forceY(rowHeight / 2))
      .force('collide', d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();
  });

  const coins = rows.selectAll('g.coin')
    .data(d => d.values, (d, i) => i)

  coins.exit().remove()

  coins
    .enter()
      .append('g')
        .attr('class', 'coin')
    .merge(coins)
      .attr('transform', d => translate(d.x, d.y))
      .each(appendCoin)
}

function coin(d) {
  return `${d.denomination}${d.currency}`;
}

function drawLegend(byCoinByPerson) {
  const coins = byCoinByPerson.map(x => x.key).sort();

  let legendItems = d3.select('.coin-legend')
    .selectAll('li')
      .data(coins, d => d)

  legendItems.exit().remove()

  let enterItems = legendItems.enter()
    .append('li')

  enterItems.append('svg')
    .attr('height', itemSize * 2)
    .attr('width', itemSize * 2)
    .append('g')
      .attr('transform', translate(itemSize, itemSize))
      .each(appendCoin)

  enterItems.append('span')
    .attr('class', 'small-name')
    .text(d => coinMapping[d] && coinMapping[d].name)
}

const mmToInch = 1 / 10 / 2.54;

// diameter values are in inches
// https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications
// https://www.fleur-de-coin.com/eurocoins/specifications
// https://en.wikipedia.org/wiki/Coins_of_the_pound_sterling#Specifications
// https://en.wikipedia.org/wiki/Penny_(Canadian_coin)
const coinMapping = {
  '0.01USD': {
    name: 'Penny',
    diameter: 0.75,
    color: 'burlywood',
  },
  '0.05USD': {
    name: 'Nickel',
    diameter: 0.835,
    color: 'gray',
  },
  '0.1USD': {
    name: 'Dime',
    diameter: 0.705,
    color: 'gray',
  },
  '0.25USD': {
    name: 'Quarter',
    diameter: 0.955,
    color: 'gray',
  },
  '1USD': {
    name: 'Dollar Bill',
    square: true,
    color: 'green',
    ratio: 7/3,
  },
  '20USD': {
    name: '20 Dollar Bill',
    square: true,
    color: 'green',
    ratio: 7/3,
  },
  '0.01EUR': {
    name: 'Euro Penny',
    diameter: 16.25 * mmToInch,
    color: 'brown',
  },
  '0.05EUR': {
    name: '5 Euro Cent',
    diameter: 21.25 * mmToInch,
    color: 'red',
  },
  '0.5EUR': {
    name: 'Half Euro',
    diameter: 24.25 * mmToInch,
    color: 'brown',
  },
  '0.1EUR': {
    name: 'Euro Dime',
    diameter: 19.75 * mmToInch,
    color: 'silver',
  },
  '1EUR': {
    name: 'One Euro',
    diameter: 23.25 * mmToInch,
    color: 'silver',
  },
  '0.01GBP': {
    name: 'One Pence',
    diameter: 20.3 * mmToInch,
    color: 'brown',
  },
  '0.02GBP': {
    name: 'Two Pence',
    diameter: 25.9 * mmToInch,
    color: 'brown',
  },
  '0.2GBP': {
    name: 'Twenty Pence',
    diameter: 21.4 * mmToInch,
    nSides: 7,
    color: 'silver',
  },
  '0.01CAD': {
    name: 'Canadian Penny',
    diameter: 19.05 * mmToInch,
    color: 'brown'
  },
  '0.25TRY': {
    name: 'Turkish Quarter',
    diameter: 20.5 * mmToInch,
    color: 'brown'
  },
  '0.1NZD': {
    name: 'NZ Dime',
    diameter: 20.5 * mmToInch,
    color: 'silver'
  }
};

const itemSize = 4;

function appendCoin(d) {
  Array.from(this.childNodes).forEach(e => e.remove());

  const g = d3.select(this);

  const key = (typeof d == 'object') ? coin(d) : d;
  const coinData = coinMapping[key];

  if (!coinData) {
    console.error(`could not find coin for ${key}`);
    return;
  }

  var elem;

  if (coinData.square) {
    elem = g.append('rect')
      .attr('x', -0.5 * coinData.ratio * itemSize)
      .attr('y', -0.5 * itemSize)
      .attr('width', coinData.ratio * itemSize)
      .attr('height', itemSize)
  } else if (coinData.nSides) {
    elem = g.append('path')

    if (!coinData.cachedPath) {
      coinData.cachedPath = polygonPath(coinData.nSides, itemSize * coinData.diameter)
    }

    elem.attr('d', coinData.cachedPath)
  } else {
    elem = g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', itemSize * coinData.diameter)
  }

  elem.style('fill', coinData.color || 'black')
    .append('title')
      .text(coinData.name)
}

function polygonPath(nSides, radius) {
  var path = d3.path()

  var angle = 2 * Math.PI / nSides;
  var offset = Math.PI / 2;

  for (var i = 0; i < nSides; i++) {
    var theta = offset + (-i * angle);
    var coords = [radius * Math.cos(theta), -radius * Math.sin(theta)];

    if (i == 0) {
      path.moveTo(...coords);
    } else {
      path.lineTo(...coords);
    }
  }

  path.closePath();

  return path.toString();
}

function drawByCoinTable(byCoinByPerson, byPerson) {
  const coins = byCoinByPerson.map(d => d.key);
  const people = byPerson.map(d => d.key);

  const tableData = people
    .map(person => {
      const coinCoints = coins.map(coin => {
        const personCoins = (byCoinByPerson.find(d => d.key == coin).values || [])
          .find(d => d.key == person)
        return (personCoins && personCoins.values && personCoins.values.length) || 0;
      });

      return [person, ...coinCoints]
    });

  const table = d3.select('.by-coin-table')
    .selectAll('table')
      .data([1])

  const enterTable = table.enter()
    .append('table')
      .style('min-width', '100%')

  const th = enterTable.append('thead')
    .merge(table.select('thead'))
    .selectAll('th')
      .data(['Person', ...coins], (d, i) => i)

  th.exit().remove();

  const nbsp = (str) => str.split(' ').join(String.fromCharCode(160)) // &nbsp;

  th.enter()
    .append('th')
    .merge(th)
      .text(d => nbsp((d in coinMapping) ? coinMapping[d].name : d))
      .classed('tiny-header', (d, i) => i != 0 && coins.length > 5)
      .classed('light-header', (d, i) => i != 0 && coins.length <= 5)

  const tbody = table.merge(enterTable)
    .selectAll('tbody')
      .data([1])

  const tr = tbody.enter()
    .append('tbody')
    .merge(tbody)
    .selectAll('tr')
      .data(tableData, (d, i) => i)

  tr.exit().remove();

  const enterTr = tr.enter()
    .append('tr')

  const rowTh = tr.merge(enterTr)
    .selectAll('th')
      .data(d => [d[0]], (d, i) => i);

  rowTh.exit().remove()

  rowTh.enter()
    .append('th')
    .merge(th)
      .text(d => d)

  const td = enterTr
    .merge(tr)
      .selectAll('td')
        .data(d => d.slice(1))

   td.exit().remove();

  td.enter()
    .append('td')
  .merge(td)
    .text(d => d)
}

function translate(x, y) {
  return `translate(${x},${y})`;
}