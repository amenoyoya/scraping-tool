const jsdom = require('jsdom');

/**
 * 要素を木構造で再帰的に分解
 * @param {DOMElement} element 
 */
const getDomTree = (element) => {
  const nodeList = element.childNodes;
  const object = {};
  if (nodeList === null || nodeList.length === 0) {
    return null;
  }
  for (const node of nodeList) {
    // if final text
    if (node.nodeType === 3) {
      for (const attr of element.attributes) {
        object[attr.name] = attr.nodeValue;
      }
    } else {
      // else if non-text then recurse on recursivable elements
      const child = getDomTree(node);
      if (child !== null) {
        if (!Array.isArray(object['$children'])) {
          object['$children'] = [];
        }
        object['$children'].push(child);
      }
    }
  }
  object['$text'] = element.textContent;
  // HTML, HEAD, BODY は無視
  return element.nodeName === 'HTML' ?
    object['$children'][0] : (
      element.nodeName === 'HEAD' || element.nodeName === 'BODY' ?
        object['$children'] : {[element.nodeName]: object}
    );
};

/**
 * HTMLをJSONオブジェクトに変換
 * @param {string} html 
 */
const parseHtmlToJson = (html) => {
  try {
    const dom = new jsdom.JSDOM(html);
    return getDomTree( dom.window.document.firstChild);
  } catch (err) {
    return {};
  }
};

module.exports = {
  parseHtmlToJson
};