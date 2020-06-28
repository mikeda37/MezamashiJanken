const {ipcRenderer} = require('electron');

const data = {};

$('#btn-send').on('click', () => {

    data.keyword = $('#input-field').val();
    ipcRenderer.send('send', data);
});

