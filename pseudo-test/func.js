$(document).ready(() => {
    $('#popUp').click(function (e) {
        $('#boop').show();
        if (this.offsetWidth - e.offsetX < 0)
            $('#popUp').addClass('close');
    });
});

let timeline = document.getElementsByClassName('timeline')[0],
    timelineProgress = document.getElementsByClassName('timeline__progress')[0],
    drag = document.getElementsByClassName('timeline__drag')[0];

// Make the timeline draggable
Draggable.create(drag, {
    type: 'x',
    trigger: timeline,
    bounds: timeline,
    onPress: function(e) {
        video.currentTime = this.x / this.maxX * video.duration;
        TweenMax.set(this.target, {
            x: this.pointerX - timeline.getBoundingClientRect().left
        });
        this.update();
        var progress = this.x / timeline.offsetWidth;
        TweenMax.set(timelineProgress, {
            scaleX: progress
        });
    },
    onDrag: function() {
        video.currentTime = this.x / this.maxX * video.duration;
        var progress = this.x / timeline.offsetWidth;
        TweenMax.set(timelineProgress, {
            scaleX: progress
        });
    },
    onRelease: function(e) {
        e.preventDefault();
    }
});
