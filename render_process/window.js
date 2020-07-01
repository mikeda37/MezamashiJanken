const {ipcRenderer} = require('electron');

const data = {
    working: false,
    week: 'this',
    keyword: ''
};


$('#keyword-field').on('keyup', () => {

    if ($('#keyword-field').val() === '') {
        $('#btn-send').prop('disabled', true);
    } else {
        $('#btn-send').prop('disabled', false);
    }
});


$('#btn-send').on('click', () => {
    if (data.working) return;

    data.working = true;
    $('#btn-send').prop('disabled', true);
    // $('#btn-send').addClass('disabled');

    $('#keyword-field').prop('disabled', true);
    
    data.week = $('#week-choice-area input[type="radio"]:checked').val();
    data.keyword = $('#keyword-field').val();
    ipcRenderer.send('send', data);
});


ipcRenderer.on('done', (_, result) => {
    data.working = false;
    
    $('#btn-send').prop('disabled', false);
    // $('#btn-send').removeClass('disabled');

    $('#keyword-field').prop('disabled', false);
});

