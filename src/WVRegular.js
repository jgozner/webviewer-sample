import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function WVRegular ({options}) {
  const viewer = useRef(null);
  const wvInstance = useRef();

  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: '/webviewer/lib',
        initialDoc: options.regularFile,
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        preloadWorker: 'pdf'
      },
      viewer.current,
    ).then((instance) => {
        wvInstance.current = instance;
        instance.UI.setLayoutMode(instance.UI.LayoutMode.Continuous);
    });
  }, []);

  return (
    <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
  );
}

export default WVRegular;
