import React, { Component } from "react";
import config from "./config";
import TextComponent from "./TextComponent";
import TextDraftComponent from "./TextDraftComponent";
import ImageComponent from "./ImageComponent";

export default class Smart extends Component {
  renderComponents(components) {
    return components.map((component, cIndex) => {
      const { type, options, id, value, flex } = component;
      let componentItem;
      if (type === "text") {
        componentItem = (
          <TextDraftComponent
            key={cIndex}
            id={id}
            value={value}
            options={options}
            flex={flex}
            {...this.props}
          />
        );
      } else if (type === "image") {
        componentItem = (
          <ImageComponent
            key={cIndex}
            id={id}
            value={value}
            options={options}
            flex={flex}
            {...this.props}
          />
        );
      }
      return componentItem;
    });
  }

  renderRows(rows) {
    return rows.map((row, rIndex) => {
      const { components, columns } = row;
      if (columns.length > 0) {
        return this.renderColumns(columns);
      } else {
        return (
          <div
            key={rIndex}
            style={{
              flex: row.flex,
              display: "flex",
              ...row.flexOptions
            }}
          >
            {this.renderComponents(components)}
          </div>
        );
      }
    });
  }

  renderColumns(columns) {
    return columns.map((col, index) => {
      const { flexOptions, rows } = col;
      return (
        <div
          key={col.id}
          style={{
            flex: col.flex,
            display: "flex",
            ...col.flexOptions
          }}
        >
          {this.renderRows(rows)}
        </div>
      );
    });
  }

  render() {
    const { columns } = config;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start"
        }}
      >
        {this.renderColumns(columns)}
      </div>
    );
  }
}
