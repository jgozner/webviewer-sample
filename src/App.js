import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);

  const toggleHotkeys = () => {
    instance.UI.hotkeys.on(instance.UI.hotkeys.Keys.CTRL_Z);            
    instance.UI.hotkeys.on(instance.UI.hotkeys.Keys.CTRL_Y);
  }
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      instance.UI.hotkeys.off(instance.UI.hotkeys.Keys.CTRL_Z);            
      instance.UI.hotkeys.off(instance.UI.hotkeys.Keys.CTRL_Y);
    });
  }, []);

  return (
    <div className="App">
      <button onClick={toggleHotkeys}>Toggle Hotkeys</button>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
