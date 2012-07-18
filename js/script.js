/*
Namespace
*/

window.RWS = window.RWS || {
    Models: {},
    Collections: {},
    Views: {}
};

/*
Models
*/

window.RWS.Models.Database = Backbone.Model.extend({
});

window.RWS.Models.IndexDefinition = Backbone.Model.extend({
});

window.RWS.Models.Document = Backbone.Model.extend({
	content: function(){},
	metadata: function(){},
	id: function(){},
	
	initialize: function(data){
		content = data.content;
		metadata = data.metadata;
		id = data.id;
	}
});
/*
Collections
*/

window.RWS.Collections.IndexDefinitions = Backbone.Collection.extend({
    model: RWS.Models.IndexDefinition,

    initialize: function () {
        _.extend(this, Backbone.Events);
    }
});

window.RWS.Collections.AllDocuments = Backbone.Collection.extend({
    model: RWS.Models.Document,

    initialize: function () {
        _.extend(this, Backbone.Events);
    }
});

/*
Views
*/

window.RWS.Views.AppView = Backbone.View.extend({
    initialize: function (options) {
        _.extend(this, Backbone.Events);
        _.bindAll(this, '_addIndexDefinitionView');
        this._indexDefinitionViews = [];
        app.indexDefinitions.on('add', this._addIndexDefinitionView, this);
		this._allDocumentsView = [];
		app.allDocuments.on('add', this._addAllDocumentsView, this);
		
        //$('#database-tabs').tab('show')
    },

    _addIndexDefinitionView: function (indexDefinition) {
        console.log(indexDefinition);
        var indexDefinitionView = new RWS.Views.IndexDefinitionView({ indexDefinition: indexDefinition });
        this._indexDefinitionViews.push(indexDefinitionView);
        $('#index-definition-list').append(indexDefinitionView.render().el);
    },
	
	_addAllDocumentsView: function (allDocument){
		console.log(allDocument);
		var allDocumentsView = new RWS.Views.AllDocumentsView({ allDocument: allDocument });
		this._allDocumentsView.push(allDocumentsView);
		/* TODO: Create a new div for the 'all documents' view */
		$('#index-definition-list').append(allDocumentsView.render().el);
	}
});

window.RWS.Views.IndexDefinitionView = Backbone.View.extend({
    tagName: 'li',
	className: 'span7',
    initialize: function (options) {
        _.extend(this, Backbone.Events);
        this._indexDefinition = options.indexDefinition;
    },

    render: function () {
		this.$el.append(ich.indexSummaryTemplate(this._indexDefinition.toJSON()));
		
        return this;
    }
});

window.RWS.Views.AllDocumentsView = Backbone.View.extend({
    tagName: 'li',
	className: 'span7',
	
    initialize: function (options) {
        _.extend(this, Backbone.Events);
        this._document = options.allDocument;
    },
    render: function () {
		this.$el.append(ich.documentSummaryTemplate(this._document.toJSON()));
        return this;
    },
	events: {
		"click .icon-pencil": "showPencilClick",
		"click .save": "updateDocument",
		"click .cancel": "cancelUpdate"
	},
	showPencilClick: function(){
		var id = this._document['attributes']['id'];
		var metadata = JSON.stringify(this._document['attributes']['metadata'], null, "\t");
		var content = JSON.stringify(this._document['attributes']['content'], null, "\t");
		var jsonObject = {"document": content, "metadata": metadata, "id": id};
		this.$el.html(ich.documentEditTemplate(jsonObject));
	},
	updateDocument: function(){
		var checkingObject = this._document.toJSON();
		delete checkingObject['@metadata'];
		var updatedDoc = JSON.parse(this.$('#document').val());
		var updatedMetadata = JSON.parse(this.$('#metadata').val());
		var update = 	this._document.set({"content": updatedDoc, "metadata":updatedMetadata});
		var docId = this._document.toJSON()['id'];
		$.support.cors = true;
		$.ajax({
            type: 'PUT',
            dataType: 'json',
			data: JSON.stringify(updatedDoc),
            //jsonp: 'jsonp', // “jsonp”, this is needed since jQuery defaults the name of the callback parameter to “callback”. Raven expects this to be “jsonp” hence the override is needed.
			url: 'http://localhost:8080/docs/' + docId,
            success: function (data, textStatus, jqXHR) {
                alert('hoorah!');
				//this.$el.html(ich.documentSummaryTemplate(this._document.toJSON()));
            },
            error: function (data, textStatus, error) {
                alert("fail!")
            }
        });
		this.$el.html(ich.documentSummaryTemplate(this._document.toJSON()));
        //return this;
	},
	cancelUpdate: function(){
		this.$el.html(ich.documentSummaryTemplate(this._document.toJSON()));
		//return this;
	},
});

/*
App
*/

window.RWS.Router = Backbone.Router.extend({
    routes: {
        //'': 'showDefaultStream',
        'index-definitions': 'showIndexDefinitions',
        'documents': 'showDocuments'
    },

    initialize: function (options) {
        _.extend(this, Backbone.Events);
    },

    showIndexDefinitions: function () {
        app.showIndexDefinitions();
    },

    showDocuments: function () {
        app.showDocuments();
    }
});

window.RWS.App = Backbone.Model.extend({
    initialize: function () {
        _.extend(this, Backbone.Events);
        _.bindAll(this, 'showIndexDefinitions', 'showDocuments');
        this.indexDefinitions = new RWS.Collections.IndexDefinitions();
		this.allDocuments = new RWS.Collections.AllDocuments();
        window.app = this;
        this.appView = new RWS.Views.AppView();
        this.router = new RWS.Router();
    },

    showIndexDefinitions: function () {
        var self = this;
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonp', // “jsonp”, this is needed since jQuery defaults the name of the callback parameter to “callback”. Raven expects this to be “jsonp” hence the override is needed.
            url: 'http://localhost:8080/indexes/',
            success: function (data, textStatus, jqXHR) {
				$('#index-definition-list').empty();
                _.each(data, function (indexDefinition) {
                    app.indexDefinitions.add(indexDefinition);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown)
            }
        });
    },

    showDocuments: function () {
        var self = this;
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonp', // “jsonp”, this is needed since jQuery defaults the name of the callback parameter to “callback”. Raven expects this to be “jsonp” hence the override is needed.
            url: 'http://localhost:8080/docs/',
            success: function (data, textStatus, jqXHR) {
				$('#index-definition-list').empty();
				app.allDocuments.reset();
                _.each(data, function (document) {
					var metadata = document['@metadata'];
					var id = metadata['@id'];
					var content = document;
					delete content['@metadata'];
                    app.allDocuments.add(new window.RWS.Models.Document({content: content, metadata: metadata, id: id}));
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown)
            }
        });
    }
});

$(function() {
	new RWS.App();
	Backbone.history.start({ pushState: false });
});
