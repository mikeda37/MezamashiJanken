const BASE_URL = 'https://www.fujitv.co.jp/meza/d';

const data = {
    working: false,
    week: 'this',
    keyword: ''
};

// when miss a deadline
if (momentApi.day() > 4 || momentApi.day() < 1) {
    $('#lastweek').addClass('deadline-missed');

    $('#lastweek label').text('応募終了');
}


/**
 * get page data
 */
$.get(BASE_URL, (data) => {
    const currentImage = $('#currentweek img', data).attr('src');
    const currentDescription = $('#currentweek .p-name', data).text();
    const currentDeadline = $('#currentweek .deadline', data).text();
    const lastDescription = $('#lastweek .p-name', data).text();
    const lastDeadline = $('#lastweek .deadline', data).text();

    const currentImgDate = currentImage.match(/.+(\d{8})\.jpg/)[1];
    const lastImgDate = momentApi.lastWeekDate(currentImgDate);
    const lastImage = currentImage.replace(/\d{8}/, lastImgDate);

    $('#currentweek .application-deadline').text(currentDeadline);
    $('#currentweek .image').attr({src: `${BASE_URL}/${currentImage}`});
    $('#currentweek .description').text(currentDescription);
    
    $('#lastweek .application-deadline').text(lastDeadline);
    $('#lastweek .image').attr({src: `${BASE_URL}/${lastImage}`});
    $('#lastweek .description').text(lastDescription);
});


/*
 * on CLICK setting icon
 */
$('#setting-icon').on('click', () => {
    ipcRendererApi.send('OPEN_PREFERENCES', {});
});


/*
 * on CLICK week-choice
 */
$('.week-choice').on('click', (e) => {
    const currentTarget = e.currentTarget;
    const isDeadlineMissed = $(currentTarget).hasClass('deadline-missed');
    if (isDeadlineMissed) return;
    
    $(currentTarget).find('.week-choice-input input').prop('checked', true);
    
    $('.week-choice').removeClass('active');
    $(currentTarget).addClass('active');
});


/*
 * on KEYUP in keyword field
 */
$('#keyword-field').on('keyup', () => {

    if ($('#keyword-field').val() === '') {
        $('#btn-send').prop('disabled', true);
    } else {
        $('#btn-send').prop('disabled', false);
    }
});


/*
 * on CLICK SEND
 */
$('#btn-send').on('click', () => {
    if (data.working) return;

    data.working = true;
    $('#keyword-field').prop('disabled', true);
    $('#btn-send').prop('disabled', true);

    $('#btn-send').addClass('working');
    $('#btn-stop').addClass('working');
    
    data.week = $('#week-choice-area input[type="radio"]:checked').val();
    data.keyword = $('#keyword-field').val();
    ipcRendererApi.send('SEND', data);
});


/*
 * on CLICK STOP
 */
$('#btn-stop').on('click', () => {
    if (!data.working) return;

    data.working = false;
    $('#btn-stop').prop('disabled', true);

    ipcRendererApi.send('STOP');
});


/*
 * on DONE
 */
ipcRendererApi.on('DONE', (_, result) => {
    activateStatus();
});


/*
 * on STOPPED
 */
ipcRendererApi.on('STOPPED', (_, result) => {
    activateStatus();
});


/**
 * activate status
 */
const activateStatus = () => {
    data.working = false;
    
    $('#keyword-field').prop('disabled', false);

    $('#btn-send').prop('disabled', false);
    $('#btn-send').removeClass('working');
    
    $('#btn-stop').prop('disabled', false);
    $('#btn-stop').removeClass('working');
}

