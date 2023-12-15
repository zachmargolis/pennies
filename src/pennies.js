import { axisBottom, axisTop, axisRight } from 'd3-axis'
import { ascending, extent, max, descending } from 'd3-array'
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force'
import { nest } from 'd3-collection'
import { path } from 'd3-path'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleBand, scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale'
import { schemeSet1 } from 'd3-scale-chromatic'
import { creator, select, selection } from 'd3-selection'
import { timeFormat } from 'd3-time-format'
import { format } from 'd3-format'

import { COIN_MAPPING, coin, polygonPath, round } from './coins'

const d3 = {
  axisBottom,
  axisTop,
  axisRight,
  ascending,
  creator,
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
};

/**
 * @typedef {import('./data').Row} Row
 */

/**
 * @typedef Nest
 * @prop {string} key
 * @prop {any} values
 * @prop {undefined} value
 */

/**
 * @param {Row[]} csv
 */
export function renderData(csv) {
  const byYear = d3.nest()
    .key(d => d.timestamp.getFullYear())
    .entries(csv);

  drawYearSelector(byYear);

  const urlYear = () => {
    let match = document.location.search.match(/year=([^&]+)/);
    return match && match[1];
  }

  const currentYear = urlYear() || d3.max(byYear, d => d.key);
  const currentYearData = byYear.find(d => d.key == currentYear) || byYear[byYear.length - 1];

  drawYear(currentYearData);

  window.onpopstate = () => {
    const year = new URL(String(window.location)).searchParams.get('year') || currentYear;
    drawYear(byYear.find(d => d.key == year) || byYear[byYear.length - 1]);
  }
};

/**
 * @param {Nest[]} byYear
 */
function drawYearSelector(byYear) {
  const selectors = d3.select('.year-selector')
    .selectAll('li')
      .data(byYear, (_d, i) => i)

  selectors.exit().remove()

  const as = selectors
    .enter()
      .append('li')
    .merge(/** @type any */(selectors))
      .append('a')
        .attr('class', 'year-link')
        .text(d => d.key)
        .attr('href', d => `?year=${d.key}`)

  as.merge(selectors.selectAll('li a'))
    .on('click', d => {
      // @ts-ignore
      window.event.preventDefault();
      drawYear(d);

      const url = new URL(String(window.location));
      url.searchParams.set('year', d.key);
      window.history.pushState({}, '', url);

      return false;
    });
}

const orderedNames = [
  'Zach',
  'Dad',
  'Mom',
  'Noah'
];

/**
 * @param {string} nameA
 * @param {string} nameB
 * @return {number}
 */
function sortByName(nameA, nameB) {
  return d3.ascending(orderedNames.indexOf(nameA), orderedNames.indexOf(nameB));
}

/**
 * @param {Nest} keyValue
 */
function drawYear(keyValue) {
  const year = keyValue.key;

  d3.select('.year-selector')
    .selectAll('.year-link')
      .classed('active', d => (d && String(d.key) == String(year)))

  const data = keyValue.values;
  const /** @type [Date, Date] */ timeExtent = /** @type any */(d3.extent(data, d => d.timestamp));

  const byPerson = d3.nest()
    .key(d => d.person)
    .sortKeys(sortByName)
    .entries(data);

  const byCoinByPerson = d3.nest()
    .key(coin)
    .key(d => d.person)
    .sortKeys(sortByName)
    .entries(data);

  const byPersonByWeekday = d3.nest()
    .key(d => d.person)
    .sortKeys(sortByName)
    .key(d => d.timestamp.getDay())
    .entries(data);

  drawTimelines(byPerson, timeExtent);

  drawLegend(byCoinByPerson);

  drawByWeekday(byPersonByWeekday);

  drawByCoinTable(byCoinByPerson, byPerson);
}

const width = 510;
const color = d3.scaleOrdinal(d3.schemeSet1)

/**
 * @param {Nest[]} byPerson
 * @param {Date[]} timeExtent
 */
