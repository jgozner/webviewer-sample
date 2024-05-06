import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  const LOCKED_PAGES = [2,3,4];

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true,
        //custom: JSON.stringify({LOCKED_PAGES}), We can also set this to be executed in the config file
        //config: "config.js"
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { documentViewer, Tools } = instance.Core;
      
      // Cache original mouse event functions
      Tools.Tool.prototype.__mouseLeftDown = Tools.Tool.prototype.mouseLeftDown;
      Tools.Tool.prototype.__mouseLeftDown = Tools.Tool.prototype.mouseLeftDown;
      
      function getPageCoor(e) {
        var tool = documentViewer.getToolMode();
        var loc = tool.getMouseLocation(e)
        var pageRange = documentViewer.getDisplayModeManager().getDisplayMode().getSelectedPages(loc, loc);
        var currPageIndex = (pageRange.first === null) ? pageRange.last : pageRange.first;
        
        if(!currPageIndex){ 
          return null;
        }
        return documentViewer.getDisplayModeManager().getDisplayMode().windowToPage(loc, currPageIndex);
      }
      
      //RectangleCreateTool 
      Tools.Tool.prototype.mouseLeftDown = function(e) {
        var coor = getPageCoor(e)
        // If pageNumber matches, stop propagating the event.
        if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
          return;
        };
        return Tools.Tool.prototype.__mouseLeftDown.apply(this, arguments);
      }

      //Rectagle annotation 
      Tools.Tool.prototype.mouseLeftDown = function(e) {
        var coor = getPageCoor(e)
        // If pageNumber matches, stop propagating the event.
        if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
          return;
        };
        return Tools.Tool.prototype.__mouseLeftDown.apply(this, arguments);
      }

      //Will need to do the following for all the other tools.

    });
  }, []);

  return (
    <div className="App">
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
