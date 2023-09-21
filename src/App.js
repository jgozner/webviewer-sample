import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer.WebComponent(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/sample.pdf',
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      const {documentViewer, annotationManager, PDFNet, Annotations, Math} = instance.Core;
      const { TextExtractor, Rect  } = PDFNet;


      documentViewer.addEventListener("documentLoaded", async () => {
        await PDFNet.initialize();
        //Extract Text
        const document = await documentViewer.getDocument();
        const pdfDoc = await document.getPDFDoc();
        const pageCount = await pdfDoc.getPageCount();
        const txtExtractor = await TextExtractor.create();
        await txtExtractor.setRightToLeftLanguage(true);

        const documentWords = {};

        for(var i = 1; i <= pageCount; i++){
          const page = await pdfDoc.getPage(i);
          const pageRect = await page.getCropBox();
          await txtExtractor.begin(page, pageRect);

          documentWords[i] = [];

          let line = await txtExtractor.getFirstLine();
          for (; (await line.isValid()); line = (await line.getNextLine())){
            for (let word = await line.getFirstWord(); (await word.isValid()); word = (await word.getNextWord())){
              const wordText = await word.getString();

              if (wordText.trim().length > 0){
                const wordQuad = await word.getQuad();
                const wordRect = await word.getBBox();

                documentWords[i].push({
                  text: wordText,
                  quad: wordQuad,
                  rect: wordRect
                })
              }
            }
          }
        }

        //highlight words
        for(const [key, value] of Object.entries(documentWords)){
          const pageNumber = key;
          const words = value;

          for(var w = 0; w < words.length; w++){
              const word = words[w];

              const annot = new Annotations.TextHighlightAnnotation({
                PageNumber: pageNumber,
                Quads: [new Math.Quad(
                  word.quad.p1x, word.quad.p1y,
                  word.quad.p2x, word.quad.p2y, 
                  word.quad.p3x, word.quad.p3y,
                  word.quad.p4x, word.quad.p4y
                )],
                StrokeColor: new Annotations.Color(0, 255, 0, 1),
              });
              annot.setContents(word.text)
              annotationManager.addAnnotation(annot);
              annotationManager.redrawAnnotation(annot);
          }
          break;
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
