Box.Application.addService('templates', function(application){
  'use strict';

  var _handlebars;

  return {
    render: render,
    renderPartial: renderPartial
  };


  /**
   * Renders HTML for a handlebars template
   * @param {String} templateName - the name of the compiled template to use
   * @param {Object} params - values to pass into the template for rendering
   * @returns {String|null} rendered HTML string or null if template not found
   */
  function render(templateName, params){
    _getHandlebars();
    var template =_handlebars.Templates[templateName];
    if (!template) {
      throw 'Template "' + templateName + '" not found.';
    }
    return template ? template(params) : null;
  }

  function renderPartial(templateName, params) {
    _getHandlebars();
    var template = _handlebars.partials[templateName];
    if (!template) {
      throw 'Partial template "' + templateName + '" not found.';
    }
    return template ? template(params) : null;
  }

  function _getHandlebars() {
    if (!_handlebars) {
      _handlebars = application.getGlobal('Handlebars');
    }
    return;
  }

});