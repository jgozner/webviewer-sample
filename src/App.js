import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
      const {Core, UI} = instance;
      const { documentViewer, annotationManager, PDFNet, Annotations, Math } = Core;
      const { TextExtractor } = PDFNet;

      const extractAndHighlightText = async () => {

        await PDFNet.initialize();
       
        //Extract Text
        const document = await documentViewer.getDocument();
        const pdfDoc = await document.getPDFDoc();
        const pageCount = await pdfDoc.getPageCount();
        const txtExtractor = await TextExtractor.create();
        await txtExtractor.setRightToLeftLanguage(true);

        const documentWords = {};

        for (var i = 1; i <= pageCount; i++) {
          const page = await pdfDoc.getPage(i);
          const pageRect = await page.getCropBox();
          const defaultMatrix = await page.getDefaultMatrix(true);
          const defaultMatrixInversed = await defaultMatrix.inverse();

          //flip on axis and translate to account for setting 
          //txtExtractor.setRightToLeftLanguage(true);
          defaultMatrixInversed.m_a = -1;
          defaultMatrixInversed.m_h = await page.getPageWidth();

          await txtExtractor.begin(page, pageRect);

          documentWords[i] = [];

          let line = await txtExtractor.getFirstLine();
          for (; (await line.isValid()); line = (await line.getNextLine())) {
            for (let word = await line.getFirstWord(); (await word.isValid()); word = (await word.getNextWord())) {
              const wordText = await word.getString();

              if (wordText.trim().length > 0) {
                const wordRect = await word.getBBox();
                
                //We need to convert the PDFNet.Rect to Math.Rect
                //PDFNet.Rect is lower-left to upper-right bound
                //Math.Rect is upper-left to lower-right bound
                const p1 = await defaultMatrixInversed.mult(wordRect.x1, wordRect.y1)
                const p2 = await defaultMatrixInversed.mult(wordRect.x2, wordRect.y2)

                const rect = new Math.Rect(p1.x, p1.y, p2.x, p2.y);
                const quad = rect.toQuad();
                
                documentWords[i].push({
                  text: wordText,
                  quad: quad,
                  rect: rect
                })
              }
            }
          }
        }
        console.log(documentWords);

        //highlight words
        for (const [key, value] of Object.entries(documentWords)) {
          const pageNumber = key;
          const words = value;

          for (var w = 0; w < words.length; w++) {
            const word = words[w];

            const annot = new Annotations.TextHighlightAnnotation({
              PageNumber: pageNumber,
              Quads: [word.quad],
              StrokeColor: new Annotations.Color(255, 0, 0, 0.3),
            });

            annotationManager.addAnnotation(annot);
            annotationManager.redrawAnnotation(annot);

            await timeout(500);
          }
        }
      }

      UI.setHeaderItems(header => {
        header.push({
          type: 'actionButton',
          img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18.5 20C18.5 20.275 18.276 20.5 18 20.5H6C5.724 20.5 5.5 20.275 5.5 20V17H4V20C4 21.104 4.896 22 6 22H18C19.104 22 20 21.104 20 20V9.828C20 9.298 19.789 8.789 19.414 8.414L13.585 2.586C13.57 2.57105 13.5531 2.55808 13.5363 2.5452C13.5238 2.53567 13.5115 2.5262 13.5 2.516C13.429 2.452 13.359 2.389 13.281 2.336C13.2557 2.31894 13.2281 2.30548 13.2005 2.29207C13.1845 2.28426 13.1685 2.27647 13.153 2.268C13.1363 2.25859 13.1197 2.24897 13.103 2.23933C13.0488 2.20797 12.9944 2.17648 12.937 2.152C12.74 2.07 12.528 2.029 12.313 2.014C12.2933 2.01274 12.2738 2.01008 12.2542 2.00741C12.2271 2.00371 12.1999 2 12.172 2H6C4.896 2 4 2.896 4 4V13H5.5V4C5.5 3.725 5.724 3.5 6 3.5H12V8C12 9.104 12.896 10 14 10H18.5V20ZM13.5 4.621L17.378 8.5H14C13.724 8.5 13.5 8.275 13.5 8V4.621ZM8.75 11.5C8.33579 11.5 8 11.8358 8 12.25C8 12.6642 8.33579 13 8.75 13H15.25C15.6642 13 16 12.6642 16 12.25C16 11.8358 15.6642 11.5 15.25 11.5H8.75ZM2.75 14.25C2.33579 14.25 2 14.5858 2 15C2 15.4142 2.33579 15.75 2.75 15.75H9.25C9.66421 15.75 10 15.4142 10 15C10 14.5858 9.66421 14.25 9.25 14.25H2.75ZM8.75 17C8.33579 17 8 17.3358 8 17.75C8 18.1642 8.33579 18.5 8.75 18.5H15.25C15.6642 18.5 16 18.1642 16 17.75C16 17.3358 15.6642 17 15.25 17H8.75Z" fill="#212121"/></svg>',
          onClick: extractAndHighlightText
        });
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
