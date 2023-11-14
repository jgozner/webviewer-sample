import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  const runScript = async (PDFNet, docPath) => {
    try {
        const doc = await PDFNet.PDFDoc.createFromURL(docPath);
        //creating document
        doc.initSecurityHandler();
        doc.lock();
  
        //setting text search parameters
        const txtSearch = await PDFNet.TextSearch.create();
  
        //mode should be regex to match all instances of multiple words
        //and also highlight to get highlight information (quads)
        const mode = PDFNet.TextSearch.Mode.e_reg_expression + PDFNet.TextSearch.Mode.e_highlight;
  
        //pattern to search for using regex. Search for multiple strings with
        //format 'the|cat|Jackson'.
        const pattern = 'PDF';
  
        //the array holding all of the redaction info for each word to be redacted
        const redactionArray = [];
  
        //starting the text search
        txtSearch.begin(doc, pattern, mode, -1, -1);
  
        //call Run() iteratively to find all matching instances of the words
        while (true) {
            const result = await txtSearch.run();
            let hlts;
  
  
            if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
  
                //get highlights information from text (for quads)
                hlts = result.highlights;
  
                //begin text search
                await hlts.begin(doc);
  
                //loops through all strings to redact, pushing quad info and page number to redaction array
                while (await hlts.hasNext()) {
                    const curPage = await doc.getPage(await hlts.getCurrentPageNumber());
                    const quadArr = await hlts.getCurrentQuads();
                    //turns quads into data needed to create RECT object for redaction annotations
                    for (let i = 0; i < quadArr.length; ++i) {
                        const currQuad = quadArr[i];
                        const x1 = Math.min(Math.min(Math.min(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                        const x2 = Math.max(Math.max(Math.max(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                        const y1 = Math.min(Math.min(Math.min(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                        const y2 = Math.max(Math.max(Math.max(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
  
                        const overlayfillcolor = await PDFNet.ColorPt.init(1,0,0);
                        const redaction = await PDFNet.RedactionAnnot.create(doc, await PDFNet.Rect.init(x1, y1, x2, y2));
                        redaction.setColor(overlayfillcolor, 3);
                        redaction.setInteriorColor(overlayfillcolor, 3);
                        redaction.setOpacity(.5);
                        redaction.refreshAppearance();
  
                        await curPage.annotPushBack(redaction);
                    }
                    await hlts.next();
                }
            } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
                break;
            }
        }
  
        return doc;
  
  
    } catch (err) {
        console.log(err);
    }
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {

      const { documentViewer, Search, Annotations, annotationManager  } = instance.Core;

      instance.UI.enableFeatures(['Redaction']);
      instance.UI.setToolbarGroup('toolbarGroup-Redact');
      instance.UI.setToolMode('AnnotationCreateRedaction');

      await instance.Core.PDFNet.initialize();
      instance.UI.openElement('loadingModal')
      const docInput = await runScript(instance.Core.PDFNet, 'http://localhost:3000/files/WebviewerDemoDoc.pdf');
      instance.UI.loadDocument(docInput);

    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
