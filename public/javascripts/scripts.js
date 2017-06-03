"use strict";

Array.prototype.selectWhere = function (func) {
    var newArr = [];
    this.forEach(function (item) {
        if (func(item)) newArr.push(item);
    });
    return newArr;
};

Array.prototype.firstWhere = function (func) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (func(item)) return item;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

function Document(id, title, ownerId, isPublic, last_updated, created, content) {
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.isPublic = isPublic;
    this.lastUpdated = last_updated;
    this.created = created;
    this.content = content;
}
'use strict';

$(function () {
    $('#header-intro-text').delay(1000).fadeIn(500).delay(4000).fadeOut(500);
});
'use strict';

$(function () {

    //Register Handlers

    //$('#editcv').attr('onclick', 'editCvHandler(event)')
    //$('#newdocument').attr('onclick', 'newDocumentHandler(event)')
    //$('#description-save').attr('onclick', 'descriptionSaveHandler(event)')
    //$('#newicon').attr('onclick', 'newIconHandler(event)')
    //$('#document-edit').attr('onclick', 'documentEditHandler(event)')

    $('#change-username').on('click', notImplementedAlert);
    $('#change-firstname').on('click', notImplementedAlert);
    $('#change-infixname').on('click', notImplementedAlert);
    $('#change-lastname').on('click', notImplementedAlert);
    $('#change-email').on('click', notImplementedAlert);
});

function editCvHandler(e) {}

function newDocumentHandler(e) {
    var title = $('#modal-newfile #newfile-title').val() || "";
    newDocumentRequest(title);
}

function descriptionSaveHandler(e) {}

function newIconHandler(e) {}

function documentEditHandler(e) {
    var theDocument = window.data.activeDocument = window.data.documents.firstWhere(function (x) {
        return x.id === e;
    });

    initializeEditor();
}

function documentDeleteHandler(e) {
    var theDocument = window.data.activeDocument = window.data.documents.firstWhere(function (x) {
        return x.id === e;
    });

    sendDocumentRemoveRequest(theDocument.id);
}

$(function () {
    //if the page contains: #document-list, we must be on the profile page. So we need to request the document list:
    if ($('#document-list').length > 0) {
        requestDocumentList();
    }
});

function produceDocumentList(documents) {
    var $documentList = $('#document-list');
    $documentList.empty();
    function produceItem(doc) {
        var $newElem = $('<li class="list-group-item d-flex">\n            ' + doc.title + '\n            <div class="mx-1">\n                <!--Display a \'public\' symbol--><i class="fa fa-' + (doc.isPublic ? 'users' : 'user') + '" aria-hidden="true"></i>\n            </div>\n            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(' + doc.id + ')" id="document-edit">Edit</button>\n            <button class="btn btn-danger" onclick="documentDeleteHandler(' + doc.id + ')" id="document-remove">Remove</button>\n        </li>');

        $documentList.append($newElem);
    }

    documents.forEach(function (doc) {
        produceItem(doc);
    });
}

// HTTP Reqests:

function newDocumentRequest(title) {
    $.ajax({
        url: '/documents/adddocument',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            document: {
                title: title
            }
        }),
        success: function success(result) {
            console.log('succesfully created a new document!!!!!', result);
            requestDocumentList();
        },
        error: function error(err) {
            console.error("Failed to create New Document");
            modalAlert("Failed to create New Document");
            console.error(err);
        }
    });
}

function requestDocumentList() {
    //Get Document List
    $.ajax({
        url: '/documents/mydocuments',
        type: 'GET',
        success: function success(result) {
            //create global obj
            window.data = window.data || {};
            window.data.documents = result;
            console.log('succesfully received new list of docs ', result);

            produceDocumentList(result);
        },
        error: function error(err) {
            console.error("Failed to retrive documents");
            console.error(err);
            modalAlert("Failed to retrive documents");
        }
    });
    $('#document-list');
}

