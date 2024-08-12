import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/E-SIGNATURE CERTIFICATE - 2024-08-06T141806.215.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {
      setInstance(instance);

      const { VerificationOptions } = instance.UI;

      const response = await fetch('files/aatl_20240812.fdf');
      const trustListAsArrayBuffer = await response.arrayBuffer();
      VerificationOptions.loadTrustList(trustListAsArrayBuffer)
    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
