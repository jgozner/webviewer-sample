import './App.css';
import { useEffect, useRef, useState } from 'react';
import WVMounted from './WVMounted';
import WVRegular from './WVRegular';

function App() {

  const [options, setOptions] = useState({
    mountedFile: null, 
    regularFile: null
  })

  const openFileMounted = () => {
    setOptions({
      mountedFile: "/files/Sample.pdf",
      regularFile: null
    })
  }

  const openFileRegular = () => {
    setOptions({
      mountedFile: null,
      regularFile: "/files/Sample.pdf"
    })
  }

  return (
    <div className="App">
      <button onClick={openFileMounted}>Open File (WV Mounted)</button>
      <button onClick={openFileRegular}>Open File (WV Regular)</button>
      <WVMounted options={options}/>
      {options.regularFile && (
        <WVRegular options={options}/>
      )}
    </div>
  );
}

export default App;
