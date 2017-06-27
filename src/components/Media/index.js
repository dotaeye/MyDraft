import React, { Component } from "react";
import { EditorState, SelectionState, Modifier } from "draft-js";
import Input from "../Input";
import styles from "./style.css";

export default class Media extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.props.blockProps.onChange;
  }

  remove = () => {
    const { editorState } = this.props.blockProps;
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const keyAfter = content.getKeyAfter(this.props.block.key);
    const blockMap = content.getBlockMap().delete(this.props.block.key);
    const withoutAtomicBlock = content.merge({
      blockMap,
      selectionAfter: selection
    });
    const newState = EditorState.push(
      editorState,
      withoutAtomicBlock,
      "remove-range"
    );
    const newSelection = new SelectionState({
      anchorKey: keyAfter,
      anchorOffset: 0,
      focusKey: keyAfter,
      focusOffset: this.props.block.getLength()
    });
    const newEditorState = EditorState.forceSelection(newState, newSelection);
    this.onChange(newEditorState);
  };

  updateData = data => {
    const { editorState } = this.props.blockProps;
    const content = editorState.getCurrentContent();
    const selection = new SelectionState({
      anchorKey: this.props.block.key,
      anchorOffset: 0,
      focusKey: this.props.block.key,
      focusOffset: this.props.block.getLength()
    });

    const newContentState = Modifier.mergeBlockData(content, selection, data);
    const newEditorState = EditorState.push(editorState, newContentState);

    this.onChange(newEditorState);
  };

  onDescChange = event => {
    event.stopPropagation();
    this.updateData({ desc: event.target.value });
  };

  render() {
    // Should we use immutables?
    const { block, contentState } = this.props;
    const { setReadOnly } = this.props.blockProps;
    const entityData = contentState.getEntity(block.getEntityAt(0)).getData();
    const data = {
      ...entityData,
      ...block.getData().toObject()
    };
    return (
      <div
        className={styles.mediaContainer}
        onBlur={() => {
          setReadOnly(false);
        }}
        onFocus={() => {
          setReadOnly(true);
        }}
      >
        <div className={styles.mediaContent}>
          <img src={data.src} alt="" className={styles.mediaImage} />
          <div className={styles.mediaRemove} onClick={this.remove}>X</div>
        </div>
        <div className={styles.mediaData}>
          <Input
            placeholder="图片描述"
            value={data.desc}
            onChange={this.onDescChange}
          />
        </div>
      </div>
    );
  }
}
