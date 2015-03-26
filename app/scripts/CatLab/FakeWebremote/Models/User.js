define (
	[],
	function ()
	{
		return function (aAccessToken)
		{
			var accessToken = aAccessToken;
			var name;
			var avatar;
			var id;

			this.getAccessToken = function ()
			{
				return accessToken;
			};

			this.setId = function (aId)
			{
				id = aId;
			};

			this.getId = function ()
			{
				return id;
			};

			this.setName = function (aName)
			{
				name = aName;
			};

			this.getName = function ()
			{
				return name;
			};

			this.setAvatar = function (aAvatar)
			{
				avatar = aAvatar;
			};

			this.getAvatar = function ()
			{
				return avatar;
			};
		};
	}
);