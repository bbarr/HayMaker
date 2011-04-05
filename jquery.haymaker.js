(function($) {
	
	if (typeof $.HayMaker !== 'undefined') {
		throw new Error('What the heck?!');
	}
	
	var _instance;

	$.HayMaker = function() {
		
		if (typeof _instance !== 'undefined') {
			return _instance;
		}
		
		if (!(this instanceof $.HayMaker)) {
			return new $.HayMaker();
		}
		
		this.hay = {};
		this.rows = [];
		this.mowing = false;
		
		var _this = this;
		this.cart = $('<img />').attr({ 'id': 'hay_maker_image' }).load(function() { _this._bale(this.alt, this.src); }).hide().appendTo(document.body)[0];
		
		this.performances = [];
	};

	$.HayMaker.prototype = {

		sow: function(rows) {
			
			if (!rows || rows.length === 0) {
				throw new Error("Must provide a URI or an array of URIs");
			} 
			
			if (typeof rows === 'string') {
				this.rows.push(rows);
			}
			else {
				this.rows = this.rows.concat(rows);
			}
			
			if (!this.mowing) {
				this.mowing = true;
				var _this = this;
				$(document).ready(function() { _this._mow(); });
			}
		},
		
		_get_rest_time: function() {
			
			var performances = this.performances,
				length = performances.length,
				wait_time = 500,
				total_time = 0;
				
			if (length > 0) {
				wait_time = 0;
				for (var i = 0; i < length; i++) {
					total_time += performances[i];
				}
				wait_time = Math.floor(total_time / length);
			}

			return wait_time;
		},
		
		_next_row: function() {	
			
			var _this = this;
			
			setTimeout(function() {
				_this._mow();
			}, this._get_rest_time())
		},
		
		_bale: function(start_time, row, hay) {
			
			this.performances.push($.now() - start_time);
			
			if (hay) {
				this.hay[row] = hay;
			}
			
			this._next_row();
		},
		
		_mow: function() {

			if (this.rows.length === 0) {
				this.mowing = false;
				return;
			}
			
			var _this = this;
			var row = this.rows.shift();
			var start_time = $.now();
			
			if (/(.jpg|.png|.gif)$/.test(row)) {
				this.cart.alt = start_time;
				this.cart.src = row;
			}
			else {
				$.get(row, function(hay) {
					_this._bale(start_time, row, hay);
				});
				
			}
		}
	};

})(jQuery);