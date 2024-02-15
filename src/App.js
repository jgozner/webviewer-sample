import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  const fillTemplate = async () => {
    const { documentViewer } = instance.Core;

		const options = {
      "first_name": "Jack",
      "last_name": "Bill"
    };

    const document = documentViewer.getDocument();
		// apply the template values to the currently loaded document in WebViewer
		await document.applyTemplateValues(options);
    const fileData = await document.getFileData({downloadType: 'templateFilledOffice'})
    //Let us download it. (We can also send it to a backend)
    const blob = new Blob( [ fileData ], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } );	
    const url = URL.createObjectURL(blob);
    window.open(url);
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      const { UI } = instance;

      UI.loadDocument('/files/template.docx',{
        officeOptions: {
          doTemplatePrep: true
        }
      });
    });
  }, []);

  return (
    <div className="App">
    <button onClick={fillTemplate}>Fill</button>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
