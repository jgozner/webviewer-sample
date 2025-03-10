import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const wvInstance = useRef();
  //Store the current content being edited 
  const currentContentAnnotation = useRef();
  const saveTriggered = useRef();

  //Editing of the content started
  const handleEditorStarted = ({pa}) => {
    currentContentAnnotation.current = pa;
  };

  //Editing of the content finished
  const handleEditorEnded = () => {
    if(saveTriggered.current){
      //we triggered a save while editing content
      saveDocument();
    }
    currentContentAnnotation.current = null;
  };

  const saveDocument = async () => {
    console.log(wvInstance)
    const { documentViewer } = wvInstance.current.Core
    const doc = documentViewer.getDocument();
    const data = await doc.getFileData();
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    window.open(url);
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      wvInstance.current = instance;

      instance.UI.enableFeatures([instance.UI.Feature.ContentEdit]);

      const { documentViewer } = instance.Core;

      const contentEditManager = documentViewer.getContentEditManager();
      contentEditManager.addEventListener('contentBoxEditStarted', handleEditorStarted);
      contentEditManager.addEventListener('contentBoxEditEnded', handleEditorEnded);
    });
  }, []);

  const onSave = async () => {
    if(currentContentAnnotation.current){
      //End current editing 
      saveTriggered.current = true;
      wvInstance.current.Core.annotationManager.deselectAnnotation(currentContentAnnotation.current);
    }else{
      saveDocument();
    }

  }

  return (
    <div className="App">
      <button onClick={onSave}>Save</button>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
