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
        app.indexDefinitions.on('add', this._addIndexDefinitionView, this);

        //$('#database-tabs').tab('show')
    },

    _addIndexDefinitionView: function (indexDefinition) {
        console.log(indexDefinition);
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
            url: 'http://localhost:8080/indexes',
            success: function (data, textStatus, jqXHR) {
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

    }
});

$(function() {
	new RWS.App();
	Backbone.history.start({ pushState: false });
});
