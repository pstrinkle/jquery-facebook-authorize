# jquery-facebook-authorize
jQuery Plugin to simplify the process of requesting Facebook permissions, such that you only proceed forward in sign-up  once the user has granted all you require.

**This worked with v2.5 and v2.6, I haven't back-tested it, and let me know if it breaks in the future.**

[![Latest release](https://img.shields.io/github/release/pstrinkle/jquery-facebook-authorize.svg)](https://github.com/pstrinkle/jquery-facebook-authorize/releases/latest)
[![npm](https://img.shields.io/npm/v/jquery-facebook-authorize.svg)](https://www.npmjs.com/package/jquery-facebook-authorize)

Install
-------

Simply include the asset and the Facebook API, see under Usage below.

Usage
-----

This is simpler, but does require that you initial the Facebook API in your page already, something like the following:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="jquery-facebook-authorize/jquery.facebook-authorize.min.js"></script>

<script>
window.fbAsyncInit = function() {
    FB.init({
        appId   : XXXXXXXXXXXXXXXXXXXXXXX,
        cookie  : true,
        xfbml   : true, /* parse social plugins on this page. */
        version : 'v2.5'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
</script>


<div id='error_msgs'></div>

<div class='row'>
  <button id='facebook_request' class="btn btn-default" style="color:#0b62a4;">
    <i class="fa fa-facebook-square"></i> Login with Facebook
  </button>
</div>

<script>
    $(function() {
        var $fbreq = $('#facebook_request');

        var options = {required : ['public_profile', 'email', 'user_friends', 'publish_actions'],
                       optional: []};
        $fbreq.facebookAuthorize(options);

        $fbreq.on('facebook-request-clicked', function(event) {
            $('#error_msgs').empty();
        });
        $fbreq.on('facebook-missing-required', function(event, missing) {
            $('#error_msgs').text('missing: ' + JSON.stringify(missing));
        });
        $fbreq.on('facebook-success', function(event, granted, missing, details) {
            /* move the user onto whatever step applies. */
            createOrLogin(granted, details);
        });
        $fbreq.on('facebook-not-authorized', function(event) {
            $('#error_msgs').text('not authorized');
        });
        $fbreq.on('facebook-not-loggedin', function(event) {
            $('#error_msgs').text('not logged in...');
        });
    });
</script>
```

Options
-------

| Option  | Description |
| ---- | ---- | ---- |
| required | List of required permissions. |
| optional | List of optional permissions. |

Events
------

| Event | Handler |
| ---- | ---- |
| `facebook-request-clicked` | `function(event)`: <br>- `event` - jQuery event |
| `facebook-missing-required` | `function(event, missing)`: <br>- `event` - jQuery event <br>- `missing` - comma separated string of missing required permissions |
| `facebook-success` | `function(event, granted, missing, details)`: <br>- `event` - jQuery event <br>- `granted` - comma separated string of all permissions granted <br>- `missing` - comma separated list of any missing optional permissions <br>- `details` - Facebook API response.authResponse object |
| `facebook-not-authorized` | `function(event)`: <br>- `event` - jQuery event |
| `facebook-not-loggedin` | `function(event)`: <br>- `event` - jQuery event |

License
-------
[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)
