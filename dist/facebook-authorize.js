/**
 * jquery-facebook-authorize - jQuery Plugin to simplify the process of requesting
 * Facebook permissions, such that you only proceed forward in sign-up
 * once the user has granted all you require.
 *
 * URL: http://pstrinkle.github.com/jquery-facebook-authorize
 * Author: Patrick Trinkle <https://github.com/pstrinkle>
 * Version: 1.0.0
 * Copyright 2016 Patrick Trinkle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function ($) {
    function FacebookAuthorize(config) {
        this.init(config);
    }

    FacebookAuthorize.prototype = {
        /**
         * required
         *
         * All specified permissions must be granted by the user before it 
         * calls success.
         *
         */
        required: [],

        /**
         * optional
         *
         * These are requested, but not required before calling success.
         */
        optional: [],

        //----------------------- protected properties and methods -------------

        /**
         * granted
         *
         * A list of all permissions granted.
         */
        granted: [],

        /**
         * @protected
         */
        constructor: FacebookAuthorize,

        /**
         * Container element. Should be passed into constructor config
         * @protected
         * @type {jQuery}
         */
        el: null,

        /**
         * Init/re-init the object
         * @param {object} config - Config
         */
        init: function(config) {
            $.extend(this, config);
        },

        dataName: 'facebookAuthorize',
        
        clickHandler: function(event) {
            console.log('clicked!');
            var el = $(this);
            var dataName = FacebookAuthorize.prototype.dataName;
            var instance = el.data(dataName);

            /* yes, they could just bind their own click handler, but hey,
             * this is pretty easy too. :D
             */
            el.trigger('facebook-request-clicked');

            var params = {};
            var requesting = [];

            $.each(instance.required, function(index, element) {
                if (-1 == $.inArray(element, instance.granted)) {
                    requesting.push(element);
                }
            });

            $.each(instance.optional, function(index, element) {
                if (-1 == $.inArray(element, instance.granted)) {
                    requesting.push(element);
                }
            });

            console.log('requesting: ' + requesting);

            if (instance.granted.length > 0) {
                /* it's a rerequest. */
                params['auth_type'] = 'rerequest';
                params['scope'] = requesting.join(',');
                params['return_scopes'] = true;
            } else {
                /* it's the first request. */
                params['scope'] = requesting.join(',');
                params['return_scopes'] = true;
            }

            FB.login(function(response) {
                if (response.status === 'connected') {
                    var missing_required = [], missing_optional = [];

                    console.log(response);
                    console.log(response.authResponse.accessToken);
                    console.log(response.authResponse.grantedScopes);
                    console.log(response.authResponse.userID);

                    /** @note: scopes is always their full granted list. */
                    var scopes = response.authResponse.grantedScopes.split(",");
                    console.log('scopes: ' + scopes);
                    $.each(scopes, function(index, element) {
                        instance.granted.push(element);
                    });
                    
                    console.log('required: ' + instance.required);
                    console.log('optional: ' + instance.optional);

                    /* Check if the required are all there. */
                    $.each(instance.required, function(index, element) {
                        if (-1 == $.inArray(element, instance.granted)) {
                            missing_required.push(element);
                        }
                    });

                    console.log('missing_required: ' + missing_required);

                    if (missing_required.length > 0) {
                        el.trigger('facebook-missing-required', missing_required.join(","));
                        return;
                    }
                    
                    /* Check if any of the optional are missing (which is fine). */
                    $.each(instance.optional, function(index, element) {
                        if (-1 == $.inArray(element, instance.granted)) {
                            missing_optional.push(element);
                        }
                    });

                    /* Trigger the appropriat event. */
                    /* It _is_ silly to pass in scopes here, since it's part of
                     * response.authResponse.
                     */
                    el.trigger('facebook-success',
                               [scopes.join(","),
                                missing_optional.join(","),
                                response.authResponse]);
                    return;

                } else if (response.status === 'not_authorized') {
                    // The person is logged into Facebook, but not your app.
                    el.trigger('facebook-not-authorized');
                } else {
                    // The person is not logged into Facebook, so we're not sure if
                    // they are logged into this app or not.
                    el.trigger('facebook-not-loggedin');
                }
            }, params);
        },
    }
    
    //----------------------- Initiating jQuery plugin -------------------------

    /**
     * Set up a Facebook login handler that won't pass on success until all the
     * required permissions are granted.
     * 
     * @param configOrCommand - Config object or command name
     *     Example: { ... };
     *     you may set any public property (see above);
     * 
     */
    $.fn.facebookAuthorize = function(configOrCommand) {
        /* It is possible that the text will be updated out of sequence
         * because of the timeouts, that you might not end up with the
         * right value, so the right value is basically always in data.
         */
    	var dataName = FacebookAuthorize.prototype.dataName;

        /* handle init here, I later plan to use other options, such as formatting. */
        return this.each(function() {
            var el = $(this), instance = el.data(dataName),
                config = $.isPlainObject(configOrCommand) ? configOrCommand : {};

            if (instance) {
                /* they've set up some data values for us already to use. */
                instance.init(config);
            } else {
                var initialConfig = $.extend({}, el.data());
                config = $.extend(initialConfig, config);
                config.el = el;

                instance = new FacebookAuthorize(config);
                el.data(dataName, instance);
            }
            
            el.on('click', instance.clickHandler);
        });
    };
}(jQuery));
