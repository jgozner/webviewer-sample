import './App.css';
import { useEffect, useRef, useState } from 'react';
import WVMounted from './WVMounted';
import WVRegular from './WVRegular';

function App() {

  const [mountedVisible, setMountedVisible] = useState(false);
  const [regularVisible, setRegularVisible] = useState(false);
  const [file, setFile] = useState(null)


  const openFileMounted = () => {
    setFile(null)
    setMountedVisible(true);
    setRegularVisible(false)
    setFile("/files/40k_linearized.pdf")
  }

  const openFileRegular = () => {
    setFile(null)
    setMountedVisible(false);
    setRegularVisible(true);
    setFile("/files/40k_linearized.pdf")
  }

  return (
    <div className="App">
      <button onClick={openFileMounted}>Open File (WV Mounted)</button>
      <button onClick={openFileRegular}>Open File (WV Regular)</button>
      <WVMounted visible={mountedVisible} file={file}/>
      {regularVisible && (
        <WVRegular file={file}/>
      )}
    </div>
  );
}

export default App;
