import { render, hydrate } from 'preact';
import { useQuery } from 'preact-fetching';
import { App } from './app.tsx';
import { loadData } from './data.ts';

function AppWithData() {
  const { data } = useQuery('/pennies.csv', loadData);

  return <App data={data} />;
}

const elem = document.getElementById('app')!;
if (elem?.childNodes.length === 1 && elem.childNodes[0] instanceof Comment) {
  render(<AppWithData />, elem);
} else {
  hydrate(<AppWithData />, elem);
}
