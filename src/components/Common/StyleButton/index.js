import React from "react";
import styles from "./style.css";

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = styles.RichEditorStyleButton;
    if (this.props.active) {
      className += " " + styles.RichEditorActiveButton;
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

export default StyleButton;
