var mtUtil = {

	log: function(origin, level, object) {
		console.groupCollapsed(origin);
		console.log(object);
		console.groupEnd();
	},

	// DataType
	date: {
		date_to_str(date, format) { // Chuyển date thành string format dd/MM/yyyy HH:mm:ss
			if (format == null || format.length == '')
				format = 'dd/MM/yyyy HH:mm:ss';

			let strDate = format;

			// Day
			if (format.indexOf('dd') > -1)
				strDate = strDate.replace('dd', String(date.getDate()).padStart(2, '0'));

			// Month
			if (format.indexOf('MM') > -1)
				strDate = strDate.replace('MM', String(date.getMonth() + 1).padStart(2, '0'));

			// Year
			if (format.indexOf('yyyy') > -1)
				strDate = strDate.replace('yyyy', date.getFullYear());
			else if (format.indexOf('yy') > -1)
				strDate = strDate.replace('yy', date.getFullYear() % 100);

			// Hour
			if (format.indexOf('HH') > -1)
				strDate = strDate.replace('HH', String(date.getHours()).padStart(2, '0'));

			// Minute
			if (format.indexOf('mm') > -1)
				strDate = strDate.replace('mm', String(date.getMinutes()).padStart(2, '0'));

			// Second
			if (format.indexOf('ss') > -1)
				strDate = strDate.replace('ss', String(date.getSeconds()).padStart(2, '0'));

			return strDate;
		}
	},
};
export default mtUtil;