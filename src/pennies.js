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

  const byPerson = d3.nest()
    .key(d => d.person)
    .sortKeys(sortByName)
    .entries(data);

  const byCoinByPerson = d3.nest()
    .key(coin)
    .key(d => d.person)
    .sortKeys(sortByName)
    .entries(data);

  drawByCoinTable(byCoinByPerson, byPerson);
}

const width = 510;
const color = d3.scaleOrdinal(d3.schemeSet1)

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