(function(){

  var who = window.who || (window.who = {});

  who.graph = function(){

    var width = 600,
    	height = 600,
      sectionid,
      internalView = 0,
      goodColors = {
        "M" : "#84A594",
        "C" : "#D6C33B",
        "E" : "#E93A32",
        "V" : "#425863"
      },
      _state = {},
      _currentView,
      _s,
      _graph,
      _dbGraph,
      _options,
      _views,
      views,
      colorScale = d3.scale.category10().domain(["A","B","C","D","E","F"]),
      queryPosition,
      bis1 = {nodes : [], edges: []},
      bis2 = {nodes : [], edges: []},
      scale,
      dispatch = d3.dispatch("steplimit");


    function vis(selection){
    	selection.each(function(data){




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

  
   queryPosition = networkconfig[sectionid].queryPosScale;


  _views = networkconfig[sectionid]._views

  if($(selection.node()).is(':empty')){
    _options = networkconfig[sectionid]._options;


      _s = new sigma({
        renderer: {
          //container: document.getElementById('graph'),
          container: selection.node(),
          type: 'canvas'
        },
        settings: networkconfig[sectionid].settings
      })

      networkconfig[sectionid].parserFnc(data)
  }else{
     if(internalView >= 0 && internalView < (_views.length)){
      applyView(internalView);
    }else{
      dispatch.steplimit()
    }
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

    vis.sectionid= function(x){
      if (!arguments.length) return sectionid
      sectionid= x;
      return vis;
    }

    vis.internalView= function(x){
      if (!arguments.length) return internalView
      internalView= x;
      return vis;
    }

    vis.step = function(){
      return _views.length
    }

    vis.zoomCluster = function(x, x1){
      if(!x1){applyView(_views.length-1)}
      else{zoomCluster(x, x1)}
    }

    vis.toggleSize = function(x){
      if (!arguments.length) return;
      toggleSize(x)

    }

    function toggleSize(attribute) {
          var cam = _s.cameras[0];
            var zoomView = {

              init: function() {
                _s.graph.nodes().forEach(function(node, i, a) {
               
              if(attribute == "in"){
                node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              }else if(attribute == "out"){
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
              }
              else{
              node.target_size = node.file_size / _options.ratio;
              }

            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          // settings: {
          //   drawEdges: true,
          //   labelThreshold: 8,
          //   enableCamera: false,
          //   mouseEnabled : true,
          //   touchEnabled : true
          // },
          animation: {
            //color: 'target_color',
            size: 'target_size',
            //x: 'target_x',
            //y: 'target_y',
            camera: {
                  x: cam.x,
                  y: cam.y,
                  ratio: cam.ratio,
                  angle: cam.angle
            }
          }
          }

            // Init:
              zoomView.init();

            // Animation:
            if (zoomView.animation) {
              _s.settings('drawEdges', false);
              animate(zoomView.animation, function() {
                //_s.settings(zoomView.settings);
                _s.settings('drawEdges', true);
                _s.refresh();
              });
            } else
              _s.refresh();
        }

      function zoomCluster(attribute, value) {
            var zoomView = {

              init: function() {
                _s.graph.nodes().forEach(function(node, i, a) {
              

              if (node.attributes[attribute] === value){

                node.label = node.file_label;
                node.target_color = colorScale(value); 

              }else{
                node.label = null
                node.target_color = '#AAA'; // TODO: Apply good color
              }
              node.target_size = node.file_size / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 8,
            enableCamera: false,
            mouseEnabled : true,
            touchEnabled : true
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: function(n) {
              return n.attributes[attribute] === value;
            }
          }
          }

            // Init:
              zoomView.init();

            // Animation:
            if (zoomView.animation) {
              _s.settings('drawEdges', false);
              animate(zoomView.animation, function() {
                //_s.settings(zoomView.settings);
                _s.settings('drawEdges', true);
                _s.refresh();
              });
            } else
              _s.refresh();
        }


  function place(n) {
         //var scale = 28,
    var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  var r = Math.sqrt(n),
      a = n * GOLDEN_ANGLE;
    return [scale * r * Math.cos(a), scale * r * Math.sin(a)];
  }

  function getMinAttribute(graph, type, n, attribute, ev){

  var ids = graph.nodes().filter(function(d){return d.attributes[attribute] === ev}).map(function(d){return d.id})
  var attrValues = graph.degree(ids, type).sort(d3.descending).slice(0,n)

  return d3.min(attrValues)

  }

  
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

var networkconfig = {
   "fp_crawl_network":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 1500,
        outerRadius: 2000,
        duration: 500,
        action: 0,
        ratio: 5  
      },
    "settings": {
          edgeColor: 'default',
          defaultEdgeColor: 'rgba(17, 17, 17, 0.1)',
          rescaleIgnoreSize: true,
          enableHovering: false,
          mouseEnabled : false,
          touchEnabled : false,
          sideMargin: 50,
          clone: false,
          immutable: false,
          minNodeSize: 0,
          maxNodeSize: 0,
          borderColor: "#fff",
          font: 'Roboto',
          zoomMax: 1
        },
    "parserURL": null,
    "queryPosScale": null,
    "parserFnc": function(graph) {
        // Save the original data:
        graph.nodes.forEach(function(n) {
          n.file_label = n.label;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          delete n.label;



          if (!n.attributes.crwl)
            _options.innerCircleCount++;
        });

        graph.edges.forEach(function(e) {
          delete e.color;
        });

        // Sort nodes:
        graph.nodes = graph.nodes.sort(function(a, b) {
          var c = +!!a.attributes.crwl,
              d = +!!b.attributes.crwl;
          // a = a.label.toLowerCase();
          // b = b.label.toLowerCase();
          a = a.file_label.toLowerCase();
          b = b.file_label.toLowerCase();
          return c < d ? -1 : c > d ? 1 : a < b ? -1 : a > b ? 1 : 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;

          node.size = 0;
          if (i < l) {
            angle = Math.PI * 2 * i / l - Math.PI / 2;
            node.x = _options.innerRadius * Math.cos(angle);
            node.y = _options.innerRadius * Math.sin(angle);
          } else {
            angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
            node.x = _options.outerRadius * Math.cos(angle);
            node.y = _options.outerRadius * Math.sin(angle);
          }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);


        // Read graph:
        _s.graph.read(_graph);

        // Apply first action:
        applyView(0);
      },
    "_views":[
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * ALL GREYS
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount;

              if (i < l) {
                node.target_size = 3;
                //node.target_color = node.file_color; // TODO: Apply good color
                node.target_color = '#425863';
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 8,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS C
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph, null, 3, 'Tag1', 'C');

              delete node.label;
              if (i < l) {
                node.target_size = 2;
                if (node.attributes["Tag1"] === 'C'){
                  node.target_color = goodColors.E; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS B2
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph, null, 3, 'Tag1', 'B2');;

              node.label = null

              if (i < l) {
                node.target_size = 2;
                if (node.attributes["Tag1"] === 'B2'){
                  node.target_color = goodColors.M; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS A11
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph, null, 3, 'Tag1', 'A11');

                  node.label = null;

              if (i < l) {
                node.target_size = 2;
                if (node.attributes["Tag1"] === 'A11'){
                  node.target_color = goodColors.C; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {
        //   /**
        //    * EVERY NODES
        //    * CIRCULAR LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE STILL NOT DISPLAYED
        //    * SIZES ARE STILL HARDCODED
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var angle,
        //           l = _options.innerCircleCount;

        //       node.label = null;

        //       if (i < l) {
        //         node.target_size = 3;
        //         node.target_color = '#425863'; // TODO: Apply good color
        //         angle = Math.PI * 2 * i / l - Math.PI / 2;
        //         node.target_x = _options.innerRadius * Math.cos(angle);
        //         node.target_y = _options.innerRadius * Math.sin(angle);
        //       } else {
        //         node.target_size = 1;
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //         angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
        //         node.target_x = _options.outerRadius * Math.cos(angle);
        //         node.target_y = _options.outerRadius * Math.sin(angle);
        //       }
        //     });

        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color ='rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: false,
        //     labelThreshold: 8,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        {
          /**
           * EVERY NODES
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["who.int", "plannedparenthood.org", "guttmacher.org", "cdc.gov"]

              node.label = null;
              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_size = node.file_size / _options.ratio;
              if (i < l) {

                if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;
                node.target_color = '#425863'; // TODO: Apply good color
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);

              } else {
                node.target_color = '#AAA'; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * EVERY NODES
           * FILE LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {

              var l = _options.innerCircleCount,
                  labelToShow = ["who.int", "plannedparenthood.org", "guttmacher.org", "cdc.gov"];

              node.label = null;

              if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;


              if (i < l)
                node.target_color = '#425863'; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_size = node.file_size / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: B4
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, 'Tag1', 'B4')

        //       node.label = null;

        //       if (node.attributes["Tag1"] === 'B4'){

        //         node.target_color = goodColors.E; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["Tag1"] === 'B4';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: modularity 130 [130,129,133,128,132,134]
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, "Modularity Class", "130")

        //       node.label = null;

        //       if (node.attributes["Modularity Class"] === '130'){

        //         node.target_color = goodColors.M; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["Modularity Class"] === '130';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: modularity 130 [130,129,133,128,132,134]
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, "Clusters", "A")

        //       node.label = null;

        //       if (node.attributes["Clusters"] === 'A'){

        //         node.target_color = goodColors.M; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["Clusters"] === 'A';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: modularity 130 [130,129,133,128,132,134]
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, "Clusters", "B")

        //       node.label = null;

        //       if (node.attributes["Clusters"] === 'B'){

        //         node.target_color = goodColors.M; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["Clusters"] === 'B';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EGO NETWORK
        //    * FORCE ATLAS 2
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: E
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {

        //       node.label = node.file_label;

        //       if (node.id === '2432b3b6-7f0b-4394-ad72-81e9836630d9')
        //         node.target_color = '#425863'; // TODO: Apply good color
        //       else
        //         node.target_color = '#AAA'; // TODO: Apply good color

        //       node.size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: true,
        //   center: '2432b3b6-7f0b-4394-ad72-81e9836630d9',
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 4,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size'
        //   }
        // },
        {
          /**
           * FREE VIEW
           * FILE LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount;

              node.label = node.file_label;

              node.target_color = colorScale(node.attributes.clusters)

              node.target_x = node.file_x;
              node.target_y = node.file_y;
              node.target_size = node.file_size / _options.ratio;
            });
            _s.bind('clickNode', function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;
                        node.label = node.file_label;
                        node.selected = false;
                        node.target_color = colorScale(node.attributes.clusters)
                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = 'rgba(17, 17, 17, 0.1)'

                   });
                  var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            //_s.settings(newView.settings);
                            _s.refresh();
                    });
                }
                else{
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = '#E93A32'
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = '#425863'
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = '#AAA'
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1){
                            edge.color = 'rgba(17, 17, 17, 0.1)'
                          }
                          else{
                            edge.color = 'rgba(17, 17, 17, 0.0)'
                          }
                      });
                     var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            //_s.settings(newView.settings);
                            _s.refresh();
                    });
                  }
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 12,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ]
  },
  "fp_query_network":{
  "_options": {
"innerCircleCount": 0,
"innerUrlCount": 0,
"innerPageCount": 0,
"innerRadius": 680,
"outerRadius": 550,
"duration": 500,
"action": 0,
"ratio": 3
      },
  "settings": {
"edgeColor": "default",
"defaultEdgeColor": "rgba(17, 17, 17, 0.1)",
"rescaleIgnoreSize": true,
"enableHovering": false,
"mouseEnabled ": false,
"touchEnabled ": false,
"sideMargin": 50,
"clone": false,
"immutable": false,
"minNodeSize": 0,
"maxNodeSize": 0,
"borderColor": "#fff",
"font": "Roboto",
"zoomMax": 1,
"zoomMin": 0.3
        } ,
  "parserURL": "data/cs_query_network/cs_query.json",
  "queryPosScale": d3.scale.ordinal()
        .domain(['Rhythm methods', 'Preventing pregnancy', 'Birth control', 'Planned parenthood', 'Birth control methods', 'Fertility regulation', 'Fertility control', 'Birth spacing', 'Family size', 'Not having babies', 'contraception', 'hormonal cotraceptive', 'pill contraception', 'condoms contraception', 'condoms "family planning"', 'pill+"family planning"', 'IUD "family planning"', 'family planning', 'Pregnancy prevention'])
        .range([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]),
  "parserFnc": function(graph){

        graph.nodes.forEach(function(n) {
          n.file_label = n.label;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = "who";

          delete n.label;

          if (n.attributes["Type"] == "query")
            {_options.innerCircleCount++;
            }
          else if (n.attributes["Type"] == "url")
            {_options.innerUrlCount++;}
          else
            {_options.innerPageCount++;}

        })

        graph.edges.forEach(function(e) {
          delete e.color;
        });

       graph.nodes = graph.nodes.sort(function(a, b) {
            if(a.attributes["Type"] < b.attributes["Type"]) return -1;
            if(a.attributes["Type"] > b.attributes["Type"]) return 1;
            return 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;



          node.size = 0;
          if (node.attributes["Type"] == "query") {
            //angle = Math.PI * 2 * i / l - Math.PI / 2;
            angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
            //node.target_x = node.file_x;
            //node.target_y = node.file_y;
            node.target_x = _options.innerRadius * Math.cos(angle);
            node.target_y = _options.innerRadius * Math.sin(angle);
          } else {
            angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
            node.x = _options.outerRadius * Math.cos(angle);
            node.y = _options.outerRadius * Math.sin(angle);
          }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);

        _s.graph.read(_graph);

        applyView(0);
        
      },
  "_views": [
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount/2,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

                node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = node.file_color; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount/2,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = null;
              node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {

                node.target_size = 2;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color ="rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {

          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount/2,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = null;
              node.labelAdjust = false;
              
              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = +node.attributes["url size"] / 2;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {

        //   init: function() {
        //     _s.unbind("clickNode");
        //     _s.graph.nodes().forEach(function(node, i, a) {

        //       var l = _options.innerCircleCount;
                
        //         node.labelAdjust = false;
        //         node.label = null;


        //       if (node.attributes["Type"] == "query"){
        //         node.target_color = "#425863"; 
        //         node.target_size = _s.graph.degree(node.id, "out") / _options.ratio;
        //         node.label = node.file_label
        //       }
        //       else{
        //         node.target_color = "#AAA"; 
        //       }

        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;

        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = "rgba(17, 17, 17, 0.1)"
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: "target_color",
        //     size: "target_size",
        //     x: "target_x",
        //     y: "target_y",
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        // {
        //   init: function() {
        //     _s.unbind("clickNode");
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount

        //       node.label = null;
        //       node.labelAdjust = false;

        //        if (node.attributes["Type"] == "query"){

        //         node.target_color = "#425863"; 
        //         node.target_size = _s.graph.degree(node.id, "out") / _options.ratio;

        //       }else{

        //         if(_s.graph.degree(node.id, "in") > 1){
        //         node.target_color = goodColors.E;
        //         node.labelAdjust = true;
        //         node.label = node.file_label

        //           }
        //         else{
        //           node.target_color = "#AAA"; 
        //         }
        //       }
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = "rgba(17, 17, 17, 0.1)"
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: "target_color",
        //     size: "target_size",
        //     x: "target_x",
        //     y: "target_y",
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        {
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount/2,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = node.file_label;
              node.labelAdjust = false;


              if (node.attributes["Type"] == "query")  {
                node.target_size = node.target_size = _s.graph.degree(node.id, "out")/ _options.ratio;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                //node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = +node.attributes["url size"] / 2;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.outerRadius * Math.cos(angle);
                //node.target_y = _options.outerRadius * Math.sin(angle);

              }

            });
            _s.bind("clickNode", function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;

                        node.label = node.file_label;
                        node.selected = false;

                         if (node.attributes["Type"] == "query"){
                          node.target_color = "#425863"; 
                        }else{
                          node.target_color = "#AAA";
                        }
                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = "rgba(17, 17, 17, 0.1)"

                   });
                  var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                }
                else{
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = "#E93A32"
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = "#425863"
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#AAA"
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1){
                            edge.color = "rgba(17, 17, 17, 0.1)"
                          }
                          else{
                            edge.color = "rgba(17, 17, 17, 0.0)"
                          }
                      });
                     var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                  }
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 3,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
          }
          ,
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ]
  },
   "fp2_crawl_network":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 1500,
        outerRadius: 2000,
        duration: 500,
        action: 0,
        ratio: 4  
      },
    "settings": {
          edgeColor: 'default',
          defaultEdgeColor: 'rgba(17, 17, 17, 0.1)',
          rescaleIgnoreSize: true,
          enableHovering: false,
          mouseEnabled : false,
          touchEnabled : false,
          sideMargin: 50,
          clone: false,
          immutable: false,
          minNodeSize: 0,
          maxNodeSize: 0,
          borderColor: "#fff",
          font: 'Roboto',
          zoomMax: 1
        },
    "parserURL": null,
    "queryPosScale": null,
    "parserFnc": function(graph) {
        // Save the original data:
        graph.nodes.forEach(function(n) {
          n.file_label = n.label;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          delete n.label;



          if (n.attributes.CRAWLED == "NO")
            _options.innerCircleCount++;
        });

        graph.edges.forEach(function(e) {
          delete e.color;
        });

        var checkTrue = function(d){
          if(d == "NO"){return false}
          else{return true}
        }

        // Sort nodes:
        graph.nodes = graph.nodes.sort(function(a, b) {

          var c = +!!checkTrue(a.attributes.crwl),
              d = +!!checkTrue(b.attributes.crwl);
          // a = a.label.toLowerCase();
          // b = b.label.toLowerCase();
          a = a.file_label.toLowerCase();
          b = b.file_label.toLowerCase();
          return c < d ? -1 : c > d ? 1 : a < b ? -1 : a > b ? 1 : 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;

          node.size = 0;
          if (i < l) {
            angle = Math.PI * 2 * i / l - Math.PI / 2;
            node.x = _options.innerRadius * Math.cos(angle);
            node.y = _options.innerRadius * Math.sin(angle);
          } else {
            angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
            node.x = _options.outerRadius * Math.cos(angle);
            node.y = _options.outerRadius * Math.sin(angle);
          }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);


        // Read graph:
        _s.graph.read(_graph);

        // Apply first action:
        applyView(0);
      },
    "_views":[
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * ALL GREYS
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount;

              if (i < l) {
                node.target_size = 3;
                //node.target_color = node.file_color; // TODO: Apply good color
                node.target_color = '#425863';
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 8,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS C
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph, null, 5, 'ADVOCACY', 'true');

              delete node.label;
              if (i < l) {
                node.target_size = 2;
                if (node.attributes["ADVOCACY"] === 'true'){
                  node.target_color = goodColors.E; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS B2
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph,null, 5, 'CONTRACEPTION', 'true');;

              node.label = null

              if (i < l) {
                node.target_size = 2;
                if (node.attributes["CONTRACEPTION"] === 'true'){
                  node.target_color = goodColors.M; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS A11
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = getMinAttribute(_dbGraph, null, 5, 'POLICY', 'true');

                  node.label = null;

              if (i < l) {
                node.target_size = 2;
                if (node.attributes["POLICY"] === 'true'){
                  node.target_color = goodColors.C; // TODO: Apply good color
                  node.target_size = 4;
                  if(_s.graph.degree(node.id) >= labelToShow ) node.label = node.file_label;
                }
                else {node.target_color = '#ccc'}
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 0;
                node.target_color = node.file_color; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {
        //   /**
        //    * EVERY NODES
        //    * CIRCULAR LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE STILL NOT DISPLAYED
        //    * SIZES ARE STILL HARDCODED
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var angle,
        //           l = _options.innerCircleCount;

        //       node.label = null;

        //       if (i < l) {
        //         node.target_size = 3;
        //         node.target_color = '#425863'; // TODO: Apply good color
        //         angle = Math.PI * 2 * i / l - Math.PI / 2;
        //         node.target_x = _options.innerRadius * Math.cos(angle);
        //         node.target_y = _options.innerRadius * Math.sin(angle);
        //       } else {
        //         node.target_size = 1;
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //         angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
        //         node.target_x = _options.outerRadius * Math.cos(angle);
        //         node.target_y = _options.outerRadius * Math.sin(angle);
        //       }
        //     });

        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color ='rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: false,
        //     labelThreshold: 8,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        {
          /**
           * EVERY NODES
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["who.int", "plannedparenthood.org", "guttmacher.org", "cdc.gov"]

              node.label = null;
              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_size = node.file_size / _options.ratio;
              
              if (i < l) {

                if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;
                node.target_color = '#425863'; // TODO: Apply good color
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);

              } else {
                node.target_color = '#AAA'; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          /**
           * EVERY NODES
           * FILE LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {

              var l = _options.innerCircleCount,
                  labelToShow = ["who.int", "plannedparenthood.org", "guttmacher.org", "cdc.gov"]

              node.label = null;
               if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;

              if (i < l)
                node.target_color = '#425863'; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_size = node.file_size / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: B4
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, 'ECONOMIC', 'true')

        //       node.label = null;

        //       if (node.attributes["ECONOMIC"] === 'true'){

        //         node.target_color = goodColors.E; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["ECONOMIC"] === 'true';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: modularity 130 [130,129,133,128,132,134]
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, "modularity_class", "9")

        //       node.label = null;

        //       if (node.attributes["modularity_class"] === '9'){

        //         node.target_color = goodColors.M; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["modularity_class"] === '9';
        //     }
        //   }
        // },
        // {
        //   /**
        //    * EVERY NODES
        //    * FILE LAYOUT
        //    * CATEGORIES COLORS
        //    * EDGES ARE DISPLAYED
        //    * SIZES ARE INDEGREE
        //    * ZOOM ON ONE CLUSTER: modularity 130 [130,129,133,128,132,134]
        //    */
        //   init: function() {
        //     _s.unbind('clickNode');
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount,
        //         labelToShow = getMinAttribute(_dbGraph, 'in', 3, "clusters", "A")

        //       node.label = null;

        //       if (node.attributes["clusters"] === 'A'){

        //         node.target_color = goodColors.M; 
        //         if(_s.graph.degree(node.id, 'in') >= labelToShow ) node.label = node.file_label;

        //       }else{
        //         node.target_color = '#AAA'; // TODO: Apply good color
        //       }
        //       node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = 'rgba(17, 17, 17, 0.1)'
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: 'target_color',
        //     size: 'target_size',
        //     x: 'target_x',
        //     y: 'target_y',
        //     camera: function(n) {
        //       return n.attributes["clusters"] === 'A';
        //     }
        //   }
        // },
        {
          /**
           * FREE VIEW
           * FILE LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount;

              node.label = node.file_label;

              node.target_color = colorScale(node.attributes.clusters)

              node.target_x = node.file_x;
              node.target_y = node.file_y;
              node.target_size = node.file_size / _options.ratio;
            });
            _s.bind('clickNode', function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;
                        node.label = node.file_label;
                        node.selected = false;

                        node.target_color = colorScale(node.attributes.clusters)

                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = 'rgba(17, 17, 17, 0.1)'

                   });
                  var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            //_s.settings(newView.settings);
                            _s.refresh();
                    });
                }
                else{
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = '#E93A32'
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = '#425863'
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = '#AAA'
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1){
                            edge.color = 'rgba(17, 17, 17, 0.1)'
                          }
                          else{
                            edge.color = 'rgba(17, 17, 17, 0.0)'
                          }
                      });
                     var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            //_s.settings(newView.settings);
                            _s.refresh();
                    });
                  }
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 8,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
          },
          animation: {
            color: 'target_color',
            size: 'target_size',
            x: 'target_x',
            y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ]
  },
  "fp2_query_network":{
  "_options": {
"innerCircleCount": 0,
"innerUrlCount": 0,
"innerPageCount": 0,
"innerRadius": 680,
"outerRadius": 550,
"duration": 500,
"action": 0,
"ratio": 3
      },
  "settings": {
"edgeColor": "default",
"defaultEdgeColor": "rgba(17, 17, 17, 0.1)",
"rescaleIgnoreSize": true,
"enableHovering": false,
"mouseEnabled ": false,
"touchEnabled ": false,
"sideMargin": 50,
"clone": false,
"immutable": false,
"minNodeSize": 0,
"maxNodeSize": 0,
"borderColor": "#fff",
"font": "Roboto",
"zoomMax": 1,
"zoomMin": 0.3
        } ,
  "parserURL": null,
  "queryPosScale": d3.scale.ordinal()
        .domain(['family planning "population control"','family planning "environmental development"', 'family planning "economic development"','family planning "sustainable development"','family planning "social development"','family planning "population growth"'])
        .range([0,1,2,3,4,5]),
  "parserFnc": function(graph){

        graph.nodes.forEach(function(n) {
          n.file_label = n.label;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = "who";

          delete n.label;

          if (n.attributes["Type"] == "query")
            {_options.innerCircleCount++;}
          else if (n.attributes["Type"] == "url")
            {_options.innerUrlCount++;}
          else
            {_options.innerPageCount++;}

        });

        graph.edges.forEach(function(e) {
          delete e.color;
        });

       graph.nodes = graph.nodes.sort(function(a, b) {
            if(a.attributes["Type"] < b.attributes["Type"]) return -1;
            if(a.attributes["Type"] > b.attributes["Type"]) return 1;
            return 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;



          node.size = 0;
          if (node.attributes["Type"] == "query") {
            //angle = Math.PI * 2 * i / l - Math.PI / 2;
            angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
            //node.target_x = node.file_x;
            //node.target_y = node.file_y;
            node.target_x = _options.innerRadius * Math.cos(angle);
            node.target_y = _options.innerRadius * Math.sin(angle);
          } else {
            angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
            node.x = _options.outerRadius * Math.cos(angle);
            node.y = _options.outerRadius * Math.sin(angle);
          }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);

        _s.graph.read(_graph);

        applyView(0);
        
      },
  "_views": [
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

                node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {

                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = node.file_color; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = null;
              node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {

                node.target_size = 2;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color ="rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {

          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = null;
              node.labelAdjust = false;
              
              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                //  node.target_x = node.file_x;
                // node.target_y = node.file_y;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 3;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        // {

        //   init: function() {
        //     _s.unbind("clickNode");
        //     _s.graph.nodes().forEach(function(node, i, a) {

        //       var l = _options.innerCircleCount;
                
        //         node.labelAdjust = false;
        //         node.label = null;


        //       if (node.attributes["Type"] == "query"){
        //         node.target_color = "#425863"; 
        //         node.target_size = _s.graph.degree(node.id, "out") / _options.ratio;
        //         node.label = node.file_label
        //       }
        //       else{
        //         node.target_color = "#AAA"; 
        //       }

        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;

        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = "rgba(17, 17, 17, 0.1)"
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: "target_color",
        //     size: "target_size",
        //     x: "target_x",
        //     y: "target_y",
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        // {
        //   init: function() {
        //     _s.unbind("clickNode");
        //     _s.graph.nodes().forEach(function(node, i, a) {
        //       var l = _options.innerCircleCount

        //       node.label = null;
        //       node.labelAdjust = false;

        //        if (node.attributes["Type"] == "query"){

        //         node.target_color = "#425863"; 
        //         node.target_size = _s.graph.degree(node.id, "out") / _options.ratio;

        //       }else{

        //         if(_s.graph.degree(node.id, "in") > 1){
        //         node.target_color = goodColors.E;
        //         node.labelAdjust = true;
        //         node.label = node.file_label

        //           }
        //         else{
        //           node.target_color = "#AAA"; 
        //         }
        //       }
        //       node.target_x = node.file_x;
        //       node.target_y = node.file_y;
        //     });
        //     _s.graph.edges().forEach(function(edge, i, a) {
        //       edge.color = "rgba(17, 17, 17, 0.1)"
        //     });
        //   },
        //   forceAtlas2: false,
        //   center: null,
        //   filter: null,
        //   settings: {
        //     drawEdges: true,
        //     labelThreshold: 1,
        //     enableCamera: false,
        //     mouseEnabled : false,
        //     touchEnabled : false
        //   },
        //   animation: {
        //     color: "target_color",
        //     size: "target_size",
        //     x: "target_x",
        //     y: "target_y",
        //     camera: {
        //       x: 0,
        //       y: 0,
        //       ratio: 1,
        //       angle: 0
        //     }
        //   }
        // },
        {
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = node.file_label;
              node.labelAdjust = false;


              if (node.attributes["Type"] == "query")  {
                node.target_size = node.target_size = _s.graph.degree(node.id, "out")/ _options.ratio;
                node.target_color = "#425863"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                //node.label = node.file_label
              } else if(node.attributes["Type"] == "page") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 3;
                node.target_color = "#AAA"; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.outerRadius * Math.cos(angle);
                //node.target_y = _options.outerRadius * Math.sin(angle);

              }

            });
            _s.bind("clickNode", function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;

                        node.label = node.file_label;
                        node.selected = false;

                         if (node.attributes["Type"] == "query"){
                          node.target_color = "#425863"; 
                        }else{
                          node.target_color = "#AAA";
                        }
                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = "rgba(17, 17, 17, 0.1)"

                   });
                  var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                }
                else{
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = "#E93A32"
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = "#425863"
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#AAA"
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1){
                            edge.color = "rgba(17, 17, 17, 0.1)"
                          }
                          else{
                            edge.color = "rgba(17, 17, 17, 0.0)"
                          }
                      });
                     var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                  }
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 5,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
          }
          ,
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ]
  },
   "fp_wiki_network_fp":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 1500,
        outerRadius: 2000,
        duration: 500,
        action: 0,
        ratio: 4  
      },
    "settings": {
          edgeColor: 'default',
          defaultEdgeColor: 'rgba(17, 17, 17, 0.1)',
          rescaleIgnoreSize: true,
          enableHovering: false,
          mouseEnabled : false,
          touchEnabled : false,
          sideMargin: 50,
          clone: false,
          immutable: false,
          minNodeSize: 0,
          maxNodeSize: 0,
          borderColor: "#fff",
          font: 'Roboto',
          zoomMax: 1
        },
    "parserURL": null,
    "queryPosScale": null,
    "parserFnc": function(graph) {

        var sizeAttributes = [],
            editorsAttributes = [];
        // Save the original data:
        graph.nodes.forEach(function(n) {
          n.file_label = n.id;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          n.size = 3;

          sizeAttributes.push(+n.attributes["Size"])
          editorsAttributes.push(+n.attributes["editors"])
          delete n.label;

        });


        sizeAttributes.sort()
        editorsAttributes.sort()
        var sizeScale = d3.scale.linear().domain(d3.extent(sizeAttributes)).range([5,100])
        var editorsScale = d3.scale.linear().domain(d3.extent(editorsAttributes)).range([5,100])

        graph.nodes.forEach(function(n) {
          n.attributes["Size"] = sizeScale(+n.attributes["Size"])
          n.attributes["editors"] = editorsScale(+n.attributes["editors"])
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);


        // Read graph:
        _s.graph.read(_graph);

        // Apply first action:
        applyView(0);
      },
  "_views": [
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {


                node.labelAdjust = false;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = node.file_color;
                node.target_size = 3;
                if(_s.graph.degree(node.id, "out") > 3){
                    node.label = node.id
                  }
                else{
                  delete node.label
                }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

              if (node.attributes["political_cluster"] == "true") {
                node.target_color = goodColors.E;
                node.label = node.id
              } else {
                node.target_color = "#AAA"; 
                delete node.label
              }

                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_size = 3;

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: function(n) {
              return n.attributes["political_cluster"] === 'true';
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

              if (node.attributes["ethical_cluster"] == "true") {
                node.target_color = goodColors.E;
                node.label = node.id
              } else {
                node.target_color = "#AAA"; 
                delete node.label
              }

                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_size = 3;

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: function(n) {
              return n.attributes["ethical_cluster"] === 'true';
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

              if (node.attributes["technical_cluster"] == "true") {
                node.target_color = goodColors.E;
                node.label = node.id
              } else {
                node.target_color = "#AAA"; 
                delete node.label
              }

                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_size = 3;

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: function(n) {
              return n.attributes["technical_cluster"] === 'true';
            }
          }
        },
        {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

                node.labelAdjust = false;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = node.file_color;
                node.target_size = node.attributes["Size"] /_options.ratio;
                
                if(_s.graph.degree(node.id, "out") > 3){
                    node.label = node.id
                  }
                else{
                  delete node.label
                }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
       {
          init: function() {
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

                node.labelAdjust = false;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = node.file_color;
                node.target_size = node.attributes["editors"] /_options.ratio;
                
                if(_s.graph.degree(node.id, "out") > 3){
                    node.label = node.id
                  }
                else{
                  delete node.label
                }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
       {
          init: function() {
            var colorScale = d3.scale.linear().domain([0,100]).range(["#f1eef6", "#045a8d"])
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

                node.labelAdjust = false;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = colorScale(+node.attributes["Similarity_FP_classes"]);
                node.target_size = 5;
                
                if(_s.graph.degree(node.id, "out") > 3){
                    node.label = node.id
                  }
                else{
                  delete node.label
                }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
       {
          init: function() {
            var colorScale = d3.scale.linear().domain([0,100]).range(["#f1eef6", "#045a8d"])
            _s.unbind("clickNode");
            _s.graph.nodes().forEach(function(node, i, a) {

                node.labelAdjust = false;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = colorScale(+node.attributes["Similarity_BC_classes"]);
                node.target_size = 5;
                
                if(_s.graph.degree(node.id, "out") > 3){
                    node.label = node.id
                  }
                else{
                  delete node.label
                }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : false,
            touchEnabled : false
          },
          animation: {
            color: "target_color",
            size: "target_size",
            x: "target_x",
            y: "target_y",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        },
        {
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {

                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.target_color = node.file_color;
                node.target_size = node.file_size /_options.ratio;
                
                // if(_s.graph.degree(node.id, "out") > 3){
                //     node.label = node.id
                //   }
                // else{
                //   delete node.label
                // }

                node.label = node.id

            });
            _s.bind("clickNode", function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {

                        node.label = node.id;
                        node.selected = false;
                        node.target_color = node.file_color;

                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = "rgba(17, 17, 17, 0.1)"

                   });
                  var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                }
                else{
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = "#E93A32"
                            node.label = node.id;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = "#425863"
                            node.selected = false
                            node.label = node.id;
                          }
                          else{
                            node.target_color = "#AAA"
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1){
                            edge.color = "rgba(17, 17, 17, 0.1)"
                          }
                          else{
                            edge.color = "rgba(17, 17, 17, 0.0)"
                          }
                      });
                     var animation = {
                      color : "target_color",
                      camera: {
                            x: cam.x,
                            y: cam.y,
                            ratio: cam.ratio,
                            angle: cam.angle
                      }
                     }
                    animate(animation, function() {
                            _s.refresh();
                    });
                  }
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 20,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
          }
          ,
          animation: {
            color: "target_color",
            size: "target_size",
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ]
    }
}//end networkconfig

    d3.rebind(vis, dispatch, 'on');

    return vis;
  }
  
})();