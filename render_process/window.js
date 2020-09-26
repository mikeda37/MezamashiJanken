const data = {
    working: false,
    week: 'this',
    keyword: ''
};

// disable last-week selection during Fri.-Sun.
if (momentApi.day() > 4 || momentApi.day() < 1) {
    $('#week-choice-last').prop('disabled', true);
}


/*
 * on CLICK setting icon
 */
$('#setting-icon').on('click', () => {
    ipcRendererApi.send('OPEN_PREFERENCES', {});
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

