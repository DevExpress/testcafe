/* eslint-disable linebreak-style */
const shadowHost = document.createElement('div');

shadowHost.id = 'shadow-DOM-container';
shadowHost.attachShadow({ mode: 'open' });
document.body.append(shadowHost);

const content = `
<div id="htmlElement" class="yo hey cool"
     style="width: 40px; height: 30px; padding-top: 2px; padding-left: 2px; border-left: 1px solid black;">
    <span style="display:none;" id="someSpan">
        42
    </span>
    Yo
</div>
<svg width="400" height="110">
    <rect class="svg1 svg2" id="svgElement" width="300px" height="100px" style="fill:rgb(0,255,255); stroke-width:0;">
        Hey
    </rect>
</svg>
<form>
    <input id="textInput" type="text">
    <input id="checkInput" type="checkbox">
    <select id="selectInput">
        <option id="option1">O1</option>
        <option id="option2">O2</option>
    </select>
</form>
<div id="htmlElementWithInnerText">Hey<br>yo test
    <script>42</script>
    test
    <script>'hey hey';</script>
    <style>.someClass {
    }</style>
</div>

<input type="button" id="createElement">
<input type="button" id="makeVisible">
<div id="invisibleElement" style="display: none; width:500px; height: 500px;"></div>

<input type="button" id="newPage">
<section id="container">
<div id="el1" class="idxEl">This is <script>var yo = 4;</script>element 1.</div>
<div id="el2" class="idxEl">Hey?! (yo)</div>
<div id="el3" class="idxEl">Hey?! (yo)</div>
<div id="el4" class="idxEl">This <script>var yo = 3;</script>is element 4.</div>
</section>

<div id="withExactText">
    <div class="should-not-pass">
        Element with text
        <div id="passed-0" class="should-pass">Element with text</div>
        <div id="passed-1" class="should-pass"> Element with text </div>
        <div id="passed-2" class="should-pass">Element with text<div> </div></div>
        <div class="should-not-pass">Element with text<div>1</div></div>
        <div class="should-not-pass">Element with text1</div>
    </div>
</div>

<a><b><c></c></b><d>e</d><f><g>h</g></f></a>

<div id="p2" class="parent2">
    <div id="p1" class="parent1">
        <div id="p0" class="parent0">
            <div id="childDiv"></div>
        </div>
    </div>
    Hey
</div>
<ul id="list">
    <li>
        <label id="write">Write code</label>
    </li>
    <li>
        <label id="test">Test it</label>
    </li>
    <li>
        <label id="release">Release it</label>
    </li>
</ul>
<div class="class1">
    <div id="common1" class="common"></div>
</div>
<div>
    <div id="common2" class="common class1"></div>
</div>
<div class="find-parent"><div id="find-child1"><div id="find-child2"></div></div><div id="find-child3"></div><div id="find-child4"></div></div>

<div>
    <div id="attr1" data-store="data-attr1" class="attr"></div>
    <div id="attr2" data-store="data-attr2" class="attr"></div>
</div>

<div id="filterVisiblePlain">
    <div style="display: none;">displayNone</div>
    <div style="width: 0; height: 0;">zeroDimensions</div>
    <div style="visibility: hidden;">visibilityHidden</div>
    <div>visible</div>
</div>

<div id="filterVisibleHierarchical">
    <div style="display: none;">
        <p class="p" style="display: none;">1</p>
        <p class="p" style="display: none;">2</p>
        <p style="display: none;">3</p>
        <p class="p">4</p>
        <p>5</p>
    </div>
    <div>
        <p class="p">1</p>
        <p>2</p>
        <p>3</p>
        <p class="p" style="display: none;">4</p>
        <p class="p">5</p>
        <p>6</p>
    </div>
</div>
`;

document.getElementById('shadow-DOM-container').shadowRoot.innerHTML = content;
