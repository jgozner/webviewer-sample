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
      const { TextExtractor  } = PDFNet;

      documentViewer.addEventListener("documentLoaded", async () => {
        await PDFNet.initialize();
        console.log("Extracting text")
        //Extract Text
        const document = await documentViewer.getDocument();
        const pdfDoc = await document.getPDFDoc();
        const pageCount = await pdfDoc.getPageCount();
        const txtExtractor = await TextExtractor.create();
        //await txtExtractor.setRightToLeftLanguage(true);

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

        console.log("Highlighting words")
        //highlight words
        for(const [key, value] of Object.entries(documentWords)){
          const pageNumber = key;
          const words = value;
          const page = await pdfDoc.getPage(Number(pageNumber));

          for(var w = 0; w < words.length; w++){
            const word = words[w];
            const rect = new PDFNet.Rect(word.rect.x1, word.rect.y1, word.rect.x2, word.rect.y2);
            const hl = await PDFNet.HighlightAnnot.create(
              pdfDoc,
              rect
            );
            await hl.setColor(await PDFNet.ColorPt.init(0, 1, 0), 3);
            await hl.refreshAppearance();
            await page.annotPushBack(hl);
          }
        }

        console.log("Saving document")
        const buffer = await pdfDoc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);

        // save document
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url);
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
