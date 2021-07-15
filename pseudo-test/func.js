$(document).ready(() => {
    $('#popUp').click(function (e) {
        $('#boop').show();
        if (this.offsetWidth - e.offsetX < 0)
            $('#popUp').addClass('close');
    });

    $('#timeline_drag').mousedown(dragMouseDown);

    function dragMouseDown(e) {
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        const drag = $('#timeline_drag');
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
