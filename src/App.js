import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const wvInstace = useRef();

  const switchTool = (toolName) => {
    const { documentViewer, Tools } = wvInstace.current.Core;
    let tool;
    switch(toolName){
      case "FREEHAND":
        tool = documentViewer.getTool(Tools.ToolNames.FREEHAND);
        break;
      case "CALLOUT":
        tool = documentViewer.getTool(Tools.ToolNames.CALLOUT);
        break;
      case "FREETEXT":
        tool = documentViewer.getTool(Tools.ToolNames.FREETEXT);
        break;
    }
    documentViewer.setToolMode(tool);
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
      },
      viewer.current,
    ).then(async (instance) => {
      wvInstace.current = instance;
      instance.UI.disableElements([
        'default-top-header'
      ]);
    });
  }, []);

  return (
    <div className="App">
      <div>
        <button onClick={() => switchTool("FREEHAND")}>Pencil</button>
        <button onClick={() => switchTool("CALLOUT")}>Callout</button>
        <button onClick={() => switchTool("FREETEXT")}>Free Text</button>
      </div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
