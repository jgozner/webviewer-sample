import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function WVRegular ({file}) {
  const viewer = useRef(null);
  const wvInstance = useRef();

  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: '/webviewer/lib',
        initialDoc: file,
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        preloadWorker: 'pdf'
      },
      viewer.current,
    ).then((instance) => {
        wvInstance.current = instance;

    });
  }, []);

  return (
    <div className="webviewer" ref={viewer}></div>
  );
}

export default WVRegular;
