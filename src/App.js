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
      const { UI, Core } = instance;
      const { annotationManager } = Core;

      const annotationMenuItems = UI.annotationPopup.getItems();
      const lastMenuItem = annotationMenuItems[annotationMenuItems.length - 1];

      UI.annotationPopup.add([{
        type: 'actionButton',
        img: 'icon-chevron-up',
        title: "Send to Front",
        onClick: () => {
          const selectedAnnotations = annotationManager.getSelectedAnnotations();
          
          for (let anno of selectedAnnotations) {
            annotationManager.bringToFront(anno);
            annotationManager.redrawAnnotation(anno);
          }
        },
      }, {
        type: 'actionButton',
        img: 'icon-chevron-down',
        title: "Send to Back",
        onClick: () => {
          const selectedAnnotations = annotationManager.getSelectedAnnotations();
          for (let anno of selectedAnnotations) {
            annotationManager.bringToBack(anno);
            annotationManager.redrawAnnotation(anno);
          }
        },
      }], lastMenuItem.dataElement);


    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
