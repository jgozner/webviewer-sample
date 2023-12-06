import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [annotation, setAnnotation] = useState();
  const [selectedValue, setSelectedValue] = useState('');
  const [optionData, setOptionData] = useState([{
    value: "1@gmail.com",
    text: `1@gmail.com ( Viewer )`,
  },
  {
    value: "2@gmail.com",
    text: `2@gmail.com ( Admin )`,
  }])

  const newValues = [
    {
      value: "3@gmail.com",
      text: `3@gmail.com ( Viewer )`,
    },
    {
      value: "4@gmail.com",
      text: `4@gmail.com ( Admin )`,
    },
  ]

  const closeModal = () => {
    annotation.setCustomData('email', selectedValue);
    instance.Core.annotationManager.updateAnnotation(annotation);
    setAnnotation(undefined);
    setModalIsOpen(false);
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/WebviewerDemoDoc.pdf',
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);

      instance.UI.setHeaderItems(header => {
        header.push({
          type: 'actionButton',
          img: '<svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 309.059 309.059" xml:space="preserve"><g><g><path style="fill:#010002;" d="M280.71,126.181h-97.822V28.338C182.889,12.711,170.172,0,154.529,0S126.17,12.711,126.17,28.338 v97.843H28.359C12.722,126.181,0,138.903,0,154.529c0,15.621,12.717,28.338,28.359,28.338h97.811v97.843 c0,15.632,12.711,28.348,28.359,28.348c15.643,0,28.359-12.717,28.359-28.348v-97.843h97.822 c15.632,0,28.348-12.717,28.348-28.338C309.059,138.903,296.342,126.181,280.71,126.181z"/></g></g></svg>',
          onClick: () => {
            // save the annotations
            const newValue = newValues.pop();
            alert(`Adding ${newValue.text} to the list`);
            optionData.push(newValue);
          }
        });
      });

      instance.Core.annotationManager.addEventListener(
        'annotationDoubleClicked',
        annotation => {
          setSelectedValue(annotation.getCustomData("email"))
          setAnnotation(annotation);
          setModalIsOpen(true);
        }
      );

    });
  }, []);

  return (
    <div className="App">
      <Modal
        isOpen={modalIsOpen}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2>Modal</h2>
        <div>
          <select value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
            {optionData.map((option, index) => (
              <option key={index} value={option.value}>{option.text}</option>
            ))}
          </select>
        </div>
        <button onClick={closeModal}>close</button>
      </Modal>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
}

export default App;
