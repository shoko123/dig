/*
I found this easy to use library for zooming that does exactly what I wanted.
(rather than integrating medium-zoom that required too much work)
https://github.com/pmad01/image-zoom-by-transform
Thank you pmad01!
*/

export default class Zoomy {
  /**
   *The HTML element we want to transform
   * @type {HTMLElement}
   */
  el

  /**
   *The box element that contains the image
   * @type {HTMLElement}
   */
  boxEl

  /**
   * Checks if the element is enabled or not
   * @type {boolean}
   */
  enabled = true

  /**
   * Checks if mouse is clicked
   * @type {boolean}
   */
  mouseIsDown = false

  /**
   * Checks if we are moving the image
   * @type {boolean}
   */
  isDragging = false

  /**
   * The X coordinate of the cursor after the previous transformation
   * @type {number}
   */
  lastMouseX = 0

  /**
   * The Y coordinate of the cursor after the previous transformation
   * @type {number}
   */
  lastMouseY = 0

  /**
   * Options applicable to an instance of the class
   * @type {Object}
   */
  options = {
    boundaryElementId: null,
    zoomUpperConstraint: null,
  }

  /**
   * @param elementId
   * @param {object} options
   */
  constructor(elementId, options) {
    this.el = document.getElementById(elementId)
    this.options = { ...options }
    this.boxEl = this.options.boundaryElementId
      ? document.getElementById(this.options.boundaryElementId)
      : document.body
    this.options.zoomUpperConstraint ||= 4
    var fn = this.handleMouseEvents.bind(this)
    if (this.boxEl) {
      this.boxEl.addEventListener('wheel', fn, { passive: false })
    } else {
      this.el.addEventListener('wheel', fn, { passive: false })
    }

    this.el.addEventListener('mousedown', fn, { passive: false })
    ;['mousemove', 'mouseup', 'mouseout'].forEach((event) => {
      document.addEventListener(event, fn, { passive: false })
    })
  }

  /**
   * 'Resize and move image' (output) on screen based on 'mouse action' (input)
   * @param {Event} e
   */
  transformByMouseEvent(e) {
    var currentMouseX = e.x,
      currentMouseY = e.y,
      moveXBy = 0,
      moveYBy = 0,
      img = this.el.getBoundingClientRect(),
      box = this.boxEl.getBoundingClientRect(),
      widthFits = img.width <= box.width,
      heightFits = img.height <= box.height,
      currentLeft = img.left,
      currentRight = img.right,
      currentTop = img.top,
      currentBottom = img.bottom

    this.isDragging = false
    if (e.type === 'mousedown') {
      this.mouseIsDown = true
    }
    if (e.type === 'mouseup') {
      this.mouseIsDown = false
    }
    if (this.mouseIsDown && e.type === 'mousemove') {
      this.isDragging = true
    }

    if (this.isDragging) {
      var newLeft = currentLeft + (currentMouseX - this.lastMouseX),
        newRight = currentRight + (currentMouseX - this.lastMouseX),
        newTop = currentTop + (currentMouseY - this.lastMouseY),
        newBottom = currentBottom + (currentMouseY - this.lastMouseY),
        heightInsideCanvas = img.top >= box.top && img.bottom <= box.bottom,
        widthInsideCanvas = img.left >= box.left && img.right <= box.right

      //flag to check if image can freely be moves on the x-axis(horizontally)
      var freeX =
        (img.width > box.width || // image overflows canvas
          !widthInsideCanvas) && // or simply positioned off canvas
        !(
          (
            (newLeft < box.left && //hard left wall
              newLeft <= currentLeft && //if going left
              newRight <= box.right) || //or right edge is visible
            (newRight > box.right && //hard right wall
              newRight >= currentRight && //if going right
              newLeft >= box.left)
          ) //or left edge is visible
        )

      //flag to check if image can freely be moves on the y-axis(vertically)
      var freeY =
        (img.height > box.height || // image bigger than canvas
          !heightInsideCanvas) && // or image outside of canvas
        !(
          (
            (newTop < box.top && //hard ceiling
              newTop <= currentTop && //if going up
              newBottom <= box.bottom) || //or bottom is visible
            (newBottom > box.bottom && //hard floor
              newBottom >= currentBottom && //if going down
              newTop >= box.top)
          ) //or top is visible
        )

      if (freeX) {
        moveXBy = currentMouseX - this.lastMouseX
      }
      if (freeY) {
        moveYBy = currentMouseY - this.lastMouseY
      }
    }

    if (e.deltaY) {
      var imgCenterX = img.left + img.width / 2,
        imgCenterY = img.top + img.height / 2,
        boxCenterX = box.left + box.width / 2,
        boxCenterY = box.top + box.height / 2,
        newImageCenterXDiff = currentMouseX - imgCenterX,
        newImageCenterYDiff = currentMouseY - imgCenterY,
        ElContainsTarget = this.el.contains(e.target),
        isShrinking = e.deltaY > 0,
        enlargeOrShrinkBy = 0,
        zoomFactor = 0.1,
        currentScale = img.width / this.el.offsetWidth

      enlargeOrShrinkBy = (e.deltaY > 0 ? -zoomFactor : zoomFactor) * currentScale

      var newScale = currentScale + enlargeOrShrinkBy

      if (
        newScale > this.options.zoomUpperConstraint || //upper limit
        newScale < 0.9 //lower limit
      ) {
        enlargeOrShrinkBy = 0
      }

      if (!ElContainsTarget) {
        if (isShrinking) {
          //get distance between image's center and the center of the box
          var diffX = imgCenterX - boxCenterX,
            diffY = imgCenterY - boxCenterY,
            scaleDiff = 1 - currentScale,
            //ratio of distance to scaling
            adjustedDiffX = diffX / scaleDiff,
            adjustedDiffY = diffY / scaleDiff

          //adjust dhe difference based on how much we are shrinking, so that for every shrinkage the
          //transition back to the box center is done smoothly, as it shrinks,it also goes back synchronously
          moveXBy = -adjustedDiffX * enlargeOrShrinkBy
          moveYBy = -adjustedDiffY * enlargeOrShrinkBy
        }
      } else {
        if (!widthFits && !heightFits) {
          //ratio of distance to scaling
          adjustedDiffX = newImageCenterXDiff / currentScale
          adjustedDiffY = newImageCenterYDiff / currentScale
          moveXBy = -adjustedDiffX * enlargeOrShrinkBy
          moveYBy = -adjustedDiffY * enlargeOrShrinkBy
        }

        if (isShrinking) {
          var newWidth = this.el.offsetWidth * newScale,
            widthShrankBy = newWidth - img.width,
            oneSideWidthShrankBy = widthShrankBy / 2,
            newHeight = this.el.offsetHeight * newScale,
            heightShrankBy = newHeight - img.height,
            oneSideHeightShrankBy = heightShrankBy / 2,
            horizontalMove = moveXBy - oneSideWidthShrankBy,
            verticalMove = moveYBy - oneSideHeightShrankBy,
            visualMargin = 10

          newLeft = currentLeft + horizontalMove
          newRight = newLeft + newWidth
          newTop = currentTop + verticalMove
          newBottom = newTop + newHeight

          if (!widthFits) {
            if (newLeft > currentLeft) {
              var newLeftDistance = box.left - newLeft,
                movesRightTooMuch = newLeftDistance < -visualMargin

              if (movesRightTooMuch) {
                moveXBy += newLeftDistance + visualMargin
              }
            }

            if (newRight < currentRight) {
              var newRightDistance = box.right - newRight,
                movesLeftTooMuch = newRightDistance > visualMargin

              if (movesLeftTooMuch) {
                moveXBy += newRightDistance - visualMargin
              }
            }
          }

          if (!heightFits) {
            if (newTop > currentTop) {
              var newTopDistance = box.top - newTop,
                movesDownTooMuch = newTopDistance < -visualMargin

              if (movesDownTooMuch) {
                moveYBy += newTopDistance + visualMargin
              }
            }

            if (newBottom < currentBottom) {
              var newBottomDistance = box.bottom - newBottom,
                movesUpTooMuch = newBottomDistance > visualMargin

              if (movesUpTooMuch) {
                moveYBy += newBottomDistance - visualMargin
              }
            }
          }
        }
      }
    }

    this.transform(this.el, moveXBy, moveYBy, enlargeOrShrinkBy)
    e.preventDefault()

    this.lastMouseX = currentMouseX
    this.lastMouseY = currentMouseY
  }

