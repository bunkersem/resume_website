$(function(){

    //Register Handlers

    //$('#editcv').attr('onclick', 'editCvHandler(event)')
    //$('#newdocument').attr('onclick', 'newDocumentHandler(event)')
    //$('#description-save').attr('onclick', 'descriptionSaveHandler(event)')
    //$('#newicon').attr('onclick', 'newIconHandler(event)')
    //$('#document-edit').attr('onclick', 'documentEditHandler(event)')

    $('#change-username').on('click', notImplementedAlert)
    $('#change-firstname').on('click', notImplementedAlert)
    $('#change-infixname').on('click', notImplementedAlert)
    $('#change-lastname').on('click', notImplementedAlert)
    $('#change-email').on('click', notImplementedAlert)

})


function editCvHandler(e){

}

function newDocumentHandler(e){
    var title = $('#modal-newfile #newfile-title').val() || ""
    newDocumentRequest(title)
}

function descriptionSaveHandler(e){

}

function newIconHandler(e){
    
}

function documentEditHandler(e){
    var theDocument = window.data.activeDocument = window.data.documents.firstWhere(x => x.id === e)

    initializeEditor()
}

function documentDeleteHandler(e){
    var theDocument = window.data.activeDocument = window.data.documents.firstWhere(x => x.id === e)

    sendDocumentRemoveRequest(theDocument.id)
}

$(function(){
    //if the page contains: #document-list, we must be on the profile page. So we need to request the document list:
    if ($('#document-list').length > 0) {
        requestDocumentList()
    }
    
    

})



function produceDocumentList(documents){
    var $documentList = $('#document-list')
    $documentList.empty()
    function produceItem(doc){
        var $newElem = $(`<li class="list-group-item d-flex">
            ${doc.title}
            <div class="mx-1">
                <!--Display a 'public' symbol--><i class="fa fa-${doc.isPublic ? 'users' : 'user'}" aria-hidden="true"></i>
            </div>
            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(${doc.id})" id="document-edit">Edit</button>
            <button class="btn btn-danger" onclick="documentDeleteHandler(${doc.id})" id="document-remove">Remove</button>
        </li>`)

        $documentList.append($newElem)
    }


    documents.forEach(doc => { produceItem(doc) })

}

// HTTP Reqests:

function newDocumentRequest(title){
    $.ajax({
        url: '/documents/adddocument',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            document: {
                title: title
            }
        }),
        success: function(result){
            console.log('succesfully created a new document!!!!!', result)
            requestDocumentList()
        },
        error: function(err){
            console.error("Failed to create New Document");
            modalAlert("Failed to create New Document")
            console.error(err)
        }
    })
}

function requestDocumentList(){
    //Get Document List
    $.ajax({
        url: '/documents/mydocuments',
        type: 'GET',
        success: function(result){
            //create global obj
            window.data = window.data || {}
            window.data.documents = result;
            console.log('succesfully received new list of docs ', result)

            produceDocumentList(result)
        },
        error: function(err){
            console.error("Failed to retrive documents");
            console.error(err)
            modalAlert("Failed to retrive documents")
        }
    })
    $('#document-list')
}

function sendDocumentRemoveRequest(docId){
    $.ajax({
        url: '/documents/removedocument',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            document: {
                id: docId
            }
        }),
        success: function(result){
            console.log('succesfully removed document')
            requestDocumentList();
            modalAlert("Removed", "Succesfully removed document")
        },
        error: function(err){
            console.error("Failed to Delete Document");
            modalAlert("Error", "Failed to Delete Document")
            console.error(err)
        }
    })
}