'@mixin'['Type in input in iframe'] = {
    '1.Type in input': inIFrame('#iframe', function () {
        act.type('#input', this.text);
    })
};
