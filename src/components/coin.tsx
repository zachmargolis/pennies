import { useId } from "preact/hooks";
import { VNode } from "preact";
import { polygonPath, Coin as CoinData } from "../coins";
import { DATE_FORMAT } from "../formats";

export const ITEM_SIZE = 4;

export function Coin({ coinData, date }: { coinData: CoinData; date?: Date }): VNode {
  const title = [coinData.name, date ? ` (${DATE_FORMAT(date)})` : ""].join("");

  if ("ratio" in coinData) {
    return (
      <rect
        x={-0.5 * (coinData.ratio * ITEM_SIZE)}
        y={-0.5 * ITEM_SIZE}
        width={coinData.ratio * ITEM_SIZE}
        height={ITEM_SIZE}
        fill={coinData.color}
      >
        <title>{title}</title>
      </rect>
    );
  } else if ("nSides" in coinData) {
    return (
      <path d={polygonPath(coinData.nSides, ITEM_SIZE * coinData.diameter)} fill={coinData.color}>
        <title>{title}</title>
      </path>
    );
  } else if ("innerColor" in coinData) {
    return (
      <g>
        <circle cx="0" cy="0" r={ITEM_SIZE * coinData.diameter} fill={coinData.outerColor} />
        <circle cx="0" cy="0" r={0.75 * ITEM_SIZE * coinData.diameter} fill={coinData.innerColor}>
          <title>{title}</title>
        </circle>
      </g>
    );
  } else if ("innerDiameter" in coinData) {
    const id = useId();

    return (
      <g>
        <mask id={id}>
          <circle cx="0" cy="0" r={ITEM_SIZE * coinData.diameter} fill={"white"} />
          <circle cx="0" cy="0" r={ITEM_SIZE * coinData.innerDiameter} fill={"black"} />
        </mask>
        <circle
          cx="0"
          cy="0"
          r={ITEM_SIZE * coinData.diameter}
          fill={coinData.color}
          mask={`url(#${id})`}
        >
          <title>{title}</title>
        </circle>
      </g>
    );
  } else if ("color" in coinData) {
    return (
      <circle cx="0" cy="0" r={ITEM_SIZE * coinData.diameter} fill={coinData.color}>
        <title>{title}</title>
      </circle>
    );
  }

  return <></>;
}
