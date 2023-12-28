import { render, hydrate } from 'preact';
import { useQuery } from 'preact-fetching';
import { App } from './app';
import { loadData } from './data';

function AppWithData() {
  const { data } = useQuery('/pennies.csv', loadData);

  return <App data={data} isInteractive={true} />;
}

const elem = document.getElementById('app')!;
if (elem?.childNodes.length === 1 && elem.childNodes[0] instanceof Comment) {
  render(<AppWithData />, elem);
} else {
  hydrate(<AppWithData />, elem);
}
