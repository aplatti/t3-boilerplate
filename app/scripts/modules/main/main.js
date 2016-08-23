Box.Application.addModule('main', function(context) {
  'use strict';

  return {
    init: init,
    onclick: handleOnClick
  };

  function init(){

  }

  function handleOnClick() {
    alert('click');
  }
});