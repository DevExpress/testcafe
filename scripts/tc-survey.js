$(function(){
    var json = {
        surveyId: '02932bb6-5a48-46ee-ab45-d858efdc5b59',
        surveyPostId: 'fceaa74a-01f9-412d-b443-62b0394c2b19'
    };

    var wasSurveyCompleted = window.localStorage.getItem(SUMMER_2019_SURVEY_COMPLETED_FLAG);

    if(wasSurveyCompleted) {
        $('.survey-completed-container').removeClass('hidden');
        return;
    }

    window.localStorage.setItem(SUMMER_2019_SURVEY_PAGE_OPEN_DATE_FLAG, Date.now());
    $('.survey-header-container').removeClass('hidden');
    $('.survey-container').removeClass('hidden');

    window.survey = new Survey.Model(json);

    survey.onComplete.add(function () {
        $('.survey-header-container').addClass('hidden');
        $('.survey-container').addClass('hidden');
        $('.survey-completed-container').removeClass('hidden');
        window.localStorage.setItem(SUMMER_2019_SURVEY_COMPLETED_FLAG, true);
    });

    survey.onAfterRenderQuestion.add(function (survey, options) {
        var questionElement = $(options.htmlElement);

        if(options.question.hasOther) {
            var isRadio     = !!questionElement.find('.sv_q_radiogroup').length;
            var answers     = isRadio ? questionElement.find('.sv_q_radiogroup') : questionElement.find('.sv_q_checkbox');
            var others      = answers.last();
            var othersInput = others.find('input');
            var textArea    = others.find('textarea[type="text"]');

            others.addClass('others');
            textArea.prop('disabled', true);

            othersInput.change(function () {
                var newTextArea  = others.find('textarea[type="text"]');
                var inputChecked = $(this).is(':checked');

                newTextArea.prop('disabled', inputChecked ? false : 'disabled');

                if(inputChecked)
                    newTextArea.focus();

                newTextArea.val(textArea.val());
                textArea.remove();
                textArea = newTextArea;
            });
            
            answers
                .find('input')
                .not(othersInput)
                .change(function () {
                    var newTextArea = others.find('textarea[type="text"]');
                    newTextArea.prop('disabled', othersInput.is(':checked') ? false : 'disabled');
                    newTextArea.val(textArea.val());
                    textArea.remove();
                    textArea = newTextArea;
                });
        }

        if(options.question.hasComment)
            questionElement.find('.form-group:last-child').addClass('comment');

        // NOTE: Puts errors before the question title.
        questionElement.prepend(questionElement.find('.sv_qstn_error_top'));
    });

    $("#survey").Survey({ model: survey });
});