function drawTimelines(byPerson, timeExtent) {
  const padding = { top: 20, left: 15, right: 15, bottom: 20 };
  const rowHeight = 90;
  const axisHeight = 30;

  const x = d3.scaleTime()
    .domain(timeExtent)
    .range([0, width]);

  const xAxis = d3.axisTop(x)
    .tickFormat(/** @type any */(d3.timeFormat('%b')));

  var svgSelect = d3.select('.by-time')
    .selectAll('svg')
      .data([1])

  var svg = svgSelect.enter()
    .append('svg')
    .merge(/** @type any */(svgSelect))
      .attr('width', width + padding.left + padding.right)
      .attr('height', axisHeight + (byPerson.length * rowHeight) + padding.top + padding.bottom)

  const xAxisElem = svg.selectAll('g.x.axis')
    .data([1])

  xAxisElem.enter()
    .append('g')
    .attr('class', 'x axis')
    .merge(/** @type any */(xAxisElem))
      .attr('transform', translate(padding.left, padding.top))
      .call(xAxis)

  var rows = svg.selectAll('g.row')
    .data(byPerson, /** @type Nest */ d => d && d.key)

  const enterRows = rows
    .enter()
      .append('g')
        .attr('class', 'row')
        .attr('transform', (/** @type any */ _d, /** @type number */ i) => translate(padding.left, padding.top + axisHeight + (i * rowHeight)))


  rows = rows.merge(/** @type any */(enterRows))

  rows.each(d => {
    const simulation = d3.forceSimulation(d.values)
      .force('x', d3.forceX(d => x((/** @type Row */ (d)).timestamp)).strength(1))
      .force('y', d3.forceY(rowHeight / 2))
      .force('collide', d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();
  });

  const coins = rows.selectAll('g.coin')
    .data(/** @type Nest */ d => d.values, (/** @type any */ _d, i) => i)

  coins.exit().remove()

  coins
    .enter()
      .append('g')
        .attr('class', 'coin')
    .merge(/** @type any */(coins))
      .attr('transform', d => translate(d.x, d.y))
      .each(appendCoin)

  var labels = rows.selectAll('text.name')
    .data(d => [d.key], d => d)

  const enterLabels = labels.enter()
    .append('text')
      .attr('class', 'name')

  labels.merge(/** @type any */(enterLabels))
    .text(d => d)
}

/**
 * @param {Nest[]} byCoinByPerson
 */
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
    .text(d => COIN_MAPPING[d] && COIN_MAPPING[d].name)
}

const itemSize = 4;

/**
 * @param {Row | string} d
 * @returns
 * @this {SVGElement}
 */
function appendCoin(d) {
  Array.from(this.childNodes).forEach(e => e.remove());

  const g = d3.select(this);

  const key = (typeof d == 'object') ? coin(d) : d;
  const coinData = COIN_MAPPING[key];

  if (!coinData) {
    console.error(`could not find coin for ${key}`);
    return;
  }

  var elem;

  if ('square' in coinData) {
    elem = g.append('rect')
      .attr('x', -0.5 * coinData.ratio * itemSize)
      .attr('y', -0.5 * itemSize)
      .attr('width', coinData.ratio * itemSize)
      .attr('height', itemSize)
  } else if ('nSides' in coinData) {
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
  elem.append('title')
      .text(coinData.name)
}

/**
 * @param {Nest[]} byPersonByWeekday
 */
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
    .domain(/** @type any */([0, 1, 2, 3, 4, 5, 6]))
    .range([0, widthToFit])
    .round(true)
    .paddingInner(0.1)

  const weekdayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']
  const xAxis = d3.axisBottom(x)
    .tickFormat((d) => weekdayLabels[Number(d)])

  const y = d3.scaleLinear()
    .domain([0, Number(mostCoins)])
    .range([rowHeight, 0])

  const yAxis = d3.axisRight(y)
    .ticks(5)

  let svg = d3.select('.by-weekday')
    .selectAll('svg')
      .data([1])

  svg.enter()
    .append('svg')
    .merge(/** @type any */(svg))
      .attr('width', width)
      .attr('height', height)

  let chartsSelect = svg.selectAll('.chart')
    .data(byPersonByWeekday, (d) => d.key)

  let charts = chartsSelect.enter()
    .append('g')
      .attr('class', 'chart')
    .merge(/** @type any */ (chartsSelect))
      .attr('transform', (_d, i) => translate(padding.left, padding.top + ((rowHeight + rowSpacing) * i)))

  const xAxisElems = charts.selectAll('g.x.axis')
    .data([1])

  xAxisElems.enter()
    .append('g')
      .attr('class', 'x axis')
    .merge(/** @type any */(xAxisElems))
      .attr('transform', translate(0, rowHeight + axisMargin))
      .call(xAxis)

  const yAxisElems = charts.selectAll('g.y.axis')
    .data([1])

  yAxisElems.enter()
    .append('g')
      .attr('class', 'y axis')
    .merge(/** @type any */(yAxisElems))
      .call(yAxis)
      .attr('transform', translate(widthToFit + axisMargin, 0))

  let bars = charts.selectAll('.bar')
    .data(d => d.values, (_d, i) => i)

  bars.enter()
    .append('rect')
      .attr('class', 'bar')
    .merge(/** @type any */(bars))
      .attr('transform', (/** @type Nest */ d) => translate(x(d.key) || 0, y(d.values.length)))
      .attr('width', x.bandwidth())
      .attr('height', d => rowHeight - y(d.values.length))
      .attr('fill', d => color(d.values[0].person))

  let startLabels = charts.selectAll('.start-label')
    .data(d => [d.key], (d) => d.key)

  startLabels.enter()
    .append('text')
      .attr('class', 'start-label')
    .merge(/** @type any **/(startLabels))
      .text(d => d)
      .attr('transform', translate(-axisMargin, rowHeight))
}

