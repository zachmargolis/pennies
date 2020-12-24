import { axisBottom, axisTop, axisRight } from 'd3-axis'
import { csv } from 'd3-request'
import { extent, max, descending } from 'd3-array'
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force'
import { nest } from 'd3-collection'
import { path } from 'd3-path'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleBand, scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale'
import { schemeSet1 } from 'd3-scale-chromatic'
import { creator, select, selection } from 'd3-selection'
import { timeFormat } from 'd3-time-format'
import { format } from 'd3-format'

import Prerender from 'd3-pre'

const d3 = {
  axisBottom,
  axisTop,
  axisRight,
  creator,
  csv,
  curveMonotoneX,
  descending,
  extent,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  format,
  line,
  max,
  nest,
  path,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  scaleTime,
  schemeSet1,
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
    .key(d => d.timestamp.getFullYear())
    .entries(csv);

  const byPersonByYear = d3.nest()
    .key(d => d.person)
    .key(d => d.timestamp.getFullYear())
    .entries(csv);

  prerender.start();

  drawYearSelector(byYear);
  drawYearOverYear(byYear, byPersonByYear);

  const urlYear = () => {
    let match = document.location.search.match(/year=([^&]+)/);
    return match && match[1];
  }

  const currentYear = urlYear() || d3.max(byYear, d => d.key);
  const currentYearData = byYear.find(d => d.key == currentYear);

  drawYear(currentYearData);
  if (!window.navigator.userAgent.includes('Electron')) {
    // HACK to fix blank axis on first render after prerender
    setTimeout(() => {
      drawYearOverYear(byYear, byPersonByYear)
      drawYear(currentYearData)
    }, 0);
  }

  prerender.stop();

  window.onpopstate = (event) => {
    const year = new URL(window.location).searchParams.get('year') || currentYear;
    drawYear(byYear.find(d => d.key == year));
  }
});

function drawYearSelector(byYear) {
  const selectors = d3.select('.year-selector')
    .selectAll('li')
      .data(byYear, (d, i) => i)

  selectors.exit().remove()

  const as = selectors
    .enter()
      .append('li')
    .merge(selectors)
      .append('a')
        .attr('class', 'year-link')
        .text(d => d.key)
        .attr('href', d => `?year=${d.key}`)

  as.merge(selectors.selectAll('li a'))
    .on('click', d => {
      window.event.preventDefault();
      drawYear(d);

      const url = new URL(window.location);
      url.searchParams.set('year', d.key);
      window.history.pushState({}, '', url);

      return false;
    });
}

function drawYearOverYear(byYear, byPersonByYear) {
  const height = 200;
  const padding = {
    top: 5,
    right: 30,
    bottom: 30,
    left: 40,
  }

  const axisMargin = 5;

  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  let svg = d3.select('.year-over-year')
    .selectAll('svg')
      .data([1])

  svg = svg.enter()
    .append('svg')
    .merge(svg)
      .attr('width', width)
      .attr('height', height)

  const plainFormat = d3.format('');

  const x = d3.scaleLinear()
    .domain(d3.extent(byYear, d => +d.key))
    .range([0, widthToFit])

  const xAxis = d3.axisBottom(x)
    .tickFormat(plainFormat)
    .ticks(byYear.length)

  const xAxisElem = svg.selectAll('g.x.axis')
    .data([1])

  xAxisElem.enter()
    .append('g')
    .attr('class', 'x axis')
    .merge(xAxisElem)
      .attr('transform', translate(padding.left, heightToFit + padding.top + axisMargin))
      .call(xAxis)

  const mostCoins = d3.max(byPersonByYear, person => d3.max(person.values, d => d.values.length))

  const y = d3.scaleLinear()
    .domain([0, mostCoins])
    .range([heightToFit, 0])

  const yAxis = d3.axisRight(y)
    .tickFormat(plainFormat)

  const yAxisElem = svg.selectAll('g.y.axis')
    .data([1])

  yAxisElem.enter()
    .append('g')
    .attr('class', 'y axis')
    .merge(yAxisElem)
      .attr('transform', translate(padding.left + widthToFit + axisMargin, padding.top))
      .call(yAxis)

  let chart = svg.selectAll('.chart')
    .data([1])

  chart = chart
    .enter()
      .append('g')
        .attr('class', 'chart')
        .attr('transform', translate(padding.left, padding.top))
    .merge(chart)

  let people = chart.selectAll('.person')
    .data(byPersonByYear, (d, i) => d && d.key);

  people = people.enter()
    .append('g')
      .attr('class', 'person')
    .merge(people)

  const line = d3.line()
    .x(d => x(+d.key))
    .y(d => y(d.values.length))
    .curve(d3.curveMonotoneX);

  const lines = people.selectAll('.line')
    .data(d => [d], (d, i) => d && d.key)

  lines.enter()
    .append('path')
      .attr('class', 'line')
    .merge(lines)
      .datum(d => d.values)
      .attr('stroke', d => color(d[0].values[0].person))
      .attr('d', d => line(d))

  const dots = people.selectAll('.dot')
    .data(d => d.values, (d, i) => i)

  dots.enter()
    .append('circle')
      .attr('class', 'dot')
    .merge(dots)
      .attr('cx', d => x(+d.key))
      .attr('cy', d => y(d.values.length))
      .attr('r', '3')
      .attr('fill', d => color(d.values[0].person))

  let startLabels = people.selectAll('.start-label')
    .data(d => [d], (d, i) => i)

  startLabels.enter()
    .append('text')
      .attr('class', 'start-label')
    .merge(startLabels)
      .text(d => d.key)
      .attr('transform', d => {
        let firstItem = d.values[0];
        let extraSpacing = (d.key == 'Mom') ? 5 : 0;
        return translate(
          x(+firstItem.key) - axisMargin,
          y(firstItem.values.length) + extraSpacing
        );
      })
}

