

var TopicSchema = new mongoose.Schema({
	title : String,
	message : String,
	author : String,
	tags : Array,
	privacy : Array,
	creationdate : Date
});
var TopicModel = mongoose.model("topics", TopicSchema);


var TopicManager = function () {

}

TopicManager.prototype = {

	getTopicById : function (id, fn) {
		// TODO : gérer les droits d'accès
		TopicModel.find({_id : id}, {creationdate : 0}, fn);
	},

	getTopicsByTag : function (tag, fn) {
		// TODO : gérer les droits d'accès
		TopicModel.find({tags : tag}, {creationdate : 0}, fn);
	},

	getLastTopics : function (fn) {
		// TODO : gérer les droits d'accès
		// TODO : ajouter la notion d'ordre et la limite
		TopicModel.find(null, {creationdate : 0}, fn);
	},

	getTopics : function (params, fields, fn) {
		TopicModel.find(params, fields, fn);
	}

};

module.exports = TopicManager;