function sendDocumentRemoveRequest(docId) {
    $.ajax({
        url: '/documents/removedocument',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            document: {
                id: docId
            }
        }),
        success: function success(result) {
            console.log('succesfully removed document');
            requestDocumentList();
            modalAlert("Removed", "Succesfully removed document");
        },
        error: function error(err) {
            console.error("Failed to Delete Document");
            modalAlert("Error", "Failed to Delete Document");
            console.error(err);
        }
    });
}
'use strict';

$(function () {
    window.quill = new Quill('#editor-container', {
        modules: {
            toolbar: true
        },
        placeholder: 'Compose your Curriculum Vitae',
        theme: 'snow' // or 'bubble'
    });
    console.log('hello from quill', window.quill);
});

function saveDocument(e) {
    var oldDoc = window.data.activeDocument;

    var contents = { "text": window.quill.getText() };

    console.log('contents:', contents);
    var title = $('#document-title').val();
    var isPublic = $('#document-ispublic').prop("checked");

    var doc = new Document(oldDoc.id, title, oldDoc.ownerId, isPublic, oldDoc.lastUpdated, oldDoc.created, contents);
    window.data.activeDocument = doc;

    $.ajax({
        url: '/documents/updatedocument',
        type: 'POST',
        data: JSON.stringify({ document: doc }),
        contentType: 'application/json',
        success: function success(result) {
            console.log('successs !!!');
            $('#modal-editor').modal('hide');
            requestDocumentList();
        },
        error: function error(err) {
            console.error("Failed to create New Document");
            modalAlert("Failed to create New Document");
            console.error(err);
        }
    });
}

function initializeEditor() {

    var $modalEditor = $('#modal-editor');
    window.quill.setText(window.data.activeDocument.content.text);
    $('#document-title').val(window.data.activeDocument.title);
    $('#document-ispublic').prop("checked", window.data.activeDocument.isPublic);
    $modalEditor.modal('show');
}
'use strict';

function searchRequest() {
    var searchString = $('#search-input').val();
    if (searchString === "") return;

    serverSearchRequest(searchString);
}

function viewUserRequest(userId) {
    notImplementedAlert();
}

function populateResultList(results) {
    console.log('building a list of results', results);

    var $searchList = $('#search-results');
    $searchList.empty(); // Clear the list
    // Build list of Users

    if (results[0].length === 0 && results[1].length === 0) {
        $searchList.append($('<li class="list-group-item"><h3>Nothing Found</h3></li>'));
        return;
    }

    if (results[1].length > 0) {
        $searchList.append($('<li class="list-group-item"><h3>Users:&nbsp;</h3></li>'));
        results[1].forEach(function (user) {
            produceUserItem(user);
        });
    }
    if (results[0].length > 0) {
        $searchList.append($('<li class="list-group-item"><h3>Documents:&nbsp;</h3></li>'));
        results[0].forEach(function (doc) {
            produceDocumentItem(doc);
        });
    }

    function produceUserItem(user) {
        var $newElem = $('<li class="list-group-item d-flex">\n            <p class="lead">' + user.firstName + ' ' + user.infixName + ' ' + user.lastName + '</p>\n            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(' + user.id + ')" id="document-edit">View</button>\n        </li>');

        $searchList.append($newElem);
    }

    function produceDocumentItem(document) {
        var $newElem = $('<li class="list-group-item d-flex">\n            <p class="lead">' + document.title + '</p>\n            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(' + document.id + ')" id="document-edit">View</button>\n        </li>');

        $searchList.append($newElem);
    }
}

function serverSearchRequest(searchString) {
    $.ajax({
        url: '/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            searchString: searchString
        }),
        success: function success(result) {
            console.log('succesfully searched for users and documents!!!!!', result);
            populateResultList(result);
        },
        error: function error(err) {
            console.error("Failed to search for users and documents");
            modalAlert("Failed to search for users and documents.");
            console.error(err);
        }
    });
}
'use strict';

function modalAlert(title, message) {
    var $modalAlert = $('#modal-alert');
    $modalAlert.find('.modal-title').text(title);
    $modalAlert.find('.modal-body').text(message);
    $modalAlert.modal('show').delay(4000).modal('hide');
}

function notImplementedAlert() {
    modalAlert("Sorry", "This Feature is not yet implemented");
}
//# sourceMappingURL=scripts.js.map
