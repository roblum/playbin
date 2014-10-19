require.config({

        paths: {
            "jquery": "jquery.min",
            "underscore": "underscore.min",
            "backbone": "backbone.min"
        }
        
    });

require(['jquery', 'underscore', 'backbone'], function( $, _, Backbone ){

		var TodoModel = Backbone.Model.extend({});
		var todoItem = new TodoModel();

		todoItem.set({'item': 'go to supermarket'});

		var TodoView = Backbone.View.extend({
			render : function(){
				var html = '<li>' + this.model.get('item') + '</li>';
				$(this.el).html(html);
			}
		});

		var todoView = new TodoView({model : todoItem});

		todoView.render();
		$('body').html(todoView.el);

});