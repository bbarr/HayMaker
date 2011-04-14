(function($) {
	
	if (typeof $.HayMaker !== 'undefined') {
		throw new Error('What are the chances of another plugin called HayMaker?! Or, is this script being loaded multiple times?...');
	}
	
	$.HayMaker = function() {
		
		if (!(this instanceof $.HayMaker)) {
			return new $.HayMaker();
		}
		
		$.HayMaker.count++;
		this.cache = {};
		this.queue = [];
		this.working = false;
		this.session = (window.sessionStorage) ? window.sessionStorage.hay = '' : '';
		this.start_time;
		
		// image for capturing preloaded images
		var _this = this;
		this.img = $('<img />')
			.attr({ 'id': 'hay_maker_image_' + $.HayMaker.count, 'style' : 'display: none' })
			.load(function() { _this._process(this.src); })
			.appendTo(document.body)[0];
		
	};
	
	$.HayMaker.count = 0;

	$.HayMaker.prototype = {

		queue: function(uris) {

			if (typeof uris === 'string') {
				this.queue.push(uris);
			}
			else {
				this.queue = this.queues.concat(uris);
			}
			
			var _this = this;
			$(document)[ ($.HayMaker.waiting) ? 'ajaxStop' : 'ready' ](function() { 
				$.HayMaker.waiting = false;
				_this.start(); 
			});
		},
		
		pause: function() { 
			this.waiting = true; 
		},
		
		start: function() {
			this.start_time = $.now();
			this._dequeue();
		},
		
		_dequeue: function() {
			
			this.working = (!this.waiting && this.queue.length > 0);
			if (!this.working) {
				return;
			}
			
			var uri = this.queue.shift();
			if (this._is_logged(uri)) {
				return;
			}
			
			if (/(.jpg|.png|.gif)$/.test(uri)) {
				this.img.src = uri;
			}
			else {
				var _this = this;
				$.get(uri, function(data) {
					_this._process(uri, data);
				});
			}
		},
		
		_process: function(uri, data) {
			
			if (data) {
				this.cache[uri] = data;
			}

			// if has been loading for more than 300ms, release ui thread
			if (this.start_time - $.now() > 300) {
				var _this = this;
				window.setTimeout(_this.start, 0);
			}
			else {
				this._dequeue();
			}
		},
		
		_log: function(uri) {
			this.session += (uri + ';');
		}
		
		_is_logged: function(uri) {
			return (this.session.indexOf(uri) > -1);
		}
		
	};
	
	// detect start of any initial ajax requests
	$(window).ajaxStart(function() {
		$.HayMaker.waiting = true;
	});

})(jQuery);