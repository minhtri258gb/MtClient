var mtUtil = {

	log: function(origin, level, object) {
		console.groupCollapsed(origin);
		console.log(object);
		console.groupEnd();
	},
};