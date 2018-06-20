import React, { Component } from "react";
import { EditorState, SelectionState, Modifier } from "draft-js";

export default class TextComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
    this.onChange = this.props.blockProps.onChange;
  }

  updateComponentData = data => {
    const { editorState } = this.props.blockProps;
    const content = editorState.getCurrentContent();
    const selection = new SelectionState({
      anchorKey: this.props.block.key,
      anchorOffset: 0,
      focusKey: this.props.block.key,
      focusOffset: this.props.block.getLength()
    });

    const newContentState = Modifier.mergeBlockData(content, selection, data);
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-block-data"
    );

    this.onChange(newEditorState);
  };

  onTextChange = event => {
    const { allowAutoHeight } = this.props.options;
    const value = event.target.value;
    const resize = () => {
      this.text.style.height = "auto";
      this.text.style.height = this.text.scrollHeight + "px";
    };
    // if (allowAutoHeight) {
    window.setTimeout(resize, 0);
    // }

    this.setState(
      {
        value
      },
      () => {
        this.updateComponentData({
          [this.props.id]: value
        });
      }
    );
  };

  // onKeyDown = event => {
  //   const { allowAutoHeight } = this.props.options;
  //   if (event.keyCode === 13) {
  //     event.preventDefault();
  //     if (!allowAutoHeight) return;
  //     this.setState({
  //       value: this.state.value + "\n"
  //     });
  //   }
  // };

  onFocus = () => {
    const { setReadOnly } = this.props.blockProps;
    setReadOnly(true);
  };
  onBlur = () => {
    const { setReadOnly } = this.props.blockProps;
    setReadOnly(false);
  };

  render() {
    const { textAlign, fontSize, singleRow } = this.props.options;
    const { flex } = this.props;
    return (
      <div
        style={{
          padding: "0.5em",
          flex
        }}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <textarea
          ref={ref => (this.text = ref)}
          style={{
            outline: 0,
            border: 0,
            backgroundColor: "transparent",
            textAlign,
            fontSize: fontSize + "em",
            width: "100%",
            resize: "none"
          }}
          rows={1}
          placeholder={"文字"}
          value={this.state.value}
          onKeyDown={this.onKeyDown}
          onChange={this.onTextChange}
        />
      </div>
    );
  }
}
