import React, { Component } from "react";
import classNames from "classnames";
import styles from "./style.less";

export default class Input extends Component {
  renderError(error) {
    if (!error) {
      return;
    }
    return <div className={styles.inputError}>{error}</div>;
  }

  _handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    let { value, error, ...props } = this.props;

    let className = classNames({
      [styles.input]: true,
      [styles.inputEmpty]: !value,
      [styles.inputError]: error
    });

    return (
      <div className={styles.inputRow}>
        <input
          {...props}
          value={value}
          type="text"
          className={className}
          onDrop={this._handleDrop}
        />
        {this.renderError(error)}
      </div>
    );
  }
}
