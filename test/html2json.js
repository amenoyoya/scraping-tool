const jsdom = require('jsdom');

// Recursively loop through DOM elements and assign attributes to inner text object
// Why attributes instead of elements? 1. attributes more descriptive, 2. usually important and lesser
function treeHTML(element) {
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
      const child = treeHTML(node);
      if (child !== null) {
        if (!Array.isArray(object['$children'])) {
          object['$children'] = [];
        }
        object['$children'].push(child);
      }
    }
  }
  object['$text'] = element.textContent;
  return {[element.nodeName]: object};
}

// Function to map HTML DOM attributes to inner text and hrefs
function mapDOM(html) {
  const dom = new jsdom.JSDOM(html);
  document = dom.window.document;
  element = document.firstChild;
  return treeHTML(element);
}

const html = `<html>
<head>
<meta charset="utf-8">
<title>sample</title>
<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body>
	<div id="page">
		<header>
			<div id="header_inner">
				<div id="header_logo">
					<img src="https://d2l930y2yx77uc.cloudfront.net/production/uploads/images/6432837/picture_pc_9a06a019fe451a6c54a064d465d927c5.jpg">
				</div>
				<div id="header_contact">
					<a href="#" id="header_contact_inner">
						<p>お問い合わせ</p>
					</a>
				</div>
				<div id="header_text">
					<p>TEL　00-0000-0000<br>
					(受付時間　平日　9:00～17:00)</p>
				</div>
			</div>
		</header>
		<div id="main_image">
			<div id="main_image_inner">
				<h1>キャッチコピー</h1>
			</div>
		</div>
		<main>
			<section id="section01">
				<div class="scroll">
					<h2>テキストテキストテキスト</h2>
				</div>
				<nav>
					<ul id="main_nav">
						<li><a href="#div01">1.テキストテキ<br>ストテキスト</a></li>
						<li><a href="#div03">3.テキストテキ<br>ストテキスト</a></li>
						<li><a href="#div02">2.テキストテキ<br>ストテキスト</a></li>
					</ul>
				</nav>
				<div class="main_contact">
					<div class="contact_left main_contact_inner">
						<div class="contact_left_inner">
							<p>TEL 00-0000-0000<br>
							<span>(受付時間 平日 9:00～17:00)</span></p>
						</div>
					</div>
					<div class="contact_right main_contact_inner">
						<a href="#" class="contact_right_inner">
							<p>問い合わせボタン</p>
						</a>
					</div>
				</div>
			</section>
		</main>
		<footer>
			<p>&copy; samplesamplesamplesamplesample</p>
		</footer>
	</div>
</body>
</html>`;

console.log(JSON.stringify(mapDOM(html)));
