
Array.prototype.selectWhere = function(func){
    var newArr = []
    this.forEach(item => {
        if (func(item))
            newArr.push(item)
    })
    return newArr;
}

Array.prototype.firstWhere = function(func){
    for(let item of this){
        if (func(item))
            return item;
    }
}

function Document(id, title, ownerId, isPublic, last_updated, created, content){
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.isPublic = isPublic;
    this.lastUpdated = last_updated;
    this.created = created;
    this.content = content;
}