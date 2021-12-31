import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react'

const instance = createInstance({
  urlBase: 'https://analytics.peterkaskonas.com',
  siteId: 1,
  trackerUrl: 'https://analytics.peterkaskonas.com/matomo.php', // optional, default value: `${urlBase}matomo.php`
  srcUrl: 'https://analytics.peterkaskonas.com/matomo.js', // optional, default value: `${urlBase}matomo.js`
  disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
  heartBeat: { // optional, enabled by default
    active: true, // optional, default value: true
    seconds: 10 // optional, default value: `15
  },
  linkTracking: false, // optional, default value: true
})

ReactDOM.render(<MatomoProvider value={instance}>
    <App />
  </MatomoProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
