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

