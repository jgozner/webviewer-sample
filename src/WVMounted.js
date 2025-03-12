import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function WVMounted({options}) {
  const viewer = useRef(null);
  const wvInstance = useRef();


  useEffect(() => {
    if(options.mountedFile){
        wvInstance.current.UI.loadDocument(options.mountedFile);
    }
  },[options.mountedFile])


  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: '/webviewer/lib',
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
    <div className="webviewer" ref={viewer} style={{visibility: options.mountedFile ? "visible" : "hidden", height: options.mountedFile ? "100vh" : "0"}}></div>
  );
}

export default WVMounted;