function drawYear(keyValue) {
  const year = keyValue.key;

  d3.select('.year-selector')
    .selectAll('.year-link')
      .classed('active', d => (d && String(d.key) == String(year)))

  const data = keyValue.values;
  const timeExtent = d3.extent(data, d => d.timestamp);

  const byPerson = d3.nest()
    .key(d => d.person)
    .entries(data);

  const byCoinByPerson = d3.nest()
    .key(coin)
    .key(d => d.person)
    .entries(data);

  const byPersonByWeekday = d3.nest()
    .key(d => d.person)
    .key(d => d.timestamp.getDay())
    .entries(data);

  drawTable(byPerson);

  drawTimelines(byPerson, timeExtent);

  drawLegend(byCoinByPerson);

  drawByWeekday(byPersonByWeekday);

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
        .append('span')
          .style('color', d => d && color(d.key))
          .text(' ● ')

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

const width = 510;
const color = d3.scaleOrdinal(d3.schemeSet1)

function drawTimelines(byPerson, timeExtent) {
  const padding = { top: 20, left: 15, right: 15, bottom: 20 };
  const rowHeight = 90;
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

  rows.each(d => {
    const simulation = d3.forceSimulation(d.values)
      .force('x', d3.forceX(d => x(d.timestamp)).strength(1))
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

  var labels = rows.selectAll('text.name')
    .data(d => [d.key], d => d)

  const enterLabels = labels.enter()
    .append('text')
      .attr('class', 'name')

  labels.merge(enterLabels)
    .text(d => d)
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

function drawByWeekday(byPersonByWeekday) {
  const padding = {
    top: 5,
    right: 30,
    bottom: 10,
    left: 40,
  }

  const axisMargin = 5;
  const rowHeight = 70;
  const rowSpacing = 20;
  const widthToFit = width - (padding.left + padding.right);
  const height = (byPersonByWeekday.length * (rowHeight + rowSpacing)) + (padding.top + padding.bottom);

  const mostCoins = d3.max(byPersonByWeekday, person => d3.max(person.values, d => d.values.length))

  const x = d3.scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range([0, widthToFit])
    .round(true)
    .paddingInner(0.1)

  const weekdayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']
  const xAxis = d3.axisBottom(x)
    .tickFormat((d) => weekdayLabels[d])

  const y = d3.scaleLinear()
    .domain([0, mostCoins])
    .range([rowHeight, 0])

  const yAxis = d3.axisRight(y)
    .ticks(5)

  let svg = d3.select('.by-weekday')
    .selectAll('svg')
      .data([1])

  svg.enter()
    .append('svg')
    .merge(svg)
      .attr('width', width)
      .attr('height', height)

  let charts = svg.selectAll('.chart')
    .data(byPersonByWeekday, (d, i) => d.key)

  charts = charts.enter()
    .append('g')
      .attr('class', 'chart')
    .merge(charts)
      .attr('transform', (d, i) => translate(padding.left, padding.top + ((rowHeight + rowSpacing) * i)))

  const xAxisElems = charts.selectAll('g.x.axis')
    .data([1])

  xAxisElems.enter()
    .append('g')
      .attr('class', 'x axis')
    .merge(xAxisElems)
      .attr('transform', translate(0, rowHeight + axisMargin))
      .call(xAxis)

  const yAxisElems = charts.selectAll('g.y.axis')
    .data([1])

  yAxisElems.enter()
    .append('g')
      .attr('class', 'y axis')
    .merge(yAxisElems)
      .call(yAxis)
      .attr('transform', translate(widthToFit + axisMargin, 0))

  let bars = charts.selectAll('.bar')
    .data(d => d.values, (d, i) => i)

  bars = bars.enter()
    .append('rect')
      .attr('class', 'bar')
    .merge(bars)
      .attr('transform', d => translate(x(+d.key), y(d.values.length)))
      .attr('width', x.bandwidth())
      .attr('height', d => rowHeight - y(d.values.length))
      .attr('fill', d => color(d.values[0].person))

  let startLabels = charts.selectAll('.start-label')
    .data(d => [d.key], (d, i) => d.key)

  startLabels.enter()
    .append('text')
      .attr('class', 'start-label')
    .merge(startLabels)
      .text(d => d)
      .attr('transform', translate(-axisMargin, rowHeight))
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
      .data(['Person', ...coins], (d, i) => d)

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