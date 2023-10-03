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
        initialDoc: '/files/Signature.pdf',
        licenseKey: "demo:1688745488452:7c640dad0300000000ff98c75e9e3a6477a0d966fddd63ac8543da906b",
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);
      const {annotationManager, documentViewer, Annotations} = instance.Core;

      const tool = instance.Core.documentViewer.getTool('AnnotationCreateSignature');
      //tool.setSigningMode(instance.Core.Tools.SignatureCreateTool.SigningModes.APPEARANCE);

      annotationManager.addEventListener('annotationChanged',(annotations, action) => {
        if (action === 'add') {
          const addedSignature = annotations[0];
          console.log("Annotation added:",annotations[0])
          const signatureWidgetAnnots = annotationManager.getAnnotationsList().filter(
            annot => annot instanceof Annotations.SignatureWidgetAnnotation
          );
          console.log(signatureWidgetAnnots)
          console.log("------------------------------")
  
          signatureWidgetAnnots.forEach(async(signatureWidgetAnnot) => {
            console.log(await signatureWidgetAnnot.getAssociatedSignatureAnnotation())
            //check if the added signature matches the siganture associated
            const signatureAnnotation = await signatureWidgetAnnot.getAssociatedSignatureAnnotation();

            if(signatureAnnotation == addedSignature){
              console.log(true)
             console.log(await signatureWidgetAnnot.getWidth())

            }
          })
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
