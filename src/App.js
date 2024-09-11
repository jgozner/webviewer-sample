import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

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
      setInstance(instance);

      const { documentViewer, annotationManager, Annotations } = instance.Core;

      documentViewer.addEventListener('documentLoaded', () => {
          // set flags for multiline and required
          const flags = new Annotations.WidgetFlags();
          flags.set('Multiline', true);
          //flags.set('Required', true);

          // create a form field
          const field = new Annotations.Forms.Field("some text field name", {
            type: 'Tx',
            defaultValue: "some placeholder default text value",
            flags,
          });

          // create a widget annotation
          const widgetAnnot = new Annotations.TextWidgetAnnotation(field);

          // set position and size
          widgetAnnot.PageNumber = 1;
          widgetAnnot.X = 350;
          widgetAnnot.Y = 150;
          widgetAnnot.Width = 200;
          widgetAnnot.Height = 100;
          widgetAnnot.backgroundColor  = new Annotations.Color(0,128,0, 0.4);

          widgetAnnot.border = new Annotations.Border({
            color: new Annotations.Color(0,0,128),
            width: 15,
            cornerRadius: 15
          });

          //add the form field and widget annotation
          annotationManager.getFieldManager().addField(field);
          annotationManager.addAnnotation(widgetAnnot);
          annotationManager.redrawAnnotation(widgetAnnot)
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
