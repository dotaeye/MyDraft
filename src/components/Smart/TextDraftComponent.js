import React, { Component } from "react";
import { EditorState, SelectionState, Modifier, Editor } from "draft-js";

export default class TextComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || EditorState.createEmpty()
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

  onTextChange = value => {
    this.setState({ value }, () => {
      this.updateComponentData({
        [this.props.id]: value
      });
    });
  };

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
    const { value } = this.state;
    return (
      <div
        style={{
          padding: "0.5em"
        }}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <Editor
          ref={ref => (this.text = ref)}
          textAlignment={textAlign}
          placeholder={"文字"}
          editorState={value}
          onChange={this.onTextChange}
        />
      </div>
    );
  }
}
