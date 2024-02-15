import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer, { Core } from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true,
        enableMeasurement: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { annotationManager, documentViewer } = instance.Core;

      const areaMeasurementCreateTool = documentViewer.getTool('AnnotationCreateAreaMeasurement');

      areaMeasurementCreateTool.setDefaultMeasurementCaptionOptions({
        captionStyle: {
          color: 'green',
          fontFamily: 'serif',
          staticSize: 5
        }
      });

      annotationManager.addEventListener('annotationChanged', (annotations, action) => {
        if (action === 'add') {
          annotations.forEach((annot) => {
            console.log(annot.getBorderStyle())
            console.log(annot.getContentStyleProperties())
            console.log(annot.getRichTextStyle())
          });
        } else if (action === 'modify') {
          console.log('this change modified annotations');
        } else if (action === 'delete') {
          console.log('there were annotations deleted');
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
