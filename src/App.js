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

      const { documentViewer, Math, Annotations, annotationManager } = instance.Core;

      documentViewer.addEventListener('documentLoaded', async () => {
        const doc = documentViewer.getDocument();
        const searchTerm = '6 Important Factors when Choosing a PDF Library';
        const pageNumber = 1; // page to parse
  
        let pageText = await doc.loadPageText(pageNumber);

        pageText = pageText.replace(/(\r\n|\n|\r)/gm, " ");
        console.log(pageText)
        let startIndex = pageText.indexOf(searchTerm, 0);
        let endIndex = startIndex + searchTerm.length;
  
        // Get text position for each letter in the 'searchTerm' found
        const quads = await doc.getTextPosition(pageNumber, startIndex, endIndex);

        const rects = quads.filter((quad) => quad.x1 != undefined)
            .map((quad) => new Math.Quad(quad.x1, quad.y1, quad.x2, quad.y2, quad.x3, quad.y3, quad.x4, quad.y4).toRect());

          const newQuads = [];
          let tempRect = null;

          for (var i = 0; i < rects.length; i++) {
            var rect = rects[i];
            if (!tempRect) {
              tempRect = new Math.Rect(rect.x1, rect.y1, rect.x2, rect.y2);
              continue;
            }

            //Check if we are still on the same line or on a new line
            const centerPoint = rect.getCenter();
            if ((tempRect.y1 < centerPoint.y) & (tempRect.y2 > centerPoint.y)) {
              tempRect.x2 = rect.x2;
              tempRect.y2 = rect.y2;
            } else {
              newQuads.push(tempRect.toQuad());
              tempRect = new Math.Rect(rect.x1, rect.y1, rect.x2, rect.y2);
            }
          }

          newQuads.push(tempRect.toQuad());

          const annot = new Annotations.TextHighlightAnnotation({
            PageNumber: pageNumber,
            Quads: newQuads,
            StrokeColor: new Annotations.Color(255,255, 55, 1),
          });
          annotationManager.addAnnotation(annot);
          annotationManager.redrawAnnotation(annot);
      })

    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
