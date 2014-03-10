(function(){

  var who = window.who || (window.who = {});

  who.graph = function(){

    var width = 600,
    	height = 600,
      internalView = 0,
      _state = {},
      _currentView,
      _s,
      _graph,
      _dbGraph,
      _options,
      settings,
      _views,
      parserURL,
      parserFnc,
      queryPosScale,
      dispatch = d3.dispatch("steplimit");


    function vis(selection){
    	selection.each(function(data){


       /**
   * SCENARIO FUNCTIONS:
   * *******************
   */
  function parseColor(val) {
    var result = [0, 0, 0];

    if (val.match(/^#/)) {
      val = (val || '').replace(/^#/, '');
      result = (val.length === 3) ?
        [
          parseInt(val.charAt(0) + val.charAt(0), 16),
          parseInt(val.charAt(1) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(2), 16)
        ] :
        [
          parseInt(val.charAt(0) + val.charAt(1), 16),
          parseInt(val.charAt(2) + val.charAt(3), 16),
          parseInt(val.charAt(4) + val.charAt(5), 16)
        ];
    } else if (val.match(/^ *rgba? *\(/)) {
      val = val.match(
        /^ *rgba? *\( *([0-9]*) *, *([0-9]*) *, *([0-9]*) *(,.*)?\) *$/
      );
      result = [
        +val[1],
        +val[2],
        +val[3]
      ];
    }

    return {
      r: result[0],
      g: result[1],
      b: result[2]
    };
  }

  function interpolateColors(c1, c2, p) {
    var c = {
      r: c1.r * (1 - p) + c2.r * p,
      g: c1.g * (1 - p) + c2.g * p,
      b: c1.b * (1 - p) + c2.b * p
    };

    return 'rgb(' + [c.r | 0, c.g | 0, c.b | 0].join(',') + ')';
  }

  function animate(config, callback) {
    var k,
        camTarget,
        camPosition,
        cam = _s.cameras[0],
        set = _s.settings('enableCamera'),
        easing = sigma.utils.easings.quadraticOut,
        start = sigma.utils.dateNow();

    _s.graph.nodes().forEach(function(n) {
      for (k in config)
        if (k !== 'camera') {
          if (!k.match(/color$/)){
            n['start_' + k] = n[k];

          }else
            {n['start_' + k] = parseColor(n[k]);}
        }
    });

    // _s.graph.edges().forEach(function(n) {
    //   for (k in config)
    //     if (k !== 'camera') {
    //       if (!k.match(/color$/)){
    //         n['start_' + k] = n[k];

    //       }else
    //         {n['start_' + k] = parseColor(n[k]);}
    //     }
    // });

    if (config.camera) {
      camPosition = {
        x: cam.x,
        y: cam.y,
        angle: cam.angle,
        ratio: cam.ratio
      }

      if (typeof config.camera === 'function')
        camTarget = localZoom(config.camera);
      else
        camTarget = config.camera;
    } else {
      cam.x = 0;
      cam.y = 0;
      cam.angle = 0;
      cam.ratio = 1;
    }

    function step() {
      var t = (sigma.utils.dateNow() - start) / _options.duration,
          p = easing(t);

      if (t < 1) {
        _s.graph.nodes().forEach(function(n) {
          for (k in config)
            if (!k.match(/color$/))
              n[k] = n['start_' + k] + p * (n[config[k]] - n['start_' + k]);
            else
              n[k] = interpolateColors(
                n['start_' + k],
                parseColor(n[config[k]]),
                p
              );
        });

        // _s.graph.edges().forEach(function(n) {
        //   for (k in config)
        //     if (!k.match(/color$/))
        //       n[k] = n['start_' + k] + p * (n[config[k]] - n['start_' + k]);
        //     else
        //       n[k] = interpolateColors(
        //         n['start_' + k],
        //         parseColor(n[config[k]]),
        //         p
        //       );
        // });

        if (camTarget)
          for (k in camTarget)
            cam[k] = camPosition[k] * (1 - p) + camTarget[k] * p;

        //console.log(cam.x, cam.y);
        _s.refresh();

        window.requestAnimationFrame(step);
      } else {
        _s.graph.nodes().forEach(function(n) {
          for (k in config)
            n[k] = n[config[k]];
        });

        // _s.graph.edges().forEach(function(n) {
        //   for (k in config)
        //     n[k] = n[config[k]];
        // });

        if (typeof callback === 'function')
          callback();
      }
    }

    step();
  }

  function localZoom(filterFunction) {
    // The "rescale" middleware modifies the position of the nodes, but we
    // need here the camera to deal with this. Here is the code:
    var xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity,
        margin = 10,
        w = _s.renderers[0].width,
        h = _s.renderers[0].height,
        scale;

    _s.graph.nodes().forEach(function(n) {
      if (filterFunction(n)) {
        xMin = Math.min(n['read_cam0:x'], xMin);
        xMax = Math.max(n['read_cam0:x'], xMax);
        yMin = Math.min(n['read_cam0:y'], yMin);
        yMax = Math.max(n['read_cam0:y'], yMax);
      }
    });

    xMax += margin;
    xMin -= margin;
    yMax += margin;
    yMin -= margin;

    scale = Math.min(
      w / Math.max(xMax - xMin, 1),
      h / Math.max(yMax - yMin, 1)
    );

    return {
      x: (xMin + xMax) / 2,
      y: (yMin + yMax) / 2,
      ratio: 1 / scale
    };
  }

  function filterInnerCircle() {
    _s.graph.nodes().filter(function(n, i) {
      return i >= _options.innerCircleCount;
    }).map(function(n) {
      _s.graph.dropNode(n.id);
    });
  }

  function getMinAttribute(graph, type, n, attribute, ev){

  var ids = graph.nodes().filter(function(d){return d.attributes[attribute] === ev}).map(function(d){return d.id})
  var attrValues = graph.degree(ids, type).sort(d3.descending).slice(0,n)

  return d3.min(attrValues)

  }

  /**
   * GLOBAL APP VARS:
   * ****************
   */

  sigma.utils.pkg('sigma.canvas.labels');
  sigma.canvas.labels.def = function(node, context, settings) {
       var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    if(node.selected){
          fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] - ((node.label.length * fontSize)/4) ),
        Math.round(node[prefix + 'y'] + fontSize +5 )
      );
    }

    else if (size < settings('labelThreshold')){
      return;
    }

    else if (typeof node.label !== 'string'){
      return;
    }
    else{
      fontSize = (settings('labelSize') === 'fixed') ?
        settings('defaultLabelSize') :
        settings('labelSizeRatio') * size;

      context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
        fontSize + 'px ' + settings('font');
      context.fillStyle = (settings('labelColor') === 'node') ?
        (node.color || settings('defaultNodeColor')) :
        settings('defaultLabelColor');

      if(node.labelAdjust){
      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] + 5 ),
        Math.round(node[prefix + 'y'] + fontSize/4 )
      );
    }else{
      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] - ((node.label.length * fontSize)/4) ),
        Math.round(node[prefix + 'y'] + fontSize +5 )
      );
    }
    }
    }

  sigma.utils.pkg('sigma.canvas.nodes');

  sigma.canvas.nodes.who = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );

    context.closePath();
    context.fill();

    if (settings('drawEdges')){
      context.restore();

      // Draw the border:
      context.beginPath();
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        node[prefix + 'size'],
        0,
        Math.PI * 2,
        true
      );
      context.lineWidth = node[prefix + 'size'] / 10;
      //context.lineWidth = 0.5;
      context.strokeStyle = settings('borderColor') || node.color;
      context.stroke();
    }
  };


  var goodColors = {
    "M" : "#84A594",
    "C" : "#D6C33B",
    "E" : "#E93A32",
    "V" : "#425863"
  }
  
  var queryPosition = queryPosScale;


  if($(selection.node()).is(':empty')){
    // _options = {
    //     innerCircleCount: 0,
    //     innerRadius: 500,
    //     outerRadius: 674,
    //     duration: 500,
    //     action: 0,
    //     ratio: 3
    //   }

      _s = new sigma({
        renderer: {
          //container: document.getElementById('graph'),
          container: selection.node(),
          type: 'canvas'
        },
        settings: settings
      })


    sigma.parsers.json(
      parserURL,
      parserFnc
    );

  }else{
     if(internalView >= 0 && internalView < (_views.length)){
      applyView(internalView);
    }else{
      dispatch.steplimit()
    }
  }

  function applyView(view) {
    var oldView = _views[_currentView] || {},
        newView = _views[_currentView = view];

    // Check center (neighborhood plugin):
    if (oldView.center !== newView.center) {
      if (newView.center)
        _s.graph.clear().read(_dbGraph.neighborhood(newView.center));
      else
        _s.graph.clear().read(_graph);
    }

    // Filter:
    if (oldView.filter !== newView.filter) {
      if (newView.filter)
        newView.filter();
      else
        _s.graph.clear().read(_graph);
    }

    // ForceAtlas 2:
    if (oldView.forceAtlas2 !== newView.forceAtlas2) {
      if (newView.forceAtlas2)
        _s.startForceAtlas2();
      else
        _s.stopForceAtlas2();
    }

    // Settings:
    _s.settings(newView.settings);

    // Init:
    if (newView.init)
      newView.init();

    // Animation:
    if (newView.animation) {
      _s.settings('drawEdges', false);
      animate(newView.animation, function() {
        _s.settings(newView.settings);
        _s.refresh();
      });
    } else
      _s.refresh();
  }

    	}); //end selection
    } // end vis

    vis.width = function(x){
      if (!arguments.length) return width;
      width = x;
      return vis;
    }

    vis.height = function(x){
      if (!arguments.length) return height;
      height = x;
      return vis;
    }

    vis._options= function(x){
      if (!arguments.length) return _options
      _options= x;
      return vis;
    }

    vis.settings = function(x){
      if (!arguments.length) return settings 
      settings = x;
      return vis;
    }

    vis._views = function(x){
      if (!arguments.length) return _views 
      _views = x;
      return vis;
    }

    vis.parserURL = function(x){
      if (!arguments.length) return parserURL 
      parserURL = x;
      return vis;
    }

    vis.parserFnc = function(x){
      if (!arguments.length) return parserFnc 
      parserFnc = x;
      return vis;
    }

    vis.queryPosScale = function(x){
      if (!arguments.length) return queryPosScale 
      queryPosScale = x;
      return vis;
    }

    vis.internalView= function(x){
      if (!arguments.length) return internalView
      internalView= x;
      return vis;
    }

    d3.rebind(vis, dispatch, 'on');

    return vis;
  }
  
})();