## Draft-js Study

> Draft-js For WebView Bridge


Some Source Code Change, Focus event has bug with webview.

文件 /draft-js/lib/DraftEditor.react.js

```
DraftEditor.prototype._focus = function _focus(scrollPosition) {
    var editorState = this.props.editorState;

    var alreadyHasFocus = editorState.getSelection().getHasFocus();
    var editorNode = ReactDOM.findDOMNode(this.refs.editor);

    var scrollParent = Style.getScrollParent(editorNode);

    var _ref = scrollPosition || getScrollPosition(scrollParent);

    var x = _ref.x;
    var y = _ref.y;

    !(editorNode instanceof HTMLElement)
      ? process.env.NODE_ENV !== "production"
          ? invariant(false, "editorNode is not an HTMLElement")
          : invariant(false)
      : void 0;
    editorNode.focus();

    //  some time mobile phone keyboard show,and the viewport height has bug, so need handle the foucs event manually
    //   if (scrollParent === window) {
    //     window.scrollTo(x, y);
    //   } else {
    //     Scroll.setTop(scrollParent, y);
    //   }


    // On Chrome and Safari, calling focus on contenteditable focuses the
    // cursor at the first character. This is something you don't expect when
    // you're clicking on an input element but not directly on a character.
    // Put the cursor back where it was before the blur.
    if (!alreadyHasFocus) {
      this.update(
        EditorState.forceSelection(editorState, editorState.getSelection())
      );
    }
  };

```