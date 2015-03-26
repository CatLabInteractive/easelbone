define (
	[],
	function ()
	{

		var Path = function (minimum, maximum) {

			this.start = { 'x' : minimum.x, 'y' : minimum.y };
			this.end = { 'x' : maximum.x, 'y' : maximum.y };

			this.distance = {
				'x' : (maximum.x - minimum.x),
				'y' : (maximum.y - minimum.y)
			};
		};

		Path.prototype.getPosition = function (progress) {

			return {
				'x' : this.start.x + (this.distance.x * progress),
				'y' : this.start.y + (this.distance.y * progress)
			}

		};

		Path.prototype.position = function (element, progress) {

			var location = this.getPosition (progress);
			element.x = location.x;
			element.y = location.y;

		};

		return Path;
	}
);