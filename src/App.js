import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {
      const { UI, Core } = instance;

      Core.PDFNet.initialize("demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b")

      //Set files here
      const file1 = await Core.createDocument("");
      const file2 = await Core.createDocument("");

      const newDoc = await Core.PDFNet.PDFDoc.create();

      newDoc.lock();

      const doc1 = await file1.getPDFDoc();
      const doc2 = await file2.getPDFDoc();

      const itr = await doc1.getPageIterator(1);
      const itr2 = await doc2.getPageIterator(1);

      const pages = [];

      let i = 0;
      for (itr; await itr.hasNext(); itr.next()) {
        const page = await itr.current();
        pages[i] = [page];
        i++;
      }

      i = 0;
      for (itr2; await itr2.hasNext(); itr2.next()) {
        const page = await itr2.current();
        (pages[i] || (pages[i] = [null])).push(page);
        i++;
      }

      const p = Promise.resolve();

      const diffOptions = await Core.PDFNet.PDFDoc.createDiffOptions();
      //You can change the blend mode
      //diffOptions.setBlendMode(Core.PDFNet.GState.BlendMode.e_bl_overlay);

      pages.forEach(([p1, p2]) => {
        p.then(async () => {
          if (!p1) {
            p1 = new Core.PDFNet.Page(0);
          }
          if (!p2) {
            p2 = new Core.PDFNet.Page(0);
          }

          return newDoc.appendVisualDiff(p1, p2, null);
        }); 
      });

      await p;

      newDoc.unlock();

      UI.loadDocument(newDoc, {
        pdftronServer: null,
        extension: 'pdf',
      });

    })

  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
