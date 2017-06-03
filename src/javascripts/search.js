function searchRequest(){
    var searchString = $('#search-input').val();
    if (searchString === "") return;
    
    serverSearchRequest(searchString)
}

function viewUserRequest(userId){
    notImplementedAlert();
}

function populateResultList(results){
    console.log('building a list of results', results)

    var $searchList = $('#search-results')
    $searchList.empty() // Clear the list
    // Build list of Users
    
    if (results[0].length === 0 && results[1].length === 0){
        $searchList.append($(`<li class="list-group-item"><h3>Nothing Found</h3></li>`))
        return;
    }

    if (results[1].length > 0){
        $searchList.append($(`<li class="list-group-item"><h3>Users:&nbsp;</h3></li>`))
        results[1].forEach(user => {
            produceUserItem(user)
        })
    }
    if (results[0].length > 0){
        $searchList.append($(`<li class="list-group-item"><h3>Documents:&nbsp;</h3></li>`))
        results[0].forEach(doc => {
            produceDocumentItem(doc)
        })
    }

    function produceUserItem(user){
        var $newElem = $(`<li class="list-group-item d-flex">
            <p class="lead">${user.firstName} ${user.infixName} ${user.lastName}</p>
            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(${user.id})" id="document-edit">View</button>
        </li>`)

        $searchList.append($newElem)
    }
    
    function produceDocumentItem(document){
        var $newElem = $(`<li class="list-group-item d-flex">
            <p class="lead">${document.title}</p>
            <button class="btn btn-info ml-auto mx-2" onclick="documentEditHandler(${document.id})" id="document-edit">View</button>
        </li>`)

        $searchList.append($newElem)
    }
}

function serverSearchRequest(searchString){
    $.ajax({
        url: '/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            searchString
        }),
        success: function(result){
            console.log('succesfully searched for users and documents!!!!!', result)
            populateResultList(result)
        },
        error: function(err){
            console.error("Failed to search for users and documents");
            modalAlert("Failed to search for users and documents.")
            console.error(err)
        }
    })
}