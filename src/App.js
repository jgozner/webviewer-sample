import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    WebViewer.Iframe(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        enableRedaction: true,
        ui: "legacy",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {


      const { documentViewer, Tools } = instance.Core;
      const document = instance.UI.iframeWindow.document;
      const redactionTool = documentViewer.getTool(Tools.ToolNames.REDACTION);

      const options = ['Option 1', 'Option 2', 'Option 3'];
      //Set default here but could change this logic
      redactionTool.defaults.OverlayText = options[0];
      
      instance.UI.setHeaderItems(header => {
        const select = document.createElement('select');
        // Loop through options and add to select
        options.forEach((text, index) => {
          const option = document.createElement('option');
          option.value = text;
          option.textContent = text;
          select.appendChild(option);
        });

        select.addEventListener('change', function () {
          const selectedValue = select.value;
          redactionTool.defaults.OverlayText = selectedValue;
        });
  
        const renderSelect = () =>  { return select };

        const newCustomElement = {
          type: 'customElement',
          render: renderSelect,
        };

        const items = header.getHeader('toolbarGroup-Redact');
        header.getHeader('toolbarGroup-Redact').get("redactionToolGroupButton").insertAfter(newCustomElement)
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
