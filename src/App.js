import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';

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
      const {documentViewer, annotationManager, PDFNet, Annotations, Search } = instance.Core;
      const { TextExtractor  } = PDFNet;


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
                documentWords[i].push({
                  text: wordText
                })
              }
            }
          }
        }

        //highlight words

        console.log(documentWords)
     
        for(var pageNumber = 1; pageNumber <= pageCount; pageNumber++){

          if(!documentWords[pageNumber]) continue;

          for(var k = 0; k < documentWords[pageNumber].length; k++){
            
            const searchText = documentWords[pageNumber][k].text;
            const mode = Search.Mode.PAGE_STOP | Search.Mode.HIGHLIGHT
            const searchOptions = {
              // If true, a search of the entire document will be performed. Otherwise, a single search will be performed.
              fullSearch: true,
              startPage: pageNumber,
              endPage: pageNumber,
              // The callback function that is called when the search returns a result.
              onResult: result => {
                // with 'PAGE_STOP' mode, the callback is invoked after each page has been searched.
                if (result.resultCode === Search.ResultCode.FOUND) {
                  const textQuad = result.quads[0].getPoints(); // getPoints will return Quad objects
                  const annot = new Annotations.TextHighlightAnnotation({
                    PageNumber: result.pageNum,
                    Quads: [textQuad],
                    StrokeColor: new Annotations.Color(0, 255, 0, 1),
                  });
                  annotationManager.addAnnotation(annot);
                  annotationManager.redrawAnnotation(annot);
                }
              }
            };
        
            documentViewer.textSearchInit(searchText, mode, searchOptions);

            await timeout(200);
          }
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