  /**
   * This gets the transformation matrix data in real time
   * @return {{scaleX: number, scaleY: number, translateY: number, translateX: number, skewX: number, skewY: number}}
   */
  getMatrix() {
    var matrix = this.el.style.transform?.substring(7)
    if (matrix) {
      matrix = matrix
        .slice(0, matrix.length - 1)
        .split(',')
        .map(parseFloat)
    } else {
      matrix = [1, 0, 0, 1, 0, 0]
    }
    return {
      scaleX: matrix[0],
      skewY: matrix[1],
      skewX: matrix[2],
      scaleY: matrix[3],
      translateX: matrix[4],
      translateY: matrix[5],
    }
  }

  /**
   * Side effect: transform an element's geometrical visual appearance
   * @param {HTMLElement} el
   * @param {int} moveXBy How much to move left-right, from where it already is. 0 leaves it as it is.
   * @param {int} moveYBy How much to move up-down, from where it already is. 0 leaves it as it is.
   * @param {number} enlargeOrShrinkBy How big-small it should get, compared to however it already is. In percentage compared to baseline. 1 being 100%. 0 leaves it as it is.
   * @return void
   */
  transform(el, moveXBy = 0, moveYBy = 0, enlargeOrShrinkBy = 0) {
    var m = this.getMatrix()
    m.translateX += moveXBy
    m.translateY += moveYBy
    m.scaleX += enlargeOrShrinkBy
    m.scaleY += enlargeOrShrinkBy
    this.el.style.transform = 'matrix(' + Object.values(m).join(', ') + ')'
  }

  /**
   * This method removes the event listeners from the instance element of the class.
   */
  detach() {
    if (this.boxEl) {
      this.boxEl.removeEventListener('wheel', this.handleMouseEvents)
    } else {
      this.el.removeEventListener('wheel', this.handleMouseEvents)
    }
    this.el.removeEventListener('mousedown', this.handleMouseEvents)
    ;['mousemove', 'mouseup', 'mouseout'].forEach((event) =>
      document.removeEventListener(event, this.handleMouseEvents),
    )

    //This is my additional in order to reset transforms when loading a new image.
    this.el.style.transform = 'none'
  }

  /**
   * This method enables the instance of the class
   */
  enable() {
    this.enabled = true
  }

  /**
   * This method disables the instance of the class
   */
  disable() {
    this.enabled = false
  }

  /**
   * Handles all mouse events
   * @param {MouseEvent} e
   * @return {boolean}
   */
  handleMouseEvents(e) {
    if (!this.enabled) {
      return false
    }

    this.transformByMouseEvent(e)
  }
}
