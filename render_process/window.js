const {ipcRenderer} = require('electron');
const moment = require('moment');

const data = {
    working: false,
    week: 'this',
    keyword: ''
};

// disable last-week selection during Fri.-Sun.
if (moment().day() > 4 || moment().day() < 1) {
    $('#week-choice-last').prop('disabled', true);
}


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
    ipcRenderer.send('SEND', data);
});


/*
 * on CLICK STOP
 */
$('#btn-stop').on('click', () => {
    if (!data.working) return;

    data.working = false;
    $('#btn-stop').prop('disabled', true);

    ipcRenderer.send('STOP');
});


/*
 * on DONE
 */
ipcRenderer.on('DONE', (_, result) => {
    activateStatus();
});


/*
 * on STOPPED
 */
ipcRenderer.on('STOPPED', (_, result) => {
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

