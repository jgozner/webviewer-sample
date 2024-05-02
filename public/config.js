let LOCKED_PAGES;

const { Tools, documentViewer } = instance.Core

// Cache original mouse event functions
Tools.RectangleCreateTool.prototype.__mouseLeftDown = Tools.RectangleCreateTool.prototype.mouseLeftDown;
Tools.LineCreateTool.prototype.__mouseLeftDown = Tools.LineCreateTool.prototype.mouseLeftDown;

// Parse locked pages
instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
    const custom = JSON.parse(instance.UI.getCustomData());
    LOCKED_PAGES = custom.LOCKED_PAGES;
});
      
// Cache original mouse event functions
Tools.RectangleCreateTool.prototype.__mouseLeftDown = Tools.RectangleCreateTool.prototype.mouseLeftDown;
Tools.LineCreateTool.prototype.__mouseLeftDown = Tools.LineCreateTool.prototype.mouseLeftDown;

function getPageCoor(e) {
  var tool = documentViewer.getToolMode();
  var loc = tool.getMouseLocation(e)
  var pageRange = documentViewer.getDisplayModeManager().getDisplayMode().getSelectedPages(loc, loc);
  var currPageIndex = (pageRange.first === null) ? pageRange.last : pageRange.first;
  
  if(!currPageIndex){ 
    return null;
  }
  return documentViewer.getDisplayModeManager().getDisplayMode().windowToPage(loc, currPageIndex);
}

//RectangleCreateTool 
Tools.RectangleCreateTool.prototype.mouseLeftDown = function(e) {
  var coor = getPageCoor(e)
  // If pageNumber matches, stop propagating the event.
  if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
    return;
  };
  return Tools.RectangleCreateTool.prototype.__mouseLeftDown.apply(this, arguments);
}

//Rectagle annotation 
Tools.LineCreateTool.prototype.mouseLeftDown = function(e) {
  var coor = getPageCoor(e)
  // If pageNumber matches, stop propagating the event.
  if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
    return;
  };
  return Tools.LineCreateTool.prototype.__mouseLeftDown.apply(this, arguments);
}