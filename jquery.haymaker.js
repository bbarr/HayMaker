(function($) {
	
	if (typeof $.HayMaker !== 'undefined') {
		throw new Error('What are the chances of another plugin called HayMaker?! Or, is this script being loaded multiple times?...');
	}
	
	// stores HayMaker singleton
	var _instance;

	$.HayMaker = function() {
		
		if (typeof _instance !== 'undefined') {
			return _instance;
		}
		
		// handle instantiation without the new keyword
		if (!(this instanceof $.HayMaker)) {
			return new $.HayMaker();
		}
		
		var _this = this;
		
		this.hay = {}; // ajax responses { uri: response }
		this.rows = []; // request queue 
		this.mowing = false; // is HayMaker is actively requesting
		
		// image for capturing preloaded images
		this.cart = $('<img />').attr({ 'id': 'hay_maker_image' }).load(function() { _this._bale(this.alt, this.src); }).hide().appendTo(document.body)[0];
		
		this.performances = []; // time of each request in ms
	};

	$.HayMaker.prototype = {

		/**
		 *  Queues up uris for lazy-preloading
		 *  
		 *  @param {String|Array} uri or list of uris
		 */
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
				
				// if ajax requests are still active, wait for them to stop, otherwise, go on document ready
				$(document)[ ($.HayMaker.waiting) ? 'ajaxStop' : 'ready' ](function() { 
					$.HayMaker.waiting = false;
					_this._mow(); 
				});
			}
		},
		
		/**
		 *  Calculates how long to delay next request by averaging previous request times
		 *  with the most recent request accounting for half of the estimate
		 *
		 *  @returns milliseconds for delay of next request
		 *  @type {Number}
		 */
		_get_rest_time: function() {
			
			var performances = this.performances,
				length = performances.length,
				wait_time = 300,
				total_time = 0;
				
			if (length > 0) {
				wait_time = 0;
				for (var i = 0; i < length; i++) {
					total_time += performances[i];
				}
				
				// weight the most recent request heavily
				total_time += (performances[i] * length);
				length += length;
				
				wait_time = Math.floor(total_time / length);
			}

			return wait_time;
		},
		
		/**
		 *  Dequeues next request with calculated amount of rest
		 */
		_next_row: function() {	
			
			var _this = this;
			
			setTimeout(function() {
				_this._mow();
			}, this._get_rest_time())
		},
		
		/**
		 *  Finishes request by recording time elapsed and response
		 *  then tries to continue dequeueing
		 *
		 *  @param {Number} Timestamp of request start 
		 *  @param {String} uri of request
		 *  @param {*} response from request
		 */
		_bale: function(start_time, row, hay) {
			
			this.performances.push($.now() - start_time);
			
			if (hay) {
				this.hay[row] = hay;
			}
			
			this._next_row();
		},
		
		/**
		 *  Makes request and records the time
		 */
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
	
	// detect start of any initial ajax requests
	$(window).ajaxStart(function() {
		$.HayMaker.waiting = true;
	});

})(jQuery);