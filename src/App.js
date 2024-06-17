import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  const [modified, setModified] = useState(false);

  const initialState = useRef();

useEffect(() => {
  WebViewer(
    {
      path: '/webviewer/lib',
      initialDoc: "/files/WebviewerDemoDoc (5).pdf"
    },
    viewer.current,
  ).then((instance) => {
    setInstance(instance);

    const { documentViewer, annotationManager } = instance.Core

    //Grab initial state of the document
    documentViewer.addEventListener('documentLoaded', async () => {
      const currentState = await annotationManager.exportAnnotations({ fields: false, widgets: false });
      initialState.current = currentState;
    });

    //Check changes
    annotationManager.addEventListener('annotationChanged', async () => {
      const currentState = await annotationManager.exportAnnotations({ fields: false, widgets: false });
      setModified(initialState.current != currentState)
    });

  });
}, []);

  return (
    <div className="App">
      <div className="header" style={{backgroundColor: modified ? "#D9381E" : "#00a5e4"}}>React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
