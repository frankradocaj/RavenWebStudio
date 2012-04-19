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

/*
Collections
*/

window.RWS.Collections.IndexDefinitions = Backbone.Collection.extend({
    model: RWS.Models.IndexDefinition,

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
		options.app.indexDefinitions.on('add', this._addIndexDefinitionView);
		
		//$('#database-tabs').tab('show')
    },

	_addIndexDefinitionView: function (indexDefinition) {
		var indexDefinitionView = new RWS.Views.IndexDefinitionView({ indexDefinition: indexDefinition });
		this._indexDefinitionViews.push(indexDefinitionView);
		$('#index-definition-list').append(indexDefinitionView.render().el);
	}
});

window.RWS.Views.IndexDefinitionView = Backbone.View.extend({
    tagName: 'li',

    initialize: function (options) {
        _.extend(this, Backbone.Events);
		this._indexDefinition = options.indexDefinition;
    },

	render: function () {
		this.$el.append(ich.indexSummaryTemplate(this._indexDefinition.toJSON()));
		return this;
	}
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
		this.appView = new RWS.Views.AppView({ app: this });
		this.router = new RWS.Router();
    },

	showIndexDefinitions: function () {
		var self = this;
		$.ajax({
		   type: 'GET',
		   url:'http://localhost:8080/indexes',
		   success: function(data, textStatus, XMLHttpRequest){
				console.log(data);
				self.indexDefinitions.add(data);
		        //alert(XMLHttpRequest.getResponseHeader('some_header'));
		   },
		   error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert(errorThrown)
		        //alert(XMLHttpRequest.getResponseHeader('some_header'));
		   }
		  });
	},
	
	showDocuments: function () {
		
	}
});

$(function() {
	window.app = new RWS.App();
	Backbone.history.start({ pushState: false });
});
