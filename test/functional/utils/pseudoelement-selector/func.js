$(document).ready(() => {
    $('#left-click').click(function (e) {
        if (this.offsetWidth - e.offsetX < 0)
            $('#left-click').css('background-color', '#8d8');
    });

    $('#right-click').mousedown(function (e) {
        if(e.button !== 2) return true;

        if (this.offsetWidth - e.offsetX < 0)
            $('#right-click').css('background-color', '#8d8');
    });

    $('#double-click').dblclick(function (e) {
        if (this.offsetWidth - e.offsetX < 0)
            $('#double-click').css('background-color', '#8d8');
    });

    $('#hover').hover(function (e) {
        if (this.offsetWidth - e.offsetX < 0)
            $('#hover').css('background-color', '#8d8');
    });

    $('#D').click(function (e) {
        console.log('IT TWORKS');
        if (this.offsetWidth - e.offsetX < 0)
            $('#D').css('background-color', '#8d8');
    });

    $('#drag').mousedown(dragMouseDown);

    function dragMouseDown(e) {
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        const drag = $('#drag');
        const timeline = $('#timeline');
        const position = e.clientX - timeline.offset().left - 10;

        if(position >= -1 && position <= 290)
            drag.css('left', position + 'px');
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
});
