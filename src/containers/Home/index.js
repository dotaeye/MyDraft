import React from 'react';
import ReactDOM from 'react-dom';
import uuidv4 from 'uuid/v4';
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw,
  Entity,
  Editor
} from 'draft-js';
import Style from 'fbjs/lib/Style';
import getElementPosition from 'fbjs/lib/getElementPosition';
import getScrollPosition from 'fbjs/lib/getScrollPosition';
import 'draft-js/dist/Draft.css';
import { getParams } from '../../utils';
import insertDataBlock from '../../utils/insertDataBlock';
import Media from '../../components/Media';
import editorStyles from './home.less';

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return editorStyles.RichEditorBlockquote;
    case 'atomic':
      return editorStyles.RichEditorImage;
    case 'unstyled':
      return editorStyles.RichEditorUnStyle;
    default:
      return null;
  }
}

class Home extends React.Component {
  state = {
    editorState: EditorState.createEmpty(),
    readOnly: false,
    showTitle: window.showTitle,
    titleValue: window.titleValue,
    placehodler: window.contentPlacehodler,
    titlePlacehodler: window.titlePlacehodler
  };

  componentDidMount() {
    window.onWebViewBridgeMessage = this.onMessage.bind(this);
    this.titleValue = window.titleValue;
    if (window.initialRowJson) {
      this.onInitFromJson(window.initialRowJson);
    }
  }

  onMessage(message) {
    // const message = event.data;
    const action = JSON.parse(message);
    // 文档编辑命令
    if (action.type === 'DOCUMENT_COMMAND') {
      if (action.block) {
        this.onChange(
          RichUtils.toggleBlockType(this.state.editorState, action.command)
        );
      } else if (action.inline) {
        this.onChange(
          RichUtils.toggleInlineStyle(this.state.editorState, action.command)
        );
      }
      // 初始化
    } else if (action.type === 'INSERT_IMAGE') {
      this.onAddImage(action.data);
    } else if (action.type === 'GET_CONTENT') {
      this.postMessage({
        type: 'GET_CONTENT',
        value: this.getValue()
      });
    } else if (action.type === 'INITIAL_EDITOR') {
      this.onInitFromJson(action.data);
    } else if (action.type === 'HIDE_KEYBOARD') {
      this.editor.blur();
    }
  }

  onChange = editorState => {
    const { readOnly } = this.state;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    const currentStyle = editorState.getCurrentInlineStyle();
    const message = {
      block: blockType,
      style: currentStyle,
      type: 'SET_TOOLBAR_STATE'
    };
    this.postMessage(message);
    this.postMessage({
      type: selection.getHasFocus() ? 'SHOW_TOOLBAR' : 'HIDE_TOOLBAR'
    });

    this.setState(
      {
        editorState
      },
      () => {
        setTimeout(() => {
          this.syncScrollPosition();
        }, 100);
      }
    );
  };

  onAddImage = src => {
    const data = {
      src,
      type: 'image'
    };
    this.onChange(insertDataBlock(this.state.editorState, data));
  };

  getContent = () => {
    return this.state.editorState.getCurrentContent();
  };

  getDescription = () => {
    return this.getContent().getPlainText();
  };

  getValue = () => {
    const rowContentState = convertToRaw(this.getContent());
    const result = {
      imagesList: []
    };
    rowContentState.blocks.filter(x => x.type === 'atomic').forEach(b => {
      const id = uuidv4();
      result.imagesList.push({
        id,
        url: b.data.src
      });
      b.data.src = id;
    });
    result.json = JSON.stringify(rowContentState);
    result.description = this.getDescription();
    result.title = this.titleValue;
    return result;
  };

  onInitFromJson = defaultJSON => {
    const contentState = convertFromRaw(defaultJSON);
    this.onChange(EditorState.createWithContent(contentState));
  };

  hasText = () => {
    return this.getContent().hasText();
  };

  handleKeyCommand = command => {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  };

  onEditorClick(event) {
    this.editor.focus();
  }

  onTitleChange = event => {
    const value = event.target.value;
    if (value.length > 50) return;
    const resize = () => {
      this.title.style.height = 'auto';
      this.title.style.height = this.title.scrollHeight + 'px';
    };
    window.setTimeout(resize, 0);
    this.titleValue = value;
  };

  getSelectedBlockElement() {
    // Finds the block parent of the current selection
    // https://github.com/facebook/draft-js/issues/45
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }
    let node = selection.getRangeAt(0).startContainer;
    do {
      if (node.getAttribute && node.getAttribute('data-block') == 'true') {
        return node;
      }
      node = node.parentNode;
    } while (node != null);
  }

  syncScrollPosition() {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    const node = this.getSelectedBlockElement();
    if (node) {
      const scrollParent = Style.getScrollParent(node);
      const scrollPosition = getScrollPosition(scrollParent);
      const nodePosition = getElementPosition(node);
      const nodeBottom = nodePosition.y + nodePosition.height;
      const viewportHeight = document.documentElement.clientHeight;
      const scrollDelta = nodeBottom - viewportHeight;
      const position = scrollPosition.y + scrollDelta + 50;
      if (scrollDelta > 0) {
        window.scrollTo(0, position);
      }
    }
  }

  postMessage(message) {
    if (window.ENV_RN) {
      WebViewBridge.send(JSON.stringify(message));
    }
  }

  setReadOnly = readOnly => {
    this.setState({
      readOnly
    });
  };

  mediaBlockRenderer = block => {
    if (block.getType() !== 'atomic') {
      return null;
    }
    return {
      component: Media,
      editable: false,
      props: {
        onChange: this.onChange,
        editorState: this.state.editorState,
        setReadOnly: this.setReadOnly
      }
    };
  };

  render() {
    const { editorState, readOnly, showTitle } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = editorStyles.RichEditor;
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        className += ` ${editorStyles.RichEditorHidePlaceholder}`;
      }
    }

    return (
      <div className={editorStyles.RichEditorRoot}>
        {showTitle && (
          <div className={editorStyles.TitleWrapper}>
            <textarea
              ref={ref => (this.title = ref)}
              rows={1}
              maxLength={50}
              placeholder={this.state.titlePlacehodler || '标题'}
              defaultValue={this.state.titleValue}
              className={editorStyles.Textarea}
              onChange={this.onTitleChange}
            />
          </div>
        )}
        <div className={className} onClick={this.onEditorClick.bind(this)}>
          <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={this.mediaBlockRenderer}
            editorState={editorState}
            onChange={this.onChange}
            readOnly={readOnly}
            handleKeyCommand={this.handleKeyCommand}
            placeholder={this.state.placehodler || '写点什么...'}
            ref={element => {
              this.editor = element;
            }}
          />
        </div>
        <div id="editor_footer" />
      </div>
    );
  }
}

export default Home;