/**
 * @param {Nest[]} byCoinByPerson
 * @param {Nest[]} byPerson
 */
function drawByCoinTable(byCoinByPerson, byPerson) {
  const coins = byCoinByPerson.map(d => d.key);
  const people = byPerson.map(d => d.key);

  const tableData = people
    .map(person => {
      const coinCoints = coins.map(coin => {
        const personCoins = (byCoinByPerson.find(d => d.key == coin)?.values || [])
          .find((/** @type Nest */ d) => d.key == person)
        return (personCoins && personCoins.values && personCoins.values.length) || 0;
      });

      return [person, ...coinCoints]
    });

  let tableSelect = d3.select('.by-coin-table')
    .selectAll('table')
      .data([1])

  tableSelect.exit().remove();

  let table = tableSelect.enter()
    .append('table')
      .style('min-width', '100%')
    .merge(/** @type any */(tableSelect))

  let theadSelect = table.selectAll('thead')
    .data([1])

  theadSelect.exit().remove()

  let thead = theadSelect
    .enter()
      .append('thead')
        .append('tr')
    .merge(/** @type any */(theadSelect))
      .select('tr')

  let th = thead.selectAll('th')
      .data(['Person', ...coins], (_d, i) => i)

  th.exit().remove();

  const nbsp = (/** @type string */ str) => str.split(' ').join(String.fromCharCode(160)) // &nbsp;

  th.enter()
    .append('th')
    .merge(/** @type any */(th))
      .text(d => nbsp((d in COIN_MAPPING) ? COIN_MAPPING[d].name : d))
      .classed('tiny-header', (_d, i) => i != 0 && coins.length > 5)
      .classed('light-header', (_d, i) => i != 0 && coins.length <= 5)

  const tbody = table.selectAll('tbody')
    .data([1])

  const tr = tbody.enter()
    .append('tbody')
    .merge(/** @type any */(tbody))
    .selectAll('tr')
      .data(tableData, (_d, i) => i)

  tr.exit().remove();

  const enterTr = tr.enter()
    .append('tr')

  const rowTh = tr.merge(/** @type any */(enterTr))
    .selectAll('th')
      .data(d => [d[0]], (_d, i) => i);

  rowTh.exit().remove()

  rowTh.enter()
    .append('th')
    .merge(/** @type any */(rowTh))
      .text(d => d)

  const td = enterTr
    .merge(/** @type any */(tr))
      .selectAll('td')
        .data(d => d.slice(1))

  td.exit().remove();

  td.enter()
    .append('td')
  .merge(/** @type any */(td))
    .text(d => d)
}

/**
 * @param {number} x
 * @param {number} y
 * @return {string}
 */
function translate(x, y) {
  return `translate(${x},${y})`;
}