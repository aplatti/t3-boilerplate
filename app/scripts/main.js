$(function() {
  'use strict';


  // render initial templates into page
  var templateService = Box.Application.getService('templates');
  $('#content').append(
    templateService.render('main')
  );


  Box.Application.init({
    debug: true
  });
}());