import {
  Modifier,
  BlockMapBuilder,
  EditorState,
  ContentBlock,
  genKey
} from "draft-js";

import Immutable from "immutable";

const { List, Map } = Immutable;

import config from "./config";
import createCombination from "./createCombination";

function insertCombination(editorState) {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  const afterRemoval = Modifier.removeRange(
    contentState,
    selectionState,
    "backward"
  );
  const targetSelection = afterRemoval.getSelectionAfter();
  const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
  const insertionTarget = afterSplit.getSelectionAfter();

  const tableBlock = createCombination(config).toArray();

  // const fragmentArray = tableBlock.push(
  //   new ContentBlock({
  //     key: genKey(),
  //     type: "unstyled",
  //     text: "",
  //     characterList: List()
  //   })
  // );

  const fragment = BlockMapBuilder.createFromArray(tableBlock);
  const withAtomicBlock = Modifier.replaceWithFragment(
    afterSplit,
    insertionTarget,
    fragment
  );

  const newContent = withAtomicBlock.merge({
    selectionBefore: selectionState,
    selectionAfter: withAtomicBlock.getSelectionAfter().set("hasFocus", true)
  });

  return EditorState.push(editorState, newContent, "insert-fragment");
}
module.exports = insertCombination;
