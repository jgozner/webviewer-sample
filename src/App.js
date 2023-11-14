import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  const [resultsList, setResultsList] = useState([]);

  const addAnnotationsUsingSearchResult = (results) => {
    const { documentViewer, Annotations } = instance.Core;
    const annotationManager = documentViewer.getAnnotationManager();
    const redactAnnotations = results.map((r) => {
      const annotation = new Annotations.RedactionAnnotation();
      annotation.PageNumber = r.page_num;
      annotation.Quads = r.quads.map((quad) => quad.getPoints());
      annotation.StrokeColor = new Annotations.Color(0, 255, 0);
      annotation.setContents(r.result_str);
      annotation.type = r.type;
      annotation.Author = 'Guest';
      annotation.setCustomData(
        'trn-annot-preview',
        documentViewer.getSelectedText(annotation.PageNumber)
      );
      return annotation;
    });
    annotationManager.addAnnotations(redactAnnotations);
    annotationManager.drawAnnotationsFromList(redactAnnotations);
  };

  const uiSearch = useCallback(
    (searchValue, options, results) => {
      if (results.length > 0) {
        //check first if search value matches a search sample
        let searchLabel;

        if (searchLabel) {
          searchLabel = searchLabel.label;
        } else {
          searchLabel =
            '"' +
            searchValue.replace(/\s+/g, ' ') +
            '" (' +
            results.length +
            ')';
        }

        // see if label is already in the list
        if (resultsList.some((r) => r.label === searchLabel)) {
          return;
        }
        addAnnotationsUsingSearchResult(results);
      }
    },
    [resultsList]
  );

  //attach search
  useEffect(() => {
    if (instance) {
      instance.UI.addSearchListener(uiSearch);
      return () => instance.UI.removeSearchListener(uiSearch);
    }
  }, [uiSearch, instance, resultsList]);

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

      const { documentViewer } = instance.Core;

      instance.UI.enableFeatures(['Redaction']);
      instance.UI.setToolbarGroup('toolbarGroup-Redact');
      instance.UI.setToolMode('AnnotationCreateRedaction');

      documentViewer.addEventListener("documentLoaded", () => {
        setResultsList([]);
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
