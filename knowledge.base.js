//Replace header image with link wrapped
document.querySelector('.tab').style.display = 'none';
var header = document.querySelector('.CHeader')
	,tab = document.querySelector('.tab').cloneNode(true);
	tab.className = 'newTab';
	tab.style.width = '100%';

var newLink = document.createElement('a');
	newLink.href = 'http://www.google.com'
	newLink.target = '_blank';
	newLink.appendChild(tab);

header.appendChild(newLink);