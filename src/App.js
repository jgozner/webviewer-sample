import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const wvInstance = useRef();

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        enableFilePicker: true,
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      wvInstance.current = instance;

      const { Core, UI } = instance;
      const { Color } = Core.Annotations;

      UI.addEventListener(UI.Events.MULTI_VIEWER_READY, () => {
        const [documentViewer1, documentViewer2] = Core.getDocumentViewers();

        const startCompare = async () => {
          const shouldCompare = documentViewer1.getDocument() && documentViewer2.getDocument();
          if (shouldCompare) { // Check if both documents loaded before comparing
            const beforeColor = new Color(21, 205, 131, 0.4);
            const afterColor = new Color(255, 73, 73, 0.4);
            const options = { beforeColor, afterColor };
            const { doc1Annotations, doc2Annotations, diffCount } = await documentViewer1.startSemanticDiff(documentViewer2, options);
          }
        }
        documentViewer1.addEventListener('documentLoaded', startCompare);
        documentViewer2.addEventListener('documentLoaded', startCompare);

        documentViewer1.addEventListener(Core.DocumentViewer.Events.PAGES_UPDATED, (e) =>{

          e.rotationChanged.forEach((page) => {
            documentViewer1.getRotation()
            const rotation = documentViewer1.getCompleteRotation(page);
            documentViewer2.setRotation(rotation)
          })
        });

        documentViewer1.loadDocument('files/semantic_1.pdf');
        documentViewer2.loadDocument('files/semantic_2.pdf');
      });

      UI.enableFeatures([UI.Feature.MultiViewerMode]);
      UI.enterMultiViewerMode();
    })
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
