import React, { Component } from "react";
import { EditorState, SelectionState, Modifier } from "draft-js";

export default class ImageComponnet extends Component {
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

  onAddImage = value => {
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

  onReadFile = event => {
    if (this.file.files && this.file.files.length > 0) {
      const f = this.file.files[0];
      const fr = new FileReader();
      fr.addEventListener("load", e => {
        this.onAddImage(e.target.result);
        this.file.value = null;
      });
      fr.readAsDataURL(f);
    }
  };

  onFocus = () => {
    const { setReadOnly } = this.props.blockProps;
    setReadOnly(true);
  };
  onBlur = () => {
    const { setReadOnly } = this.props.blockProps;
    setReadOnly(false);
  };

  onPickerImage = () => {
    this.file.click();
  };

  render() {
    const { value } = this.state;
    return (
      <div onFocus={this.onFocus} onBlur={this.onBlur}>
        {value ? (
          <img
            src={value}
            onClick={this.onPickerImage}
            style={{
              width: "100%",
              height: "100%"
            }}
          />
        ) : (
          <div
            onClick={this.onPickerImage}
            style={{
              width: "100%",
              height: "100%"
            }}
          >
            上传图片
          </div>
        )}

        <input
          type="file"
          ref={ref => (this.file = ref)}
          accept="image/*"
          onChange={this.onReadFile}
          style={{
            display: "none"
          }}
        />
      </div>
    );
  }
}
