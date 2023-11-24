import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        fullAPI: true
      },
      viewer.current,
    ).then(async (instance) => {

      const { documentViewer, Search, Annotations, annotationManager  } = instance.Core;
      const { Rect } = instance.Core.Math;

      instance.UI.enableFeatures(['Redaction']);
      instance.UI.setToolbarGroup('toolbarGroup-Redact');
      instance.UI.setToolMode('AnnotationCreateRedaction');

      await instance.Core.PDFNet.initialize();
      //const docInput = await runScript(instance.Core.PDFNet, 'http://localhost:3000/files/WebviewerDemoDoc.pdf');
      instance.UI.loadDocument('http://localhost:3000/files/WebviewerDemoDoc.pdf');

      documentViewer.addEventListener("documentLoaded",async () => {
        //Show loading indicator
        instance.UI.openElements(['loadingModal'])

        const searchText = 'PDF|SDK';
        const mode =  Search.Mode.REGEX |Search.Mode.AMBIENT_STRING | Search.Mode.HIGHLIGHT;
        const searchPageResults = {};

        const searchOptions = {
          // If true, a search of the entire document will be performed. Otherwise, a single search will be performed.
          fullSearch: true,
          // The callback function that is called when the search returns a result.
          onResult: result => {
            if (result.resultCode === Search.ResultCode.FOUND) {

              const currQuad = result.quads[0].getPoints(); // getPoints will return Quad objects
              
              const x1 = Math.min(Math.min(Math.min(currQuad.x1, currQuad.x2), currQuad.x3), currQuad.x4);
              const x2 = Math.max(Math.max(Math.max(currQuad.x1, currQuad.x2), currQuad.x3), currQuad.x4);
              const y1 = Math.min(Math.min(Math.min(currQuad.y1, currQuad.y2), currQuad.y3), currQuad.y4);
              const y2 = Math.max(Math.max(Math.max(currQuad.y1, currQuad.y2), currQuad.y3), currQuad.y4);
              
              //Check if page number exists in search results          
              if(!searchPageResults[result.pageNum]){
                searchPageResults[result.pageNum] = []
              }

              // Adding some padding to showcase how to merge intersecting rects
              searchPageResults[result.pageNum].push({
                rect:  new Rect (x1 - 3, y1, x2 + 3, y2),
                text: result.resultStr,
              })
            }
          },
          onDocumentEnd: () => {
            //Add redaction annotations
            const redactionAnnotations = []

            for(const [page, searchResults] of Object.entries(searchPageResults)){
              for(var i = 0; i < searchResults.length; i++){
               
                const searchResult = searchResults[i];
                const tempSearchResults = searchResults.slice(0);
  
                //remove the current element we are on
                tempSearchResults.splice(i, 1);
  
                //Find first intersection
                const searchResultIntersectIndex = tempSearchResults.findIndex(x => x.rect.intersects(searchResult.rect))
  
                if(searchResultIntersectIndex > 0){
                  const intersectSearchResult = tempSearchResults[searchResultIntersectIndex];
  
                  let rect;
                  let text;
  
                  if(searchResult.rect.x1 < intersectSearchResult.rect.x1){
                    rect = new Rect (searchResult.rect.x1, searchResult.rect.y1, intersectSearchResult.rect.x2, intersectSearchResult.rect.y2);
                    text = `${searchResult.text} ${intersectSearchResult.text}`
                  }else{
                    rect = new Rect (intersectSearchResult.rect.x1, intersectSearchResult.rect.y1, searchResult.rect.x2, searchResult.rect.y2);
                    text = `${intersectSearchResult.text} ${searchResult.text} `
                  }
  
                  const redactionAnnotation = new Annotations.RedactionAnnotation({
                    PageNumber: page,
                    Rect: rect // Rect are in the form x1,y1,x2,y2
                  });
  
                  //Setting IsText to true allows WV to pull data from the trn-annot-preview value
                  redactionAnnotation.IsText = true;
                  redactionAnnotation.setCustomData("trn-annot-preview", text)
                  redactionAnnotations.push(redactionAnnotation)
  
                }else{
                  const redactionAnnotation = new Annotations.RedactionAnnotation({
                    PageNumber: page,
                    Rect: searchResult.rect // Rect are in the form x1,y1,x2,y2
                  });
  
                  //Setting IsText to true allows WV to pull data from the trn-annot-preview value
                  redactionAnnotation.IsText = true;
                  redactionAnnotation.setCustomData("trn-annot-preview", searchResult.text)
                  redactionAnnotations.push(redactionAnnotation)
                }
  
              }
            }

            annotationManager.addAnnotations(redactionAnnotations);
            // need to draw the annotations otherwise they won't show up until the page is refreshed
            annotationManager.drawAnnotationsFromList(redactionAnnotations);

            //Close loading indiciator
            instance.UI.closeElements(['loadingModal'])
          }
        };
    
        documentViewer.textSearchInit(searchText, mode, searchOptions);
      })
      
    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;

