(function() {
  'use strict';


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
    } else
      cam.x = 0;
      cam.y = 0;
      cam.angle = 0;
      cam.ratio = 1;

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

  var scale = 22,
    GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  function place(n) {
  var r = Math.sqrt(n),
      a = n * GOLDEN_ANGLE;
    return [scale * r * Math.cos(a), scale * r * Math.sin(a)];
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

  var bis1 = {nodes : [], edges: []},
      bis2 = {nodes : [], edges: []};

  var goodColors = {
    "M" : "#84A594",
    "C" : "#D6C33B",
    "E" : "#E93A32",
    "V" : "#425863"
  }
  var _options = {
        innerCircleCount: 0,
        innerRadius: 500,
        outerRadius: 1000,
        duration: 500,
        action: 0,
        ratio: 50
      },
      _s = new sigma({
        renderer: {
          container: document.getElementById('graph'),
          type: 'canvas'
        },
        settings: {
          edgeColor: 'default',
          defaultEdgeColor: 'rgba(17, 17, 17, 0.1)',
          rescaleIgnoreSize: true,
          enableHovering: false,
          sideMargin: 50,
          clone: false,
          immutable: false,
          minNodeSize: 0,
          maxNodeSize: 0,
          borderColor: "#fff",
          font: 'Montserrat',
          zoomMax: 1
        }
      }),
      _graph,
      _dbGraph;

    sigma.parsers.json(
      'data/cs_af_it.json',
      function(graph) {
        // Save the original data:
        graph.nodes.forEach(function(n) {
          
          if(n.attributes["role"] != 'forum'){
            n.file_label = n.label;
          }else{
            var l = n.label.split('_')

            n.label = l.slice(1,-2).join(" ")
            n.file_label = n.label
          }
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          delete n.label;


          if (n.attributes["role"] == 'forum')
            _options.innerCircleCount++;
        });

        graph.edges.forEach(function(e) {
          delete e.color;
        });

        // Sort nodes:
        graph.nodes = graph.nodes.sort(function(a, b) {

            var c = a.attributes.role == 'forum' ? 0 : 1,
                d = b.attributes.role == 'forum' ? 0 : 1,
                a = a.attributes['In-Degree'] > 1 && a.attributes['In-Degree'] < 3 ? 1 : 0,
                b = b.attributes['In-Degree'] > 1 && b.attributes['In-Degree'] < 3 ? 1 : 0;

           return c < d ? -1 : c > d ? 1 : a < b ? -1 : a > b ? 1 : 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;



          node.size = 0;
          if (node.attributes["role"] == 'forum') {
            angle = Math.PI * 2 * i / l - Math.PI / 2;
            node.x = node.file_x;
            node.y = node.file_y;
          } else {
            angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
            node.x = _options.outerRadius * Math.cos(angle);
            node.y = _options.outerRadius * Math.sin(angle);
          }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);

        var bis1Id =["it_aspettare_un_figlio_reduced_authors", "it_desiderio_de_maternita_reduced_authors"]
        var bis2Id =["it_aspettare_un_figlio_reduced_authors", "it_parto_reduced_authors"]
        bis1.nodes = bis1.nodes.concat(bis1Id)
        bis2.nodes = bis2.nodes.concat(bis2Id)

        console.log(bis1,bis2)

        _dbGraph.nodes().forEach(function(d){

          if(_dbGraph.degree(d.id, 'in') == 2){
                 var g = _dbGraph.neighborhood(d.id);
                 var n = g.nodes.map(function(e){return e.id})


                 if (n.indexOf(bis1Id[0]) > -1 && n.indexOf(bis1Id[1]) > -1 ){
                  
                  if (bis1.nodes.indexOf(n[0]) == -1){
                    bis1.nodes.push(n[0])
                  }

                  g.edges.forEach(function(f){
                    bis1.edges.push(f.id)
                  })
                 }

                 if (n.indexOf(bis2Id[0]) > -1 && n.indexOf(bis2Id[1]) > -1 ){

                  if (bis2.nodes.indexOf(n[0]) == -1){
                      bis2.nodes.push(n[0])
                    }

                  g.edges.forEach(function(f){
                    bis2.edges.push(f.id)
                  })
                 }
              }

        })

        // Bind buttons:
        document.getElementById('previous-step').addEventListener('click', function() {
          if (_currentView > 0)
            applyView(_currentView - 1);
        });
        document.getElementById('next-step').addEventListener('click', function() {
          if (_currentView < _views.length - 1)
            applyView(_currentView + 1);
        });

        // Read graph:
        _s.graph.read(_graph);

        // Apply first action:
        applyView(0);
      }
    );




  /**
   * APPLICATION STATE:
   * ******************
   */
  var _state = {},
      _currentView,
      _views = [
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

                node.labelAdjust = false;

              if (node.attributes["role"] == 'forum') {
                node.target_size = 3;
                node.target_color = '#425863';
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
              } else {
                node.target_size = 0;
                node.target_color = "AAA"; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                //node.target_x = _options.outerRadius * Math.cos(angle);
                //node.target_y = _options.outerRadius * Math.sin(angle);
                node.target_x = place(i - l)[0]
                node.target_y = place(i - l)[1]
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
            enableCamera: false
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
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE STILL NOT DISPLAYED
           * SIZES ARE STILL HARDCODED
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount;

              node.label = null;
              node.labelAdjust = false;

              if (node.attributes["role"] == 'forum')  {
                node.target_size = 3;
                node.target_color = '#425863'; // TODO: Apply good color
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label
              } else {
                node.target_size = 2;
                node.target_color = '#AAA'; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                //node.target_x = _options.outerRadius * Math.cos(angle);
                //node.target_y = _options.outerRadius * Math.sin(angle);
                node.target_x = place(i - l)[0]
                node.target_y = place(i - l)[1]

              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color ='rgba(17, 17, 17, 0.1)'
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false
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
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount
              node.label = null;
              node.labelAdjust = false;
              
              if (node.attributes["role"] == 'forum') {
                node.target_size = _s.graph.degree(node.id, 'out')/ _options.ratio;
                node.target_color = '#425863'; // TODO: Apply good color
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label

              } else {
                if(_s.graph.degree(node.id, 'in') > 1 && _s.graph.degree(node.id, 'in') < 3){
                node.target_color = goodColors.E;
                  }
                else{
                  node.target_color = goodColors.M; 
                }
                node.target_x = place(i - l)[0]
                node.target_y = place(i - l)[1]
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
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false
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

              var l = _options.innerCircleCount;
                
                node.labelAdjust = false;
                node.label = null;


              if (node.attributes["role"] == 'forum'){
                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }
              else{
                if(_s.graph.degree(node.id, 'in') > 1 && _s.graph.degree(node.id, 'in') < 3){
                node.target_color = goodColors.E;
                  }
                else{
                  node.target_color = goodColors.M; 
                }
              }

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
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false
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
           * ZOOM ON ONE CLUSTER: E
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount

              node.label = null;
              node.labelAdjust = false;

               if (node.attributes["role"] == 'forum'){

                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis1.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#AAA"; 
                }
              }
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              
              if(bis1.edges.indexOf(edge.id) > -1 ) {
                edge.color = 'rgba(17, 17, 17, 0.1)'
              }else{
                edge.color = 'rgba(17, 17, 17, 0)'
              }
              // "it_aspettare_un_figlio_reduced_authors"
              // "it_parto_reduced_authors"
              // "it_desiderio_de_maternita_reduced_authors"
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false
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
           * ZOOM ON ONE CLUSTER: E
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount

              node.label = null;
              node.labelAdjust = false;

               if (node.attributes["role"] == 'forum'){

                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis2.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#AAA"; 
                }
              }
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              
              if(bis2.edges.indexOf(edge.id) > -1 ) {
                edge.color = 'rgba(17, 17, 17, 0.1)'
              }else{
                edge.color = 'rgba(17, 17, 17, 0)'
              }
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false
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
              node.labelAdjust = false;


              if (node.attributes["role"] == 'forum'){
                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
              }
              else{
                if(_s.graph.degree(node.id, 'in') > 1 && _s.graph.degree(node.id, 'in') < 3){
                node.target_color = goodColors.E;
                  }
                else{
                  node.target_color = goodColors.M; 
                }
              }

              node.target_x = node.file_x;
              node.target_y = node.file_y;

            });

            _s.graph.edges().forEach(function(edge, i, a) {
               edge.color = 'rgba(17, 17, 17, 0.1)'

             });

            _s.bind('clickNode', function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;

                        node.label = node.file_label;
                        node.selected = false;

                         if (node.attributes["role"] == 'forum'){
                          node.target_color = '#425863'; // TODO: Apply good color
                        }else{
                          if(_s.graph.degree(node.id, 'in') > 1 && _s.graph.degree(node.id, 'in') < 3){
                            node.target_color = goodColors.E;
                              }
                            else{
                              node.target_color = goodColors.M; 
                            }
                        }
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
            enableCamera: true
          }
          ,
          animation: {
            color: 'target_color',
            size: 'target_size',
            //x: 'target_x',
            //y: 'target_y',
            camera: {
              x: 0,
              y: 0,
              ratio: 1,
              angle: 0
            }
          }
        }
      ];

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
})();
