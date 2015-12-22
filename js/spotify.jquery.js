// Utility
if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {}

        F.prototype = obj;
        return new F();
    };
}

(function($, window, document, undefined) {
    var SpotifyPlugin = {

        // Initalization
        init: function(options, elem) {
            var self = this;

            self.elem = elem;
            self.$elem = $(elem);

            self.options = $.extend({}, $.fn.querySpotify.options, options);
            // console.log(self.options.search);
            self.fetch().done(function(results) {

                self.buildFragment(results);
                self.display();

                if (typeof self.options.onComplete === 'function') {
                    self.options.onComplete(results);
                }
            });
        },

        // Make the ajax JSON request
        fetch: function() {
            // console.log(this.options.type);
            if (this.options.type == 'artist') {
                return $.ajax({
                    url: this.options.url,
                    data: {
                        ids: this.options.search,
                        type: this.options.type,
                        limit: this.options.limit
                    },
                    dataType: 'json'
                });
            } else if (this.options.type == 'query') {
                return $.ajax({
                    url: this.options.url,
                    data: {
                        query: this.options.search,
                        type: 'artist',
                        limit: this.options.limit
                    },
                    dataType: 'json'
                });
            }

        },

        // Build fragment from results
        buildFragment: function(results) {
            var self = this;
            var footerInfo;

            if (typeof self.options.createFooter == 'function') {
                footerInfo = self.options.createFooter(results);
            }

            if (typeof self.options.editResponse !== 'function') {
                return;
            }

            results = self.options.editResponse(results);

            var source = self.options.handlebarsTemplate.html();
            var template = Handlebars.compile(source);
            self.fragment = template(results);


            if (footerInfo != "undefined") {
                self.fragment = self.fragment + footerInfo;
            }

        },

        // Display the fragment
        display: function() {

            var self = this;

            if (self.options.transition === 'none' || !self.options.transition) {
                self.$elem.html(self.fragment);
            } else {
                self.$elem[self.options.transition](200, function() {
                    $(this).html(self.fragment)[self.options.transition](200);
                });
            }
        }
    };

    $.fn.querySpotify = function(options) {

        return this.each(function() {
            var spotifyPlugin = Object.create(SpotifyPlugin);
            spotifyPlugin.init(options, this);
            $.data(this, 'blah', spotifyPlugin);
        });
    };

    $.fn.querySpotify.options = {
        search: 'artist', // Search query
        handlebarsTemplate: null, // Template to format results
        limit: 10,
        onComplete: null,
        transition: 'fadeToggle',
        url: 'https://api.spotify.com/v1/search?',
        type: 'artist',
        editResponse: null, // dig the data array from the results
        createFooter: null // show something under the element
    };

})(jQuery, window, document);
