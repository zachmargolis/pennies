import { render } from 'preact';
import { App } from './app.tsx';
import './stylesheets/styles.css';

render(<App />, document.getElementById('app')!);
