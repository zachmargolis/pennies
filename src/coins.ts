import { path as d3Path } from "d3-path";
import { Row } from './data';

interface RoundCoin {
  name: string;
  diameter: number;
  color: string;
}

interface PolygonalCoin {
  name: string;
  diameter: number;
  color: string;
  nSides: number;
  /**
   * Memoized SVG path
   */
  cachedPath?: string;
}

interface Bill {
  name: string;
  color: string;
  square: true;
  ratio: number;
}

export type Coin = RoundCoin | PolygonalCoin | Bill;

const mmToInch = 1 / 10 / 2.54;

export function polygonPath(nSides: number, radius: number): string {
  const path = d3Path();

  const angle = (2 * Math.PI) / nSides;
  const offset = Math.PI / 2;

  for (let i = 0; i < nSides; i++) {
    const theta = offset + -i * angle;
    const coords: [number, number] = [radius * Math.cos(theta), -radius * Math.sin(theta)];

    if (i === 0) {
      path.moveTo(...coords);
    } else {
      path.lineTo(...coords);
    }
  }

  path.closePath();

  return path.toString();
}

// diameter values are in inches
// https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications
// https://www.fleur-de-coin.com/eurocoins/specifications
// https://en.wikipedia.org/wiki/Coins_of_the_pound_sterling#Specifications
// https://en.wikipedia.org/wiki/Penny_(Canadian_coin)
export const COIN_MAPPING: Record<string, Coin> = {
  "0.01USD": {
    name: "Penny",
    diameter: 0.75,
    color: "burlywood",
  },
  "0.05USD": {
    name: "Nickel",
    diameter: 0.835,
    color: "gray",
  },
  "0.1USD": {
    name: "Dime",
    diameter: 0.705,
    color: "gray",
  },
  "0.25USD": {
    name: "Quarter",
    diameter: 0.955,
    color: "gray",
  },
  "1USD": {
    name: "Dollar Bill",
    square: true,
    color: "green",
    ratio: 7 / 3,
  },
  "20USD": {
    name: "20 Dollar Bill",
    square: true,
    color: "green",
    ratio: 7 / 3,
  },
  "0.01EUR": {
    name: "Euro Penny",
    diameter: 16.25 * mmToInch,
    color: "brown",
  },
  "0.05EUR": {
    name: "5 Euro Cent",
    diameter: 21.25 * mmToInch,
    color: "red",
  },
  "0.5EUR": {
    name: "Half Euro",
    diameter: 24.25 * mmToInch,
    color: "brown",
  },
  "0.1EUR": {
    name: "Euro Dime",
    diameter: 19.75 * mmToInch,
    color: "silver",
  },
  "1EUR": {
    name: "One Euro",
    diameter: 23.25 * mmToInch,
    color: "silver",
  },
  "0.01GBP": {
    name: "One Pence",
    diameter: 20.3 * mmToInch,
    color: "brown",
  },
  "0.02GBP": {
    name: "Two Pence",
    diameter: 25.9 * mmToInch,
    color: "brown",
  },
  "0.2GBP": {
    name: "Twenty Pence",
    diameter: 21.4 * mmToInch,
    nSides: 7,
    color: "silver",
  },
  "0.01CAD": {
    name: "Canadian Penny",
    diameter: 19.05 * mmToInch,
    color: "brown",
  },
  "0.25CAD": {
    name: "Canadian Quarter",
    diameter: 23.88 * mmToInch,
    color: "silver",
  },
  "0.25TRY": {
    name: "Turkish Quarter",
    diameter: 20.5 * mmToInch,
    color: "brown",
  },
  "0.1NZD": {
    name: "NZ Dime",
    diameter: 20.5 * mmToInch,
    color: "silver",
  },
  "10JPY": {
    name: "Ten Yen",
    diameter: 23.5 * mmToInch,
    color: "orange",
  },
  "1AUD": {
    name: "Australian Dollar",
    diameter: 25 * mmToInch,
    color: "brown",
  },
};

export function coin(d: Row): string {
  return `${d.denomination}${d.currency}`;
}

export function round(num: number, precision = 2, currency = 'USD') {
  if (currency === 'JPY') {
    return num.toFixed(0);
  }

  return num.toFixed(precision);
}

export function formatAmount(num: number, currency: string) {
  return round(num, 2, currency);
}
