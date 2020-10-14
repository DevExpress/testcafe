const div = document.createElement('div');

div.innerHTML = '<div class="fixer" id="gh2418"></div>';
document.body.appendChild(div.removeChild(div.firstChild));
