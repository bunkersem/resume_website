$(function(){
    window.quill = new Quill('#editor-container', {
        modules: {
            toolbar: true,
        },
        placeholder: 'Compose your Curriculum Vitae',
        theme: 'snow'  // or 'bubble'
    })
    console.log('hello from quill', window.quill)
})


function saveDocument(e){
    var oldDoc = window.data.activeDocument

    var contents = {"text": window.quill.getText()} 
    

    console.log('contents:', contents)
    var title = $('#document-title').val()
    var isPublic = $('#document-ispublic').prop("checked");

    var doc = new Document(oldDoc.id, title, oldDoc.ownerId, isPublic, oldDoc.lastUpdated, oldDoc.created, contents)
    window.data.activeDocument = doc;

    $.ajax({
        url: '/documents/updatedocument',
        type: 'POST',
        data: JSON.stringify({document: doc}),
        contentType: 'application/json',
        success: function(result){
            console.log('successs !!!')
            $('#modal-editor').modal('hide')
            requestDocumentList()
        },
        error: function(err){
            console.error("Failed to create New Document");
            modalAlert("Failed to create New Document")
            console.error(err)
        }
    })
}

function initializeEditor(){

    var $modalEditor = $('#modal-editor')
    window.quill.setText(window.data.activeDocument.content.text);
    $('#document-title').val(window.data.activeDocument.title)
    $('#document-ispublic').prop("checked", window.data.activeDocument.isPublic)
    $modalEditor.modal('show');
}