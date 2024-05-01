let LOCKED_PAGES;

const { Tools, documentViewer } = instance.Core

// Cache original mouse event functions
Tools.Tool.prototype.__mouseMove = Tools.Tool.prototype.mouseMove;
Tools.Tool.prototype.__mouseLeftDown = Tools.Tool.prototype.mouseLeftDown;
Tools.TextSelectTool.prototype.__mouseDoubleClick = Tools.TextSelectTool.prototype.mouseDoubleClick;

// Parse locked pages
instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
    const custom = JSON.parse(instance.UI.getCustomData());
    LOCKED_PAGES = custom.LOCKED_PAGES
});

// Helper function
function getPageCoor(e) {
    var tool = documentViewer.getToolMode();
    var loc = tool.getMouseLocation(e)
    var pageRange = documentViewer.getDisplayModeManager().getDisplayMode().getSelectedPages(loc, loc);

    var currPageIndex;
    if (typeof pageIndex === 'undefined') {
      currPageIndex = (pageRange.first === null) ? pageRange.last : pageRange.first;
      if (currPageIndex === null) {
        return null;
      }
    } else {
      currPageIndex = pageIndex;
    }
    return documentViewer.getDisplayModeManager().getDisplayMode().windowToPage(loc, currPageIndex);
}

// Override mouseMove function to capture the event
Tools.Tool.prototype.mouseMove = function(e) {
  var am = documentViewer.getAnnotationManager();
  var annotUnderMouse = am.getAnnotationByMouseEvent(e);
  if (annotUnderMouse && LOCKED_PAGES.indexOf(annotUnderMouse['PageNumber'] - 1) > -1) {
      return;
  }

  var coor = getPageCoor(e)
  // If pageIndex matches, stop propagating the event.
  if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
    return;
  };

  return Tools.Tool.prototype.__mouseMove.apply(this, arguments);
}

// Override mouseLeftDown function to capture the event
Tools.Tool.prototype.mouseLeftDown = function(e) {
    var coor = getPageCoor(e)
    // If pageNumber matches, stop propagating the event.
    if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) {
      return;
    };

    return Tools.Tool.prototype.__mouseLeftDown.apply(this, arguments);
}

// Override mouseDoubleClick function to capture the event
Tools.TextSelectTool.prototype.mouseDoubleClick = function(e) {
    var coor = getPageCoor(e)
    // If pageNumber matches, stop propagating the event.
    if (coor && LOCKED_PAGES.indexOf(coor.pageNumber) > -1) return;
    
    return Tools.TextSelectTool.prototype.__mouseDoubleClick.apply(this, arguments);
}