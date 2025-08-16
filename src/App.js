import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const wvInstance = useRef();

  let xfdf = "";

  const copy = async () => {
    const { annotationManager } = wvInstance.current.Core;
    xfdf = await annotationManager.exportAnnotations({ widgets: true, fields: true });
  }

  const paste = async () => {
    const { annotationManager } = wvInstance.current.Core;
    await annotationManager.importAnnotations(xfdf);
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        enableFilePicker: true,
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      wvInstance.current = instance;
    });
  }, []);

  return (
    <div className="App">
      <button onClick={copy}>Copy</button>
      <button onClick={paste}>Paste</button>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
