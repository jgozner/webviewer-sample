import "./App.css";
import { useEffect, useRef, useState } from "react";
import WebViewer from "@pdftron/webviewer";

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: "/files/WebviewerDemoDoc.pdf",
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true,
        css: "/files/webviewer.css",
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { Core, UI } = instance;
      const { documentViewer } = Core;

      //Option 2, modify the page scale
      documentViewer.addEventListener("documentLoaded", async () => {
        const document = documentViewer.getDocument();
        const pdfDoc = await document.getPDFDoc();

        console.log(document);
        console.log(document.doc);
        
        const documentPageCount = documentViewer.getPageCount();
        const pages = [];
        let minWidth = 10000;

        //Loop through all pages
        for (var i = 1; i < documentPageCount; i++) {
          const page = await pdfDoc.getPage(i);
          const pageWidth = documentViewer.getPageWidth(i);
          const pageHeight = documentViewer.getPageHeight(i);
          const pageRotation = documentViewer.getCompleteRotation(i);

          pages.push({
            number: i,
            id: page.id,
            width: pageWidth,
            height: pageHeight,
            rotation: pageRotation,
          });

          if (pageRotation == 0 || pageRotation == 2) {
            if (pageWidth < minWidth) {
              minWidth = pageWidth;
            }
          } else {
            if (pageHeight < minWidth) {
              minWidth = pageHeight;
            }
          }
        }

        for (var i = 0; i < pages.length; i++) {
          const page = pages[i];

          if (page.rotation == 0 || page.rotation == 2) {
            if (page.width != minWidth) {
              const newHeight = Core.Math.round(
                page.height * (minWidth / page.width),
              );

              // Build a new page matrix for the new dimensions
              const matrix = Core.getPageMatrix(
                1,
                page.rotation,
                { width: minWidth, height: newHeight },
                0,
                true,
                Core.getCanvasMultiplier(),
              );

              console.log(matrix);
            }
            const scale = minWidth / page.width;
          } else {
            const newHeight = Math.round(page.height * (minWidth / page.width));

            // Build a new page matrix for the new dimensions
            const matrix = Core.getPageMatrix(
              1,
              page.rotation,
              { width: minWidth, height: newHeight },
              0,
              true,
              Core.getCanvasMultiplier(),
            );

            const newPageInfo = new Core.PageInfo();

            newPageInfo.setFromPageData({
              width: minWidth,
              height: newHeight,
              rotation: page.rotation,
              id: page.id,
              matrix,
              pageNum: page.number,
            });
            newPageInfo.contentChanged = true;
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
