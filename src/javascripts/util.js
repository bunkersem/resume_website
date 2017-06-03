function modalAlert(title, message){
    var $modalAlert = $('#modal-alert')
    $modalAlert.find('.modal-title').text(title)
    $modalAlert.find('.modal-body').text(message)
    $modalAlert.modal('show').delay(4000).modal('hide')
}

function notImplementedAlert(){
    modalAlert("Sorry", "This Feature is not yet implemented")
}
