import './App.css';
import { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';

class Point {
  //int x, y;
  constructor(x,y)
  {
      this.x=x;
      this.y=y;
  }
}

class line {
  //Point p1, p2;
  constructor(p1,p2)
  {
      this.p1=p1;
      this.p2=p2;
  }
};

function onLine(l1, p)
{
    if (p.x <= Math.max(l1.p1.x, l1.p2.x)
        && p.x >= Math.min(l1.p1.x, l1.p2.x)
        && (p.y <= Math.max(l1.p1.y, l1.p2.y)
            && p.y >= Math.min(l1.p1.y, l1.p2.y)))
        return true;
 
    return false;
}

function direction(a, b, c)
{
    let val = (b.y - a.y) * (c.x - b.x)
              - (b.x - a.x) * (c.y - b.y);
 
    if (val == 0)
 
        // Collinear
        return 0;
 
    else if (val < 0)
 
        // Anti-clockwise direction
        return 2;
 
    // Clockwise direction
    return 1;
}

function isIntersect(l1, l2)
{
    // Four direction for two lines and points of other line
    let dir1 = direction(l1.p1, l1.p2, l2.p1);
    let dir2 = direction(l1.p1, l1.p2, l2.p2);
    let dir3 = direction(l2.p1, l2.p2, l1.p1);
    let dir4 = direction(l2.p1, l2.p2, l1.p2);
 
    // When intersecting
    if (dir1 != dir2 && dir3 != dir4)
        return true;
 
    // When p2 of line2 are on the line1
    if (dir1 == 0 && onLine(l1, l2.p1))
        return true;
 
    // When p1 of line2 are on the line1
    if (dir2 == 0 && onLine(l1, l2.p2))
        return true;
 
    // When p2 of line1 are on the line2
    if (dir3 == 0 && onLine(l2, l1.p1))
        return true;
 
    // When p1 of line1 are on the line2
    if (dir4 == 0 && onLine(l2, l1.p2))
        return true;
 
    return false;
}

function checkInside(poly, p)
{
    // Create a point at infinity, y is same as point p
    let tmp=new Point(9999, p.y);
    let exline = new line( p, tmp );
    let count = 0;
    let i = 0;
    do {
 
        // Forming a line from two consecutive points of
        // poly
        let side = new line(poly[i], poly[(i + 1) % poly.length] );
        if (isIntersect(side, exline)) {
 
            // If side is intersects exline
            if (direction(side.p1, p, side.p2) == 0)
                return onLine(side, p);
            count++;
        }
        i = (i + 1)  % poly.length;
    } while (i != 0);
 
    // When count is odd
    return count & 1;
}

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
      const roomPath = room.getPath();
      const roomPoints = roomPath.map((path) => new Point(path.getX(), path.getY()))
      const centerX = annotationCenterPoint.getX();
      const centerY = annotationCenterPoint.getY();
      
      if(checkInside(roomPoints, new Point(centerX, centerY))){
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

