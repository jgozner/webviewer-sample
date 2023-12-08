import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import Select from 'react-select';

function App() {
  const viewer = useRef(null);

  const [instance, setInstance] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const officeEditor = useRef();
  const copyTool = useRef();

  const options = [
    { value: '<i:chocolate:>', label: 'Chocolate' },
    { value: '<i:strawberry:>', label: 'Strawberry' },
    { value: '<i:vanilla:>', label: 'Vanilla' },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(selectedOption.value)
    copyTool.current = true;
    alert(`${selectedOption.value} copied to clipboard`)
  }

  const paste = () => {
    if(!copyTool.current) return;

    copyTool.current = false;
    officeEditor.current.pasteText(false)
  }

  const onChange = async (selected) => {
    setSelectedOption(selected)
    await navigator.clipboard.writeText(selected.value)
    copyTool.current = true;
    alert(`${selected.value} copied to clipboard`)
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/Test.docx',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        enableOfficeEditing: true,
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);
      copyTool.current = false

      const { documentViewer } = instance.Core;

      documentViewer.addEventListener('mouseLeftUp', async evt => {
        paste();
      });

      documentViewer.addEventListener("documentLoaded", () => {
        officeEditor.current = documentViewer.getDocument().getOfficeEditor();
      });
      
    });
  }, []);



  return (
    <div className="App" >
      <Select
          styles={styles}
          value={selectedOption}
          onChange={onChange}
          options={options}/>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

const styles = {
  container: base => ({
    ...base,
    flex: 1
  })
};

export default App;
