import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/Sample.pdf',
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { documentViewer, Search, PDFNet, Math } = instance.Core;


      const searchItems = ["in relation to Facility B, the period from and including the date of this Agreement to and including the earlier of:  (i)  the last day of the Certain Funds Period; and", "(ii)  the date on which the Available Facility in relation to Facility B, has been reduced  to zero or cancelled in full;"]
      const searchResults = [];

      const searchText = (searchItem) => {
        return new Promise(resolve => {
          const mode =  Search.Mode.HIGHLIGHT;
          const searchOptions = {
            // If true, a search of the entire document will be performed. Otherwise, a single search will be performed.
            fullSearch: true,
            // The callback function that is called when the search returns a result.
            onResult: result => {
              if (result.resultCode === Search.ResultCode.FOUND) {
                //Let's increase the padding of the all the quads
                var quads = [];
                for(var i = 0; i < result.quads.length; i++){
                  var quadPoint = result.quads[i].getPoints();
                  var quad = new Math.Quad(quadPoint.x1, quadPoint.y1, quadPoint.x2, quadPoint.y2, quadPoint.x3, quadPoint.y3, quadPoint.x4, quadPoint.y4);
                  var rect = quad.toRect();
                  var newRect = new Math.Rect(rect.x1 - 2, rect.y1 - 2, rect.x2 + 2, rect.y2 + 2);
                 quads.push(newRect.toQuad())
                }
                result.quads = quads;
                searchResults.push(result);
              }
            },
            onDocumentEnd: () => {
              documentViewer.displayAdditionalSearchResults(searchResults);
              resolve()
            }
          };
      
          documentViewer.textSearchInit(searchItem, mode, searchOptions);
        })
      }
      
      documentViewer.addEventListener("documentLoaded", async () => {
        await searchText(searchItems[0])
        await searchText(searchItems[1])
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
