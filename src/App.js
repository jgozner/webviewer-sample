import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

function App() {
  const viewer = useRef(null);
  
  let rooms = [];
  let roomId = 1;


  //Check if annotation is inside a room
  const checkIfAnnotationIsInRoom = (instance, annotation) => {
    for(var i = 0; i < rooms.length; i++){
      const room = rooms[i];

      const roomRect = room.getRect();
      const annotationRect = annotation.getRect();
      const annotationCenterPoint = annotationRect.getCenter();

      //This checks if the center point of the annotation is within a room 
      //This will allow us to ignore cases where the edge of an annotation 
      //is in another room
      const centerX = annotationCenterPoint.getX();
      const centerY = annotationCenterPoint.getY();

      if(centerX > roomRect.x1 && 
         centerX < roomRect.x2 && 
         centerY > roomRect.y1 &&
         centerY < roomRect.y2){
          annotation.setContents(`Linked to ${room.getContents()}`)
          return;
      }
    }
    //In the case we find no matches unlink the room
    annotation.setContents("Unlinked");
  }

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: '/files/Floorplan.pdf'
      },
      viewer.current,
    ).then(async(instance) => {

      instance.UI.enableFeatures([instance.UI.Feature.Measurement]);

      const { documentViewer, annotationManager, Annotations  } = instance.Core;
      
      annotationManager.addEventListener('annotationChanged', (annotations, action) => {
        if (action === 'add') {
          annotations.forEach((annot) => {
            if(annot.Subject == "Polygon" || annot.Subject == "Polyline"){
              //Ideally we would set the room id using setCustomData(key, value)
              //we are overriding the area/perimeter using setContents for demo purposes  
              annot.setContents(`Room ${roomId}`)
              rooms.push(annot);
              console.log(`Added Room ${roomId}`)
              roomId++;
            }else{
              checkIfAnnotationIsInRoom(instance, annot)
            }
          });
        } else if (action === 'modify') {
          annotations.forEach((annot) => {
            if(annot.Subject != "Polygon" && annot.Subject != "Polyline"){
                checkIfAnnotationIsInRoom(instance, annot)
            }
          })
        }
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

