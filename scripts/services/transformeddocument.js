
module.exports = (function(){
    global.TransformedDocument = function TransformedDocument(dbDoc) {
        if (!dbDoc) return undefined;
        this.id = dbDoc.id
        this.title = dbDoc.title
        this.ownerId = dbDoc.owner_id
        this.isPublic = dbDoc.is_public
        this.lastUpdated, dbDoc.lastUpdated
        this.created = dbDoc.created
        this.content = dbDoc.content
    }
}) 
