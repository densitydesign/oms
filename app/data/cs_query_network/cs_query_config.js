{
  '_options': {
        innerCircleCount: 0,
        innerRadius: 500,
        outerRadius: 674,
        duration: 500,
        action: 0,
        ratio: 3
      },
  'settings': {
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
        font: 'Montserrat',
        zoomMax: 1,
        zoomMin: 0.3
        } ,
  'parserURL': '../../data/cs_query_network/cs_query.json',
  'queryPosScale': d3.scale.ordinal()
        .domain(["Cs delivery", "Cesarean delivery", "Cesarean", "C-Section", "Operative delivery", "Abdominal delivery", "Surgical delivery", "Caesarean delivery", "Caesarean"])
        .range([0,1,2,3,4,5,6,7,8]),
  'parserFnc':  function(graph) {
        // Save the original data:
        graph.nodes.forEach(function(n) {
          n.file_label = n.label;
          n.file_color = n.color;
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          delete n.label;



          if (n.attributes["Type"] == 'query')
            _options.innerCircleCount++;
        });

        graph.edges.forEach(function(e) {
          delete e.color;
        });

        // Sort nodes:
        graph.nodes = graph.nodes.sort(function(a, b) {
          // var c = +!!a.attributes.crwl,
          //     d = +!!b.attributes.crwl;
          // // a = a.label.toLowerCase();
          // // b = b.label.toLowerCase();
          // a = a.file_label.toLowerCase();
          // b = b.file_label.toLowerCase();
          // return c < d ? -1 : c > d ? 1 : a < b ? -1 : a > b ? 1 : 0;
        });

        graph.nodes.forEach(function(node, i, a) {
          var angle,
              l = _options.innerCircleCount;



          node.size = 0;
          if (node.attributes["Type"] == 'query') {
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



        // Bind buttons:
        // document.getElementById('previous-step').addEventListener('click', function() {
        //   if (_currentView > 0)
        //     applyView(_currentView - 1);
        // });
        // document.getElementById('next-step').addEventListener('click', function() {
        //   if (_currentView < _views.length - 1)
        //     applyView(_currentView + 1);
        // });

        // Read graph:
        _s.graph.read(_graph);

        // Apply first action:
        applyView(0);
        
      },
  '_views': [
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

              if (node.attributes["Type"] == 'query') {
                node.target_size = 3;
                node.target_color = '#425863';
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
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

              if (node.attributes["Type"] == 'query')  {
                node.target_size = 3;
                node.target_color = '#425863'; // TODO: Apply good color
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label
              } else {
                node.target_size = 2;
                node.target_color = '#AAA'; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

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
              
              if (node.attributes["Type"] == 'query') {
                node.target_size = _s.graph.degree(node.id, 'out')/ _options.ratio;
                node.target_color = '#425863'; // TODO: Apply good color
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label

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

              var l = _options.innerCircleCount;
                
                node.labelAdjust = false;
                node.label = null;


              if (node.attributes["Type"] == 'query'){
                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }
              else{
                node.target_color = '#AAA'; // TODO: Apply good color
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
           * ZOOM ON ONE CLUSTER: E
           */
          init: function() {
            _s.unbind('clickNode');
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount

              node.label = null;
              node.labelAdjust = false;

               if (node.attributes["Type"] == 'query'){

                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;

              }else{

                if(_s.graph.degree(node.id, 'in') > 1){
                node.target_color = goodColors.E; // TODO: Apply good color
                node.labelAdjust = true;
                node.label = node.file_label

                  }
                else{
                  node.target_color = '#AAA'; 
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


              if (node.attributes["Type"] == 'query'){
                node.target_color = '#425863'; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
              }
              else{
                node.target_color = '#AAA'; // TODO: Apply good color
              }

              node.target_x = node.file_x;
              node.target_y = node.file_y;

            });
            _s.bind('clickNode', function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;

                        node.label = node.file_label;
                        node.selected = false;

                         if (node.attributes["Type"] == 'query'){
                          node.target_color = '#425863'; // TODO: Apply good color
                        }else{
                          node.target_color = '#AAA'; // TODO: Apply good color
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
            labelThreshold: 3,
            enableCamera: true,
            mouseEnabled : true,
            touchEnabled : true
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
      ]
}