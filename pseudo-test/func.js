$(document).ready(() => {
    $('#popUp').click(function (e) {
        $('#boop').show();
        if (this.offsetWidth - e.offsetX < 0)
            $('#popUp').addClass('close');
    });
});
