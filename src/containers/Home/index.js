import React from 'react';
import ReactDOM from 'react-dom';
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw
} from 'draft-js';
import DraftOffsetKey from 'draft-js/lib/DraftOffsetKey';
import Editor from 'draft-js-plugins-editor'; // eslint-disable-line import/no-unresolved
import createMentionPlugin, {
  defaultSuggestionsFilter
} from 'draft-js-mention-plugin'; // eslint-disable-line import/no-unresolved
import Style from 'fbjs/lib/Style';
import getElementPosition from 'fbjs/lib/getElementPosition';
import getScrollPosition from 'fbjs/lib/getScrollPosition';
import BlockStyleControls from '../../components/Block';
import InlineStyleControls from '../../components/Inline';
import { getParams } from '../../utils';
import Media from '../../components/Media';
import 'draft-js/dist/Draft.css';
import 'draft-js-mention-plugin/lib/plugin.css';
import mentions from './mentions';
import editorStyles from './home.less';

const mentionPlugin = createMentionPlugin({
  mentionPrefix: 'user:',
  mentionTrigger: 'U'
});
const { MentionSuggestions } = mentionPlugin;

const plugins = [mentionPlugin];

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return editorStyles.RichEditorBlockquote;
    case 'atomic':
      return editorStyles.RichEditorImage;
    default:
      return null;
  }
}

const Entry = props => {
  const {
    mention,
    theme,
    searchValue, // eslint-disable-line no-unused-vars
    ...parentProps
  } = props;
  console.log(props);
  return (
    <div {...parentProps}>
      <div>
        {mention.get('title')}
      </div>
    </div>
  );
};

const PopOver = props => {
  console.log(props);
  return (
    <div>
      {props.children}
    </div>
  );
};

class Home extends React.Component {
  state = {
    editorState: EditorState.createEmpty(),
    suggestions: mentions,
    readOnly: false
  };

  componentDidMount() {
    window.onWebViewBridgeMessage = this.onMessage.bind(this);
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
    } else if (action.type === 'SET_EDITOR_HEIGHT') {
      this.editorHeight = action.editorHeight;
    } else if (action.type === 'INSERT_IMAGE') {
      this.onAddImage(action.data);
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

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions)
    });
  };

  onAddMention = () => {
    // get the mention object selected
  };

  onAddImage = src => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'image',
      'IMMUTABLE',
      { src }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    this.onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    );
  };

  onGetState = () => {
    if (this.state.editorState) {
      const content = this.state.editorState.getCurrentContent();
      console.log(JSON.stringify(convertToRaw(content), null, 2));
    }
  };

  onInitFromJson = () => {
    const contentState = convertFromRaw(defaultJSON);
    this.onChange(EditorState.createWithContent(contentState));
  };

  onEditorClick(event) {
    this.editor.focus();
  }

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
        // console.log("position", position);
        const message = {
          type: 'SYNC_SCROLL_POSITION',
          position
        };
        this.postMessage(message);
      }
    }
  }

  postMessage(message) {
    if (window.ENV_RN) {
      WebViewBridge.send(JSON.stringify(message));
      // window.postMessage(JSON.stringify(message));
    } else {
      console.log(JSON.stringify(message));
    }
  }

  toggleBlockType = blockType => {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  };

  toggleInlineStyle = inlineStyle => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  };

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
    const { editorState, readOnly } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = editorStyles.RichEditor;
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ` ${editorStyles.RichEditorHidePlaceholder}`;
      }
    }

    return (
      <div className={editorStyles.RichEditorRoot}>
        <div className={className} onClick={this.onEditorClick.bind(this)}>
          <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={this.mediaBlockRenderer}
            editorState={editorState}
            onChange={this.onChange}
            plugins={plugins}
            readOnly={readOnly}
            placeholder="写点什么..."
            ref={element => {
              this.editor = element;
            }}
          />
          <MentionSuggestions
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
          />
        </div>
        <div id="editor_footer" />
      </div>
    );
  }
}

const defaultJSON = {
  entityMap: {
    '0': {
      type: 'image',
      mutability: 'IMMUTABLE',
      data: {
        src: 'http://megadraft.io/images/media.jpg'
      }
    }
  },
  blocks: [
    {
      key: 'cbpvd',
      text: 'asdfasdfsaf',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: 'f9ti4',
      text: 'asdfasdf',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: '9oc8',
      text: ' ',
      type: 'atomic',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [
        {
          offset: 0,
          length: 1,
          key: 0
        }
      ],
      data: {
        desc: 'asdasfasdad'
      }
    },
    {
      key: '1bqu3',
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    }
  ]
};

export default Home;
