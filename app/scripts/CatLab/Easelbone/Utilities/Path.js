define (
	[],
	function ()
	{
		var dp, value;

		var Path = function (minimum, maximum) {

			this.start = { 'x' : minimum.x, 'y' : minimum.y };
			this.end = { 'x' : maximum.x, 'y' : maximum.y };

			this.distance = {
				'x' : (maximum.x - minimum.x),
				'y' : (maximum.y - minimum.y)
			};

			this.orientation = (this.distance.x > this.distance.y) ? 'horizontal' : 'vertical';
		};

		Path.prototype.getPosition = function (progress) {

			return {
				'x' : this.start.x + (this.distance.x * progress),
				'y' : this.start.y + (this.distance.y * progress)
			}

		};

		/**
		 * Return an estimated value from x and y values.
		 * @param x
		 * @param y
		 */
		Path.prototype.getValue = function (x, y) {

			if (this.orientation === 'horizontal') {
				dp = (x - this.start.x) / this.distance.x;
			}
			else {
				dp = (y - this.start.y) / this.distance.y;
			}

			value = Math.max (0, Math.min (1, dp));
			return value;
		};

		Path.prototype.position = function (element, progress) {

			var location = this.getPosition (progress);
			element.x = location.x;
			element.y = location.y;

		};

		return Path;
	}
);