import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: '/webviewer/lib',
        enableOfficeEditing: true,
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {
      const { Core } = instance;

      await Core.PDFNet.initialize();

      const pdfdoc = await Core.PDFNet.PDFDoc.create();

      const filePath = "./files/sample.txt"

      const r = await fetch(filePath)
      const blob = await r.blob()
      const arrayBuffer = await blob.arrayBuffer();

      await Core.PDFNet.Convert.fromTextWithBuffer(pdfdoc, arrayBuffer);

      instance.UI.loadDocument(pdfdoc);
    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
