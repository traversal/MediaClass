/*! MediaClass.js v0.0.1 | MIT License | github.com/jonathantneal/MediaClass */

(function (global, documentElement) {
  function resetMediaFeatures() {
    if(global.resetTimer) clearTimeout(global.resetTimer);
    global.resetTimer = setTimeout(getMediaFeatures, 100);
  }

	function getMediaFeatures() {
		media.width = global.innerWidth || documentElement.clientWidth;
		media.height = global.innerHeight || documentElement.clientHeight;
		media.aspectRatio = media.width / media.height;
		media.orientation = media.width > media.height ? "landscape" : "portrait";

		media.deviceWidth = screen.width;
		media.deviceHeight = screen.height;
		media.deviceAspectRatio = media.deviceWidth / media.deviceHeight;
		media.deviceOrientation = media.deviceWidth > media.deviceHeight ? "landscape" : "portrait";
    mediaLoop();
	}

	function getElementMediaFeatures(element) {
		var coordinates = element.getBoundingClientRect();

		media.thisWidth = coordinates.width || coordinates.right - coordinates.left;
		media.thisHeight = coordinates.height || coordinates.bottom - coordinates.top;
		media.thisAspectRatio = media.thisWidth / media.thisHeight,
		media.thisOrientation = media.thisWidth > media.thisHeight ? "landscape" : "portrait";
	}

	function evalMediaQuery(query) {
		return Function("d", "return(" + query
		.replace(/\(|\)/g, "")
		.replace(/\s*,\s*/g, ") || (")
		.replace(/\s+and\s+/gi, " && ")
		.replace(/min-(.*?):/gi, "$1>=")
		.replace(/max-(.*?):/gi, "$1<=")
		.replace(/above-(.*?):/gi, "$1>")
		.replace(/below-(.*?):/gi, "$1<")
		.replace(/min-|max-/gi, "")
		.replace(/(all|screen|print)/, "d.$1")
		.replace(/:/g, "==")
		.replace(/([\w-]+)\s*([<>=]+)\s*(\w+)/g, function ($0, $1, $2, $3) {
			return "d." + toCamelCase($1) + $2 + parseCSSNumber($3);
		})
		.replace(/([<>=]+)([A-z][\w-]*)/g, '$1"$2"') + ")")(media);
	}

	function toCamelCase(value) {
		return value.toLowerCase().replace(/-[a-z]/g, function ($0) {
			return $0[1].toUpperCase();
		});
	}

	function parseCSSNumber(value) {
		return value.replace(/([\d\.]+)(%|em|in|pt|px)/, function ($0, $1, $2) {
			return ($2 == "em") ? $1 * 16 : ($2 == "in") ? $1 * 96 : ($2 == "pt") ? $1 * 96 / 72 : ($2 == "%") ? $1 / (scope.innerWidth || documentElement.clientWidth) : $1;
		});
	}

	var
	media = { all: true, screen: true, print: false },
	eventMethod = ("addEventListener" in global ? "addEventListener " : "attachEvent on").split(" "),
	eventType = "blur orientationchange resize".split(" "),
	eventIndex = 0;

	for (; eventType[eventIndex]; ++eventIndex) {
		global[eventMethod[0]](eventMethod[1] + eventType[eventIndex], resetMediaFeatures);
	}

	var
	LastIndexOf = Array.prototype.lastIndexOf || function (value) { for (var length = this.length; --length > -1;) if (this[length] == value) break; return length; },
	addClass = function (element, className) {
		var classList = element.className ? element.className.split(/\s+/) : [], index = LastIndexOf.call(classList, className);
		if (index < 0) element.className = classList.concat(className).join(" ");
	},
	removeClass = function (element, className) {
		var classList = element.className ? element.className.split(/\s+/) : [], index = LastIndexOf.call(classList, className);
		if (index > -1 && classList.splice(index, 1)) element.className = classList.join(" ");
	},
	mediaList = [];

  function fireEvent(element, name, data) {
      
    var event;
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent(name, true, true);
    } else {
      event = document.createEventObject();
      event.eventType = name;
    }

    event.eventName = name;
    event.data = data || { };

    if (document.createEvent) {
      element.dispatchEvent(event);
    } else {
      element.fireEvent("on" + event.eventType, event);
    }
        
  }
    
	function mediaLoop() {

    var seen = {};
    var elements = [];
    
		for (var i = 0, item, match, element; item = mediaList[i]; ++i) {
			match = item.media.match(/(.+?):media\((.+?)\)/);

			if (match) {

				if (documentElement.querySelectorAll) {
					all = documentElement.querySelectorAll(match[1]);

					for (var index = 0; element = all[index]; ++index) {
						/this/.test(match[2]) && getElementMediaFeatures(element);
						evalMediaQuery(match[2]) ? addClass(element, item.className) : removeClass(element, item.className);
            
            if (!seen[element]) {
              seen[element] = true;
              elements[elements.length] = element;
            }
					}
          
				}
        
			} else {

				evalMediaQuery(item.media) ? addClass(documentElement, item.className) : removeClass(documentElement, item.className);
        
        if (!seen[documentElement]) {
          seen[documentElement] = true;
          elements[elements.length] = documentElement;
        }
        
			}

		}
    
    for (var e = 0; e < elements.length; e++) {
      fireEvent( elements[e], "mediaclassupdated", { className: elements[e].className } );
    }
    
	}

	function MediaQuery(className, mediaQuery) {
		var self = this, enabled = 1;

		self.className = className;
		self.media = mediaQuery;
		self.index = mediaList.push(self) - 1;
		self.enable = function () { if (!enabled) { self.index = mediaList.push(self) - 1; enabled = true; } };
		self.disable = function () { if (enabled) { mediaList.splice(self.index, 1); enabled = false; } };
	}

	global.MediaClass = function (className, mediaQuery, initOnly) {
		var mq = new MediaQuery(className, mediaQuery);
    
    if (!initOnly) {
      mediaLoop();
    }
    
		return mq;
	};

	getMediaFeatures();
})(this, document.documentElement);
