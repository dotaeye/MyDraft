import Immutable from "immutable";
import { genKey, ContentBlock } from "draft-js";

function createCombination(configs) {
  const { columns } = configs;

  const topKey = genKey();
  const topBlock = new ContentBlock({
    key: topKey,
    type: "combination",
    children: 
  });

  let combinationMap = Immutable.OrderedMap([[topKey, topBlock]]);

  columns.forEach(col => {
    const { rows, components, flex, flexOptions, id } = col;
    const columnKey = genKey();
    const columnBlock = new ContentBlock({
      key: columnKey,
      type: "combination_colum"
    });

    let result = Immutable.OrderedMap([[columnKey, columnBlock]]);

    rows.forEach(row => {
      var rowMap = createRow(row);
      result = result.merge(rowMap);
    });

    combinationMap = combinationMap.merge(result);
  });

  return combinationMap;
}

function createRow(row) {
  const { columns, components } = row;
  if (columns.length > 0) {
    return createColumns(columns);
  }

  return createComponent(components);
}

function createComponent(components) {
  var map = Immutable.OrderedMap();

  components.forEach((component, cIndex) => {
    const { type, options, id, value, flex, flexOptions } = component;
    let componentItem;

    const componnetKey = genKey();
    if (type === "text") {
      componentItem = new ContentBlock({
        key: componnetKey,
        type: "combination_text"
      });
    } else {
      componentItem = new ContentBlock({
        key: componnetKey,
        type: "combination_image"
      });
    }
    const mapItem = Immutable.OrderedMap([[componnetKey, componentItem]]);
    map = map.merge(mapItem);
  });
  return map;
}

module.exports = createCombination;
