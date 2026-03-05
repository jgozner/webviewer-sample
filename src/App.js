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
        css: "/files/webviewer.css"
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { Core, UI } = instance;
      const { documentViewer } = Core;
     
      documentViewer.addEventListener("documentLoaded", () => {
        //Option 1, modify the zoom for a specific page
        const documentPageCount = documentViewer.getPageCount();
        const pages = [];
        let minWidth = 10000;

        //Loop through all pages
        for (var i = 1; i < documentPageCount; i++) {
          const pageWidth = documentViewer.getPageWidth(i);
          const pageHeight = documentViewer.getPageHeight(i);
          const pageRotation = documentViewer.getCompleteRotation(i);

          pages.push({
            number: i,
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

        const pagesUpdated = [];
        for (var i = 0; i < pages.length; i++) {
          const page = pages[i];

          if (page.rotation == 0 || page.rotation == 2) {
            const scale = minWidth / page.width;

            documentViewer.setPageZoom(page.number, scale);
            pagesUpdated.push(page.number);
          } else {
            const scale = minWidth / page.height;

            documentViewer.setPageZoom(page.number, scale);
            pagesUpdated.push(page.number);
          }
        }

        documentViewer.recalculateLayout(pagesUpdated);
        documentViewer.updateView();
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
