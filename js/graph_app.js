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



  /**
   * GLOBAL APP VARS:
   * ****************
   */

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
  var _options = {
        innerCircleCount: 0,
        innerRadius: 1000,
        outerRadius: 2000,
        duration: 500,
        action: 0,
        ratio: 3
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
          font: 'Montserrat'
        }
      }),
      _graph,
      _dbGraph;


    sigma.parsers.json(
      'data/cs_crawl_2.json',
      function(graph) {
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
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 8,
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
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS E
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["nytimes.com", "celebritybabies.people.com"];

              delete node.label;
              if (i < l) {
                node.target_size = 2;
                if (node.attributes.E == 'true'){ 
                  node.target_color = goodColors.E; // TODO: Apply good color
                  node.target_size = 4;
                  if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;
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
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS M
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["nytimes.com"];

              node.label = null

              if (i < l) {
                node.target_size = 2;
                if (node.attributes.M == 'true'){ 
                  node.target_color = goodColors.M; // TODO: Apply good color
                  node.target_size = 4;
                  if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;                    
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
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * CATEGORIES COLORS C
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["nytimes.com"];

                  node.label = null;

              if (i < l) {
                node.target_size = 2;
                if (node.attributes.C == 'true'){ 
                  node.target_color = goodColors.C; // TODO: Apply good color
                  node.target_size = 4;
                  if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;
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
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount;

              node.label = null;

              if (i < l) {
                node.target_size = 3;
                node.target_color = '#425863'; // TODO: Apply good color
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);
              } else {
                node.target_size = 1;
                node.target_color = '#AAA'; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: false,
            labelThreshold: 8,
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
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["who.int"]

              node.label = null;
              node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
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
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {

              var l = _options.innerCircleCount;

              

              if (i < l)
                node.target_color = '#425863'; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
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
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount,
                labelToShow = ["who.int"]; //TODO: Put real labels

              node.label = null;
              if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;

              if (node.attributes.E !== 'false')
                node.target_color = goodColors.E; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
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
            camera: function(n) {
              return n.attributes.E !== 'false';
            }
          }
        },
        {
          /**
           * EGO NETWORK
           * FORCE ATLAS 2
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           * ZOOM ON ONE CLUSTER: E
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              
              node.label = node.file_label;
              
              if (node.id === '825512d2-ebdf-480e-8ae7-bdad81f491b4')
                node.target_color = '#425863'; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              node.size = _s.graph.degree(node.id, 'in') / _options.ratio;
              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
            });
          },
          forceAtlas2: true,
          center: '825512d2-ebdf-480e-8ae7-bdad81f491b4',
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 4,
            enableCamera: false
          },
                    animation: {
            color: 'target_color',
            size: 'target_size'
          }
        },
        {
          /**
           * EGO NETWORK
           * FORCE ATLAS 2
           * CATEGORIES COLORS
           * EDGES ARE DISPLAYED
           * SIZES ARE INDEGREE
           * ZOOM ON ONE CLUSTER: E
           */
          init: function() {
            _s.graph.nodes().forEach(function(node, i, a) {
              
              node.label = node.file_label;
              
              if (node.id === '25a25d96-fadc-45ed-b6a6-777c12551fa0')
                node.target_color = '#425863'; // TODO: Apply good color
              else
                node.target_color = '#AAA'; // TODO: Apply good color

              node.size = _s.graph.degree(node.id, 'in') / _options.ratio;
              //node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
            });
          },
          forceAtlas2: true,
          center: '25a25d96-fadc-45ed-b6a6-777c12551fa0',
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 4,
            enableCamera: false
          },
          animation: {
            color: 'target_color',
            size: 'target_size'
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
              // if (i < l)
              //   node.target_color = '#425863'; // TODO: Apply good color
              // else
              //   node.target_color = '#AAA'; // TODO: Apply good color

              // node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              // node.target_x = node.file_x;
              // node.target_y = node.file_y;

              if (i < l)
                node.color = '#425863'; // TODO: Apply good color
              else
                node.color = '#AAA'; // TODO: Apply good color

              node.x = node.file_x;
              node.y = node.file_y;
              node.size = _s.graph.degree(node.id, 'in') / _options.ratio;
            });
            _s.bind('clickNode', function(e) {
                    console.log(e.data.node.label);
              });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 6,
            enableCamera: true
          }
          // ,
          // animation: {
          //   color: 'target_color',
          //   size: 'target_size',
          //   x: 'target_x',
          //   y: 'target_y',
          //   camera: {
          //     x: 0,
          //     y: 0,
          //     ratio: 1,
          //     angle: 0
          //   }
          // }
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
      setTimeout(secondPart, 100);
    } else
      secondPart();

    function secondPart() {
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
  }
})();