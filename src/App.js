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
        initialDoc: '/files/floorplan.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true,
        enableMeasurement: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { annotationManager, documentViewer } = instance.Core;

      const areaMeasurementCreateTool = documentViewer.getTool("AnnotationCreateAreaMeasurement");

      areaMeasurementCreateTool.enableCreationOverAnnotation();

      documentViewer.getTool("AnnotationCreateAreaMeasurement").enableCreationOverAnnotation();
      documentViewer.getTool("AnnotationCreateRectangularAreaMeasurement").enableCreationOverAnnotation();

      instance.UI.updateTool('AnnotationCreateCountMeasurement', {
        buttonImage: 'https://www.pdftron.com/favicon-32x32.png'
      });

      var tool = instance.Core.documentViewer.getTool('AnnotationCreateCountMeasurement');
      tool.defaults.Icon = 'https://www.pdftron.com/favicon-32x32.png';

      areaMeasurementCreateTool.setDefaultMeasurementCaptionOptions({
        captionStyle: {
          color: 'green',
          fontFamily: 'serif',
          staticSize: 5
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
