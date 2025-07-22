import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  const xfdfFiles = ["default.xml", "user_1.xml"]

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);
 
      const { documentViewer, annotationManager } = instance.Core;

      documentViewer.addEventListener('documentLoaded', async () => {

        for(const xfdfFile of xfdfFiles){
          const response = await fetch(`/xfdf/${xfdfFile}`);
          const xfdfString = await response.text();
          await annotationManager.importAnnotations(xfdfString)
        }
   
      });


    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
