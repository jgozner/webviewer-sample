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
        licenseKey:"demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        css: "/files/webviewer.css",
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {
      setInstance(instance);

      const { Core, UI } = instance;
      const { documentViewer } = Core;

      //Here we scale
      const prepareDocument = async () => {
        await Core.PDFNet.initialize("demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b")
        const pages = [];
        let minWidth = 10000;

        const pdfDoc = await Core.PDFNet.PDFDoc.createFromURL("/files/WebviewerDemoDoc.pdf");
        const documentPageCount = await pdfDoc.getPageCount();

        for (var i = 1; i < documentPageCount; i++) {
          const page = await pdfDoc.getPage(i);
          const pageRotation = await page.getRotation();
          const pageWidth = await page.getPageWidth();
          const pageHeight = await page.getPageHeight();

          pages.push({
            number: i,
            rotation: pageRotation,
            width: pageWidth,
            height: pageHeight,
          });

          if (pageWidth < minWidth) {
            minWidth = pageWidth;
          }
        }

        for (var i = 0; i < pages.length; i++) {
          const pageInfo = pages[i];

          if (pageInfo.width != minWidth) {
            const scale = minWidth / pageInfo.width;

            const page = await pdfDoc.getPage(pageInfo.number);
            await page.scale(scale)
          }
      
        }
        instance.UI.loadDocument(pdfDoc);
      };

      prepareDocument();
    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
