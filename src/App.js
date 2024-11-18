import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: "/files/Sample.pdf",
        licenseKey: "demo:1701731196462:7ca228c103000000005e46581a1882b46379dc11c8003a58246516df04"
      },
      viewer.current,
    ).then(async (instance) => {

      const { documentViewer, annotationManager } = instance.Core;

      //Load XFDF
      documentViewer.setDocumentXFDFRetriever(async () => {
        const response = await fetch('path/to/annotation/server');
        const xfdfString = await response.text();
        return xfdfString;
      });

      const testButton = new instance.UI.Components.CustomButton({
        dataElement: 'customButton',
        title: 'Save XFDF',
        onClick: () => {
          annotationManager.exportAnnotations({ links: false, widgets: false }).then(xfdfString => {
            //save xfdfString
            console.log(xfdfString)
          });
        },
        img: 'icon-save',
      });
      
      // This can now be added to a modular header
      const defaultHeader = instance.UI.getModularHeader('default-top-header')
      defaultHeader.setItems([...defaultHeader.items, testButton]);

    })
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
