require('./core')()


module.exports = {
    User: function User(username, birth, email, firstName, infixName = "" ,lastName, password, icon){
        //Error checking:
        [...arguments].forEach(item => {
            if (item !== icon && (item === undefined || item === null))
                throw Error(item + ' is not allowed to be null!')
        })
        this.username = username;
        this.birth = (new Date(birth)).getUnixTime();
        this.email = email;
        this.firstName = firstName;
        this.infixName = infixName;
        this.lastName = lastName;
        this.password = password;
        this.icon = icon;
        this.lastOnline = (new Date).getUnixTime();
        this.created = (new Date).getUnixTime();
    },
    Sector: function Sector(name, description){
        this.name = name;
        this.description = description;
    },
    WorkPlace: function WorkPlace(name, tel, description){
        this.name = name;
        this.tel = tel;
        this.description = description;
    },
    Document: function Document(id, title, ownerId, isPublic, last_updated, created, content){
        this.id = id;
        this.title = title;
        this.ownerId = ownerId;
        this.isPublic = isPublic;
        this.lastUpdated = last_updated;
        this.created = created;
        this.content = content;
    }


}

