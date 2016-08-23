Box.Application.addService('router', function(application) {
  'use strict';

  var $main;
  var templatesService;
  var _router;
  var _isPushStateSupported = !!(window.history && window.history.pushState);
  var _isFirstSection = true;  // flag to prevent two checks to user service checkTwitchOnlineStatus()


  var _options = {
    html5history: true,

    before: function() {
      Box.Application.stopAll($main.get(0));
    },
    on: function() {
      Box.Application.startAll($main.get(0));
    },
    notfound: function() {
      Box.Application.stopAll($main.get(0));
      _renderMainSectionTemplates('not-found');
    }
  };

  var _routes = {
    '/insights': function() {
      _renderMainSectionTemplates('section-insights');
    },
    '/game-cards': function() {
      _renderMainSectionTemplates('section-game-cards');
    },
    '/boost': function() {
      _renderMainSectionTemplates('section-boost');
    }
  };


  return {
    go: go,
    goOffSite: goOffSite,
    goTopStreamer: goTopStreamer,
    isSection: isSection,
    init: init
  };

  function init() {
    templatesService = application.getService('templates');
    $main = $('#main-section');

    // initilize the Flatiron/Director router object with routes and options
    var routerObj = application.getGlobal('Router');
    _router = new Router(_routes).configure(_options);
    _router.init();

    // put router in state for current page
    var path = window.location.pathname;
    path = (path == '/') ? '/insights' : path;
    if (path !== window.location.pathname) {
      window.history.replaceState({}, "MODD", path);
      _router.dispatch('on', path);
    }

    _attachClickHandler();
  }


  /**
   * navigate to new path within this SPA
   */
  function go(path) {
    _router.setRoute(path);
  }


  /**
   * Navigate to a page outside of current SPA
   */
  function goOffSite(url) {
    window.location.href = url;
  }

  /**
   * Switch to viewing the dashboard for the top current Twitch top streamer
   * @returns {void}
   */
  function goTopStreamer() {
    application.getService('top-streamer').get(function(name) {
      window.location.href = window.location.pathname + '?streamer=' + name;
    });
  }

  /**
   * Returns true if the user is currently viewing the section name passed in
   */
  function isSection(name) {
    var path = window.location.pathname.substring(1);  // stripps off leading slash ('/insights' => 'insights')

    return (name === path);
  }


  /**
   * Document click handler that performs pushState navigation when same-domain hyperlinks
   */
  function _attachClickHandler() {
    var handler = function(event) {
      var $target = $(event.target);

      // avoid trapping right clicks
      if (event.button === 2) { return; }

      // for anchor tags, redirect to pushState if staying on the same domain
      var $anchor = $target.closest('a');
      if ($anchor.length && $anchor.attr('href') !== '#') {
        // anchor tag clicked

        // if an anchor with the same domain as page is clicked, perform pushState navigation instead
        var hostname = $anchor.prop('hostname');
        var isSameDomain = (hostname === window.location.hostname);
        if (_isPushStateSupported && isSameDomain && !$anchor.hasClass('allow-default')) {
          // perform a fake navigation within the site
          event.preventDefault();
          event.stopPropagation();

          var url = $anchor.prop('pathname') + window.location.search;
          
          go(url);
          return;
        } else {
          // leaving the site
          return true;
        }
      }
    };

    // detatch any existing click handler of this type, and reattach to ensure only one handler
    $(document).off('click', handler).on('click', handler);
  }


  function _renderMainSectionTemplates(templates, routerArgs) {
    if (!(templates instanceof Array)) {
      templates = [templates];
    }
    $main.empty();

    for(var i= 0; i < templates.length; i++) {
      $main.append(templatesService.render(templates[i], {routeParams: routerArgs}));
    }

    // for first section load, we already know twitch online status, so avoid broadcasting two events,
    //  which causes modules to double initialize right now.
    if (!_isFirstSection) {
      // have the app check and broadcast the online status to boot up the pods in the new section
      application.getService('user').checkTwitchOnlineStatus();
    } else {
      _isFirstSection = false;
    }
  }


});