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
        initialDoc: '/files/test-convert.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { documentViewer, PDFNet, Search, Annotations, Math } = instance.Core;

      const searchText = '“Fundamental Change” shall be deemed to have occurred at the time after the Notes are originally issued if any of the following occurs: (a) except in connection with transactions described in clause (b) below, a “person” or “group” within the meaning of Section 13(d) of the Exchange Act, other than the Guarantor, its direct or indirect Wholly-Owned Subsidiaries and the employee benefit plans of the Guarantor and its Wholly-Owned Subsidiaries, has become, and files a Schedule TO (or any successor schedule, form or report) or any schedule, form or report under the Exchange Act that discloses that such “person” or “group” has become, the direct or indirect “beneficial owner,” as defined in Rule 13d-3 under the Exchange Act, of shares of the Common Stock representing more than 50% of the voting power of the Common Stock, unless such beneficial ownership arises solely as a result of a revocable proxy delivered in response to a public proxy or consent solicitation made pursuant to the applicable rules and regulations under the Exchange Act and is not also then reportable on Schedule 13D or Schedule 13G (or any successor schedule) under the Exchange Act regardless of whether such a filing has actually been made; provided that no “person” or “group” shall be deemed to be the beneficial owner of any securities tendered pursuant to a tender or exchange offer made by or on behalf of such “person” or “group” until such tendered securities are accepted for purchase or exchange under such offer; (b) the consummation of (A) any recapitalization, reclassification or change of the Common Stock (other than a change to par value, or from par value to no par value, or changes resulting from a subdivision or combination) as a result of which the Common Stock would be converted into, or exchanged for, stock, other securities, other property or assets; (B) any share exchange, consolidation or merger of the Guarantor pursuant to which the Common Stock will be converted into cash, securities or other property or assets; or (C) any sale, lease or other transfer in one transaction or a series of transactions of all or substantially all of the consolidated assets of the Guarantor and its Subsidiaries, taken as a whole, to any Person other than one or more of the Guarantor’s direct or indirect Wholly-Owned Subsidiaries; provided that a transaction described in clause (A) or clause (B) in which the holders of all classes of the Guarantor’s Common Equity immediately prior to such transaction own, directly or indirectly, more than 50% of all classes of Common Equity of the continuing or surviving entity or transferee or the parent thereof immediately after such transaction in substantially the same proportions (relative to each other) as such ownership immediately prior to such transaction shall not be a Fundamental Change pursuant to this clause (b); 6 (c) the stockholders of the Guarantor or the Company’s general partner (or the holders of the Company’s equity interests, if the Company’s successor, if any, permitted by Article 11 is not a limited partnership), as the case may be, approve any plan or proposal for the liquidation or dissolution of the Guarantor or the Company, as applicable; (d) the Common Stock (or other Common Equity underlying the Notes) ceases to be listed or quoted on any of The New York Stock Exchange, The Nasdaq Global Select Market or The Nasdaq Global Market (or any of their respective successors); or (e) the Guarantor (or any Permitted Ventas Successor) ceases to, (A) directly or indirectly, control the Company (or any Permitted Ventas Realty Successor) or (B) for so long as the Company (or any Permitted Ventas Realty Successor) is organized as a limited partnership, be, either directly or through one or more of its Subsidiaries, the general partner of the Company (or any Permitted Ventas Realty Successor) (not including in the case of either (A) or (B), for the avoidance of doubt, following any transaction permitted by Article 11 whereby the Guarantor (or such Permitted Ventas Successor) consolidates or merges with the Company (or such Permitted Ventas Realty Successor)); provided, however, that a transaction or transactions described in clause (b) above shall not constitute a Fundamental Change, if at least 90% of the consideration received or to be received by the holders of the Common Stock, excluding cash payments for fractional shares and cash payments made in respect of dissenters’ appraisal rights, in connection with such transaction or transactions consists of shares of Common Equity that are listed or quoted on any of The New York Stock Exchange, The Nasdaq Global Select Market or The Nasdaq Global Market (or any of their respective successors) or will be so listed or quoted when issued or exchanged in connection with such transaction or transactions and as a result of such transaction or transactions the Notes become exchangeable into such consideration, excluding cash payments for fractional shares and cash payments made in respect of dissenters’ appraisal rights (subject to the provisions of Section 14.02(a)). If any transaction in which the Common Stock is replaced by the common stock or other Common Equity of another entity occurs, following completion of any related Make-Whole Fundamental Change Period (or, in the case of a transaction that would have been a Fundamental Change or a Make-Whole Fundamental Change but for the proviso immediately following clause (e) of this definition, following the effective date of such transaction), references to the Guarantor in this definition shall instead be references to such other entity.';
      const searchTokens = searchText.split(" ");
      const words = [];
      const wordsMetadata = [];
      const searchResults = [];

      const findTokens = (target, tokens, targetIndex, startIndex) => {
        if (!tokens.length) return startIndex;
        
        targetIndex ??= target.findIndex(el => el === tokens[0]);
    
        return tokens[0] !== target[targetIndex] ? -1 : findTokens(target.slice(targetIndex + 1), tokens.slice(1), 0, targetIndex == 0 ? startIndex : targetIndex)
      }
    
      const searchDocument = (searchItem, startPage) => {
        return new Promise(resolve => {

          const mode = Search.Mode.PAGE_STOP | Search.Mode.HIGHLIGHT;
          const searchOptions = {
            // If true, a search of the entire document will be performed. Otherwise, a single search will be performed.
            fullSearch: false,
            startPage: startPage,
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
                resolve()
              }
            }
          };
      
          documentViewer.textSearchInit(searchItem, mode, searchOptions);
        })
      }

      documentViewer.setSearchHighlightColors({
        // setSearchHighlightColors accepts both Annotations.Color objects or 'rgba' strings
        searchResult: new Annotations.Color(255, 255, 0, 0.2),
        activeSearchResult: 'rgba(0, 255, 0, 0.2)'
      });

      documentViewer.addEventListener('documentLoaded', async () => {
        await PDFNet.initialize();

        const doc = await documentViewer.getDocument().getPDFDoc();

        for(var pageIndex = 12; pageIndex < 14; pageIndex++){
          const firstPage = await doc.getPage(pageIndex);
    
          const txt = await PDFNet.TextExtractor.create();
          txt.begin(firstPage); // Read the page.
    
          // Extract words one by one.
          let line = await txt.getFirstLine();
          for (; (await line.isValid()); line = (await line.getNextLine()))
          {
              for (var word = await line.getFirstWord(); (await word.isValid()); word = (await word.getNextWord()))
              {
                  const text = await word.getString();

                  words.push(text);

                  wordsMetadata.push({pageNumber: pageIndex, text: text})
              }
          }
        }

        //Find string
        const searchStartIndex = findTokens(words, searchTokens);

        if(searchStartIndex >= 0){
          const searchEndIndex = searchStartIndex + searchTokens.length;

          const highlights = wordsMetadata.slice(searchStartIndex, searchEndIndex)
          
          var pageItems = {};

          //Let's break the string into it's respective pages
          for(var i = 0; i < highlights.length; i++){
            var highlight = highlights[i];
            if(!pageItems[highlight.pageNumber]){
              pageItems[highlight.pageNumber] = [];
            }
            pageItems[highlight.pageNumber].push(highlight.text)
          }

          for (var key in pageItems) {
            var searchTerm = pageItems[key].join(" ");
            await searchDocument(searchTerm, key)
          }
   
          documentViewer.displayAdditionalSearchResults(searchResults);

          //Scroll to first page of the search item found
          documentViewer.setCurrentPage(Number(Object.keys(pageItems)[0]), true)
        }



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
