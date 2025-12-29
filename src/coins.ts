import { Row } from "./data";

export const PENNY_END_DATE = new Date("2025-11-12");

interface RoundCoin {
  name: string;
  shortName?: string;
  diameter: number;
  color: string;
}

interface RoundTwoColorCoin {
  name: string;
  shortName?: string;
  diameter: number;
  innerColor: string;
  outerColor: string;
}

interface RoundCoinWithHole {
  name: string;
  shortName?: string;
  diameter: number;
  innerDiameter: number;
  color: string;
}

interface PolygonalCoin {
  name: string;
  shortName?: string;
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
  shortName?: string;
  color: string;
  ratio: number;
}

export type Coin = RoundCoin | RoundTwoColorCoin | RoundCoinWithHole | PolygonalCoin | Bill;

const mmToInch = 1 / 10 / 2.54;

// diameter values are in inches
// https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications
// https://www.fleur-de-coin.com/eurocoins/specifications
// https://en.wikipedia.org/wiki/Coins_of_the_pound_sterling#Specifications
// https://en.wikipedia.org/wiki/Penny_(Canadian_coin)
// https://en.wikipedia.org/wiki/Mexican_peso
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
    shortName: "$1 bill",
    color: "green",
    ratio: 7 / 3,
  },
  "5USD": {
    name: "5 Dollar Bill",
    shortName: "$5 bill",
    color: "green",
    ratio: 7 / 3,
  },
  "10USD": {
    name: "10 Dollar Bill",
    shortName: "$10 bill",
    color: "green",
    ratio: 7 / 3,
  },
  "20USD": {
    name: "20 Dollar Bill",
    shortName: "$20 bill",
    color: "green",
    ratio: 7 / 3,
  },
  "50USD": {
    name: "50 Dollar Bill",
    shortName: "$50 bill",
    color: "green",
    ratio: 7 / 3,
  },
  "0.01EUR": {
    name: "Euro Penny",
    shortName: "1 cent",
    diameter: 16.25 * mmToInch,
    color: "brown",
  },
  "0.02EUR": {
    name: "2 Euro Cent",
    shortName: "2 cent",
    diameter: 18.77 * mmToInch,
    color: "red",
  },
  "0.05EUR": {
    name: "5 Euro Cent",
    shortName: "5 cent",
    diameter: 21.25 * mmToInch,
    color: "red",
  },
  "0.1EUR": {
    name: "10 Euro Cent",
    shortName: "10 cent",
    diameter: 19.75 * mmToInch,
    color: "silver",
  },
  "0.5EUR": {
    name: "50 Euro Cent",
    shortName: "50 cent",
    diameter: 24.25 * mmToInch,
    color: "brown",
  },
  "1EUR": {
    name: "1 Euro",
    diameter: 23.25 * mmToInch,
    innerColor: "gainsboro",
    outerColor: "burlywood",
  },
  "10EUR": {
    name: "10 Euro",
    ratio: 127 / 67,
    color: "orange",
  },
  "0.01GBP": {
    name: "1 Pence",
    diameter: 20.3 * mmToInch,
    color: "brown",
  },
  "0.02GBP": {
    name: "2 Pence",
    diameter: 25.9 * mmToInch,
    color: "brown",
  },
  "0.05GBP": {
    name: "5 Pence",
    diameter: 18 * mmToInch,
    color: "silver",
  },
  "0.2GBP": {
    name: "20 Pence",
    diameter: 21.4 * mmToInch,
    nSides: 7,
    color: "silver",
  },
  "0.01CAD": {
    name: "Canadian Penny",
    shortName: "Penny",
    diameter: 19.05 * mmToInch,
    color: "brown",
  },
  // https://en.wikipedia.org/wiki/Dime_(Canadian_coin)
  "0.1CAD": {
    name: "Canadian Dime",
    shortName: "Dime",
    diameter: 18.03 * mmToInch,
    color: "silver",
  },
  "0.25CAD": {
    name: "Canadian Quarter",
    shortName: "Quarter",
    diameter: 23.88 * mmToInch,
    color: "silver",
  },
  // https://en.wikipedia.org/wiki/Loonie
  "1CAD": {
    name: "Loonie",
    diameter: 26.5 * mmToInch,
    nSides: 11,
    color: "wheat",
  },
  // https://en.numista.com/catalogue/pieces10140.html
  "0.02MXP": {
    name: "2 Centavo",
    diameter: 25 * mmToInch,
    color: "brown",
  },
  "0.5MXP": {
    name: "50 Centavo",
    diameter: 17 * mmToInch,
    color: "silver",
  },
  "1MXP": {
    name: "1 Peso",
    diameter: 21 * mmToInch,
    innerColor: "antiquewhite",
    outerColor: "silver",
  },
  // https://en.numista.com/818
  "5MXP": {
    name: "5 Pesos",
    diameter: 27.24 * mmToInch,
    color: "wheat",
  },
  "0.25TRY": {
    name: "Turkish Quarter",
    shortName: "Quarter",
    diameter: 20.5 * mmToInch,
    color: "brown",
  },
  // https://en.wikipedia.org/wiki/Penny_(New_Zealand_coin)
  "0.01NZD": {
    name: "NZ Penny",
    shortName: "Penny",
    diameter: (31.75 * mmToInch) / 2, // I think this seems too big, dividing by 2
    color: "brown",
  },
  "0.1NZD": {
    name: "NZ Dime",
    shortName: "Dime",
    diameter: 20.5 * mmToInch,
    color: "silver",
  },
  "1JPY": {
    name: "1 Yen",
    diameter: 20 * mmToInch,
    color: "silver",
  },
  "5JPY": {
    name: "5 Yen",
    diameter: 22 * mmToInch,
    innerDiameter: 5 * mmToInch,
    color: "burlywood",
  },
  "10JPY": {
    name: "10 Yen",
    diameter: 23.5 * mmToInch,
    color: "orange",
  },
  "0.2AUD": {
    name: "20 Australian cents",
    shortName: "20 cents",
    diameter: 28.52 * mmToInch,
    color: "silver",
  },
  "1AUD": {
    name: "Australian Dollar",
    shortName: "Dollar",
    diameter: 25 * mmToInch,
    color: "brown",
  },
  "0.05SGD": {
    name: "5 Singapore Cent",
    shortName: "5 cents",
    diameter: 16.75 * mmToInch,
    color: "gold",
  },
  "2CHF": {
    name: "2 Franc",
    diameter: 27.4 * mmToInch,
    color: "silver",
  },
  // https://en.numista.com/809
  "0.2HUF": {
    name: "20 Forint",
    diameter: 26.3 * mmToInch,
    color: "tan",
  },
};

/**
 * Creates a single string "key" for a coin
 */
export function coin(d: Row): string {
  return `${d.denomination}${d.currency}`;
}

export function round(num: number, precision = 2, currency = "USD") {
  if (currency === "JPY") {
    return num.toFixed(0);
  }

  return num.toFixed(precision);
}

export function formatAmount(num: number, currency: string) {
  return round(num, 2, currency);
}
