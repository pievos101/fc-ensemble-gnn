import React, {useState} from 'react';
import logo from './assets/logo.svg';
import './App.css';

const PRE_PATH = '/api/v1';
// create a js function, that runs in the head of a hmlt file and adds the pre_path to the beginning of all script srcs and link hrefs
function App() {
  const [apiCallSuccess, setApiCallSuccess] = useState(false)

  async function callApi() {
    // fetch('/web/global-model') from window.href
    const baseUrl = window.location.href
    const res = await fetch(`${baseUrl}/web/global-model`)
    const data = await res.json()
    console.log(data)
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={() => callApi()}>Call API</button>
        <p>
          Api call success: {apiCallSuccess ? 'true' : 'false'}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
