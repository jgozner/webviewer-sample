import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  const [instance, setInstance] = useState(null);
  
  const logo = new Image(30, 30);
  logo.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMUlEQVR4nO3WvUoDQRSG4TdaBHs1iHUaU9iJ92ArilXAJhcS1ARzB7HXG7APKUQi+BfQCwhop5K1ShFl4AxMEdec2bNbiB98TZjhyezu7CzYZAU4BZ6BBgVlA3gFvqRbRaAl4DZAbygo2wH6IqsvJA3gCWgDy/zVVIALYCw9l6c61ywC18F99b0CFvKED2egvvU84X4K3MsLrQLTFHgqY8xzloL6dq3RnV9WG67ajTVJDXifA/V1W2wzK7oOjBSo70jmRqUMDCJQX3d4LMXAnQyorzujVakCEwN4ot1iLQPU91gD3xvCdxr4wxB+08CfhnCigR8N4QcNfGIIH2ngNblEWdGxfLGosjvnwfBT3dwDIrMv/zpmpXtkzCrQlHdvIlttCFxKh/JbImOaMuc/hPkGQDI9d2xI9/QAAAAASUVORK5CYII=";

  const extractAnnotationSignature = (signatureWidgetAnnot, annotation, docViewer) =>{
    //Random ID 
    const signatureId = "ccb8b7d9c849"

    const canvas = document.createElement('canvas');
    // Reference the annotation from the Document
    const pageMatrix = docViewer.getDocument().getPageMatrix(annotation.PageNumber);
    // Set the height & width of the canvas to match the annotation
    canvas.height = signatureWidgetAnnot.Height;
    canvas.width = signatureWidgetAnnot.Width;
    const ctx = canvas.getContext('2d');
    // place logo
    ctx.drawImage(logo, signatureWidgetAnnot.Width - 30, 0, 30, 30);
    // Place ID but first calculate the dimensions of the text
    const textMetrics = ctx.measureText(signatureId)

    let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    let textWidth = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft
    ctx.fillText(signatureId, signatureWidgetAnnot.Width - textWidth, signatureWidgetAnnot.Height - textHeight);
    // Translate the Annotation to the top Top Left Corner of the Canvas ie (0, 0)
    ctx.translate(-annotation.X, -annotation.Y);
    annotation.draw(ctx, pageMatrix);

    return canvas.toDataURL();
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/Signature.pdf',
        fullAPI: true
      },
      viewer.current,
    ).then((instance) => {
      setInstance(instance);
      const {annotationManager, documentViewer, Annotations, createDocument, } = instance.Core;

      annotationManager.addEventListener('annotationChanged',(annotations, action) => {
        console.log(action)
        if (action === 'add') {
          const addedSignature = annotations[0];

          const signatureWidgetAnnots = annotationManager.getAnnotationsList().filter(
            annot => annot instanceof Annotations.SignatureWidgetAnnotation
          );
  
          signatureWidgetAnnots.forEach(async(signatureWidgetAnnot) => {
            //check if the added signature matches the siganture associated
            const signatureAnnotation = (await signatureWidgetAnnot.getAssociatedSignatureAnnotation());

            if(signatureAnnotation == addedSignature){

              const newSignatureAnnotation = await extractAnnotationSignature(
                signatureWidgetAnnot,
                addedSignature,
                documentViewer
              );
           
              const newStamp = new Annotations.StampAnnotation();
              newStamp.Id = "signature-annotation";
              newStamp.X = signatureWidgetAnnot.X; 
              newStamp.Y = signatureWidgetAnnot.Y; 
              newStamp.Width = signatureWidgetAnnot.Width;
              newStamp.Height = signatureWidgetAnnot.Height;
              await newStamp.setImageData(newSignatureAnnotation);

              annotationManager.deleteAnnotation(addedSignature);
              signatureWidgetAnnot.setModified()
              await signatureWidgetAnnot.createSignatureAppearance(newStamp, annotationManager);
              annotationManager.redrawAnnotation(signatureWidgetAnnot);
             
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
