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
        "V" : "#273B4F"
      },
      colorScale = d3.scale.ordinal().domain(["1","4","13","9","14","0","8","12","5","3","15","11","7"]).range(["#CA587B","#75D252","#7873CB","#46595E","#85D2AD","#C7A378","#CD5633","#CDBF45","#A7AFC9","#547135","#CB54C6","#623726","#5D3663"]),
      _state = {},
      _currentView,
      _s,
      _graph,
      _dbGraph,
      _options,
      _views,
      views,
      queryPosition,
      bis1 = {nodes : [], edges: []},
      bis2 = {nodes : [], edges: []},
      scale,
      dragged = false,
      dispatch = d3.dispatch("resetfilter", "clicked");


    function vis(selection){
    	selection.each(function(data){




  /**
   * GLOBAL APP VARS:
   * ****************
   */

  //drag and drop event listener
  sigma.utils.pkg('sigma.events');

  /**
   * Dispatch 'drag' and 'drop' events by dealing with mouse events.
   *
   * @param {object} renderer The renderer to listen.
   */
  sigma.events.drag = function(renderer) {
    sigma.classes.dispatcher.extend(this);

    var _self = this,
        _drag = false,
        _x = 0,
        _y = 0;

      renderer.container.addEventListener('mousedown', function(e) {
          _x = e.clientX;
          _y = e.clientY;
      })

      renderer.container.addEventListener('mouseup', function(e) {

        if(Math.abs(e.clientX - _x) || Math.abs(e.clientY - _y) > 1) {
          _self.dispatchEvent('drag');
        }else{
          _self.dispatchEvent('drop');
        }

      })
  };
  // end drag and drop

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
        Math.round(node[prefix + 'x'] - (((node.label ? node.label.length : node.file_label.length )* fontSize)/4) ),
        Math.round(node[prefix + 'y'] + fontSize + node.size)
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
    }
    else if(node.labelCenter){
            context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] - ((node.label.length * fontSize)/4) ),
        Math.round(node[prefix + 'y'] + fontSize/3 )
      );
    }
    else{
      context.fillText(
        node.label,
        Math.round(node[prefix + 'x'] - ((node.label.length * fontSize)/4) ),
        Math.round(node[prefix + 'y'] + fontSize + node.size )
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
      //dispatch.steplimit()
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

    vis.zoomNodes = function(x, x1){
      if(!x1){applyView(_views.length-1)}
      else{zoomNodes(x, x1)}
    }

    vis.toggleSize = function(x){
      if (!arguments.length) return;
      toggleSize(x)

    }

    vis.toggleProperty = function(x){
      if (!arguments.length) return;
      toggleProperty(x)

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
              //node.target_size = _s.graph.degree(node.id) / _options.ratio;
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

    function toggleProperty(property) {
          var cam = _s.cameras[0];
            var zoomView = {

              init: function() {
                _s.graph.nodes().forEach(function(node, i, a) {
               
                   var propertyDict = {
                    "medical" : "M",
                    "experiences" : "E",
                    "controversies" :"C"
                   }
                   if(!property.length){
                    node.label = node.file_label
                     if (node.attributes["Type"] == "query"){
                            node.target_color = "#273B4F";
 
                          }else{
                            
                            //node.target_color = "#C6C6C6"; 
                            node.target_color = "#42A8A8";

                             
                      }
                    }else{

                      var cose = d3.entries(node.attributes).filter(function(d){return d.value =="true" }).map(function(d){return d.key})
                      var check = property.some(function(e,index,array){
                          if (cose.indexOf(propertyDict[e]) > -1)
                            return 1
                          else
                            return 0
                      })

                      //chenk none

                      if(property.indexOf("none") > -1){
                        if( d3.entries(node.attributes).filter(function(d){return d.value =="false" }).length == 3 && node.attributes["Type"] != "query"){
                          check = true;
                        }
                      }

                      if (!check){
                          node.target_color = '#F1F1F1'
                          node.label = null
                        }
                        else{
                          node.label = node.file_label
                            if(node.attributes["Type"] == "query"){
                              node.target_color = "#273B4F";   
                            }else{
                              //node.target_color = "#C6C6C6"; 
                              node.target_color = "#42A8A8";
                            }
                        }

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
            color: 'target_color',
            //size: 'target_size',
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
        
      function zoomNodes(attribute, value) {
            var zoomView = {

              init: function() {
                //_s.unbind("clickNode");
                 _s.graph.nodes().forEach(function(node, i, a) {
 

               if (node.attributes[attribute] === value){

                  node.label = node.file_label;
                 node.target_color = "#C6C6C6"; 

               }else{
                  node.label = null;
                 node.target_color = '#F1F1F1'; // TODO: Apply good color
               }
            //   node.target_size = node.file_size / _options.ratio;
            //   node.target_x = node.file_x;
            //   node.target_y = node.file_y;
             });
            // _s.graph.edges().forEach(function(edge, i, a) {
            //   edge.color = 'rgba(17, 17, 17, 0.1)'
            // });
          },
          forceAtlas2: false,
          center: null,
          filter: null,
           settings: {
             drawEdges: true,
             labelThreshold: 1,
             enableCamera: true,
             mouseEnabled : true,
             touchEnabled : true
          },
          animation: {
            color: 'target_color',
            //size: 'target_size',
            //x: 'target_x',
            //y: 'target_y',
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
                _s.settings(zoomView.settings);
                _s.settings('drawEdges', true);
                _s.refresh();
              });
            } else
              _s.refresh();
        }

      function zoomCluster(attribute, value) {

            var zoomView = {

              init: function() {
                _s.unbind("clickNode");
                _s.graph.nodes().forEach(function(node, i, a) {

                var labelToShow = getMinAttribute(_dbGraph, 'in', 3, attribute, value)
 
              if (node.attributes[attribute] === value){
                 //node.label = node.file_label;
                 if(_s.graph.degree(node.id, 'in') >= labelToShow )
                  node.label = node.file_label
                else
                  node.label = null;

                node.target_color = colorScale(value); 

              }else{
                 node.label = null;
                node.target_color = "#C6C6C6"; // TODO: Apply good color
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
             labelThreshold: 1,
             enableCamera: true,
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
                _s.settings(zoomView.settings);
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
  "cs_query_network":{
  "_options": {
"innerCircleCount": 0,
"innerUrlCount": 0,
"innerPageCount": 0,
"innerRadius": 500,
"middleRadius": 700,
"outerRadius": 800,
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
"defaultLabelColor": "#222222",
"font": "Roboto",
"zoomMax": 1,
"zoomMin": 0.1
        } ,
  "parserURL": "data/cs_query_network/cs_query.json",
  "queryPosScale": d3.scale.ordinal()
        .domain(["Cs delivery", "Cesarean delivery", "Cesarean", "C-Section", "Operative delivery", "Abdominal delivery", "Surgical delivery", "Caesarean delivery", "Caesarean"])
        .range([0,1,2,3,4,5,6,7,8]),
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
            {
              _options.innerCircleCount++;
              n.file_label = n.file_label.toUpperCase()
            }
          else if (n.attributes["Type"] == "host")
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
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

                node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {
                node.size = 3;
                node.color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.x = node.file_x;
                node.y = node.file_y;
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {
                //console.log(i, a.length, l, l2)
                node.labelCenter=true
                node.size = 0;
                node.color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.x = _options.outerRadius * Math.cos(angle);
                node.y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.labelCenter=true
                node.size = 0;
                //node.color = "#C6C6C6"; 
                node.color = "#42A8A8";
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.x = _options.middleRadius * Math.cos(angle);
                node.y = _options.middleRadius * Math.sin(angle);

              }
        });

        _graph = graph;
        _dbGraph = (new sigma.classes.graph(_s.settings)).read(_graph);

        _s.graph.read(_graph);


        applyView(0);


        var _dragListener = new sigma.events.drag(_s.renderers[0]);
        _dragListener.bind('drag', function(e) {
            dragged = true;
        });

        _dragListener.bind('drop', function(e) {
            dragged = false;
        });

      },
  "_views": [
        {
          init: function() {
            _s.unbind("clickNode");
            _s.unbind("clickStage");
            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

                node.labelAdjust = false;
                node.selected = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = node.file_color; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.middleRadius * Math.cos(angle);
                node.target_y = _options.middleRadius * Math.sin(angle);

              }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });

            _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                        }
              });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                //console.log(selected)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : true,
            touchEnabled : true
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
            _s.unbind("clickStage");

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

                node.selected = false;
                node.labelAdjust = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {
                //console.log(i, a.length, l, l2)
                node.target_size = 2;
                node.target_color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 0;
                node.target_color = node.file_color; 
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.middleRadius * Math.cos(angle);
                node.target_y = _options.middleRadius * Math.sin(angle);

              }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = "rgba(17, 17, 17, 0.1)"
            });

            _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                          //applyView(_views.length-1)

                        }

              });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                //console.log(selected)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })
          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: false,
            mouseEnabled : true,
            touchEnabled : true
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
            _s.unbind("clickStage");

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;
                  
              node.label = null;
              node.labelAdjust = false;
              node.selected = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = 3;
                node.target_color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                  node.target_x = node.file_x;
                 node.target_y = node.file_y;
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {

                node.target_size = 0;
                node.target_color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = 2;
                //node.target_color = "#C6C6C6"; 
                node.target_color = "#42A8A8";
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.middleRadius * Math.cos(angle);
                node.target_y = _options.middleRadius * Math.sin(angle);

              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              
              var query = queryPosition.domain()
              if(query.indexOf(edge.source) > -1){
                edge.color ="rgba(17, 17, 17, 0)"
              }else{
                edge.color ="rgba(17, 17, 17, 0.1)"
              }
            });

              _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                          //applyView(_views.length-1)

                        }

              });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: false,
            labelThreshold: 1,
            enableCamera: true,
            mouseEnabled : true,
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
            _s.unbind("clickStage");

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;
                  
              node.label = null;
              node.labelAdjust = false;
              node.selected = false;

              if (node.attributes["Type"] == "query")  {
                node.target_size = +node.attributes["Size"] / _options.ratio;
                node.target_color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                 node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = +node.attributes["Size"];
                //node.target_color = "#C6C6C6"; 
                node.target_color = "#42A8A8";
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = _options.middleRadius * Math.cos(angle);
                node.target_y = _options.middleRadius * Math.sin(angle);

              }
            });

            _s.graph.edges().forEach(function(edge, i, a) {
              var query = queryPosition.domain()
              
              if(query.indexOf(edge.source) > -1){
                edge.color ="rgba(17, 17, 17, 0.1)"
              }else{
                edge.color ="rgba(17, 17, 17, 0)"
              }
            });

            _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                          //applyView(_views.length-1)

                        }

              });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                console.log(selected)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })
          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: true,
            mouseEnabled : true,
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
            _s.unbind("clickStage");

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  l2 = _options.innerUrlCount,
                  l3 = _options.innerPageCount;

              node.label = null;
              node.labelAdjust = false;
              node.selected = false;
              

              if (node.attributes["Type"] == "query")  {
                //node.target_size = _s.graph.degree(node.id, "out")/ _options.ratio;
                node.target_size = +node.attributes["Size"] / _options.ratio;
                node.target_color = "#273B4F"; 
                angle = Math.PI * 2 * queryPosition(node.file_label) / l - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.innerRadius * Math.cos(angle);
                //node.target_y = _options.innerRadius * Math.sin(angle);
                //node.label = node.file_label
              } else if(node.attributes["Type"] == "url") {
                //console.log(i, a.length, l, l2)
                node.target_size = 0;
                node.target_color = "#C6C6C6"; 
                angle = Math.PI * 2 * (i) / (l3) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);

              }
              else {
                node.target_size = +node.attributes["Size"];
                //node.target_color = "#C6C6C6"; 
                node.target_color = "#42A8A8";
                angle = Math.PI * 2 * (i - l - l3) / (l2) - Math.PI / 2;
                node.target_x = node.file_x;
                node.target_y = node.file_y;
                node.label = node.file_label
                //node.target_x = _options.outerRadius * Math.cos(angle);
                //node.target_y = _options.outerRadius * Math.sin(angle);

              }

            });

            _s.graph.edges().forEach(function(edge, i, a) {
              var query = queryPosition.domain()
              
              if(query.indexOf(edge.source) > -1){
                edge.color ="rgba(17, 17, 17, 0.1)"
              }else{
                edge.color ="rgba(17, 17, 17, 0)"
              }
            });


            _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                          applyView(_views.length-1)

                        }

              });

            _s.bind("clickNode", function(e) {

                dispatch.resetfilter()
                
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;

                        node.label = node.file_label;
                        node.selected = false;

                         if (node.attributes["Type"] == "query"){
                          node.target_color = "#273B4F"; 
                        }else{
                          
                          //node.target_color = "#C6C6C6"; 
                          node.target_color = "#42A8A8";
                        }
                      });
                   _s.graph.edges().forEach(function(edge, i, a) {
                      var query = queryPosition.domain()
              
                      if(query.indexOf(edge.source) > -1){
                        edge.color ="rgba(17, 17, 17, 0.1)"
                      }else{
                        edge.color ="rgba(17, 17, 17, 0)"
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
                else{
                  
                  var nh = _dbGraph.neighborhood(e.data.node.id)
                     var nodes = nh.nodes;
                     var edges = nh.edges;
                     var idsN = nodes.map(function(d){return d.id});
                     var idsE = edges.map(function(d){return d.id});
                     var query = queryPosition.domain();

                     dispatch.clicked(e.data.node, nodes)

                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                           if (node.attributes["Type"] == "query"){
                              node.target_color = "#273B4F"; 
                            }else{
                              
                              //node.target_color = "#C6C6C6"; 
                node.target_color = "#42A8A8";
                            }
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            if (node.attributes["Type"] == "query"){
                                node.target_color = "#273B4F"; 
                            }else{
                                node.target_color = "#C6C6C6";
                            }
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#F1F1F1"
                            node.label = null;
                            node.selected = false
                          }
                      });
                      _s.graph.edges().forEach(function(edge, i, a) {
                          if (idsE.indexOf(edge.id) > -1 && query.indexOf(edge.source) > -1){
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
  "cs_crawl_network":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 1000,
        outerRadius: 2000,
        duration: 500,
        action: 0,
        ratio: 3
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
          font: 'Roboto'
        },
    "parserURL": "data/cs_crawl_network/cs_crawl.json",
    "queryPosScale": null,
    "parserFnc":       function(graph) {
        // Save the original data:
        graph.nodes.forEach(function(n) {
          n.file_label = n.attributes.Prefixes;
          //n.file_color = n.color;
          n.file_color = "#C6C6C6";
          n.file_size = n.size;
          n.file_x = n.x;
          n.file_y = n.y;
          n.type = 'who';

          delete n.label;



          if (n.attributes.crwl)
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


        var _dragListener = new sigma.events.drag(_s.renderers[0]);
        _dragListener.bind('drag', function(e) {
            dragged = true;
        });

        _dragListener.bind('drop', function(e) {
            dragged = false;
        });

        // Apply first action:
        applyView(0);
      },
    "_views": [
        {
          /**
           * ONLY INNER CIRCLE
           * CIRCULAR LAYOUT
           * ALL GREYS
           */
          init: function() {
            _s.unbind('clickNode');
            _s.unbind('clickStage');

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount;

              if (i < l) {
                node.target_size = 3;
                //node.target_color = node.file_color; // TODO: Apply good color
                node.target_color = "#42A8A8";
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

            _s.bind('clickStage', function(e) {
                if(!dragged){
                    dispatch.resetfilter()
                  }
                });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                console.log(selected)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })

          },
          forceAtlas2: false,
          center: null,
          settings: {
            drawEdges: false,
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
            _s.unbind('clickStage');

            _s.graph.nodes().forEach(function(node, i, a) {
              var angle,
                  l = _options.innerCircleCount,
                  labelToShow = ["who.int", "nih.gov", "ican-online.net", "theunnecesarean.com", "thelancet.com", "nhs.gov"];

              node.label = null;
              //node.target_size = _s.graph.degree(node.id) / _options.ratio;
              if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label.toUpperCase();

              node.target_size = node.file_size / _options.ratio;
              //node.target_size = _s.graph.degree(node.id) / _options.ratio;
              if (i < l) {

                //if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label;
                node.target_color = "#42A8A8"; // TODO: Apply good color
                angle = Math.PI * 2 * i / l - Math.PI / 2;
                node.target_x = _options.innerRadius * Math.cos(angle);
                node.target_y = _options.innerRadius * Math.sin(angle);

              } else {
                node.target_color = "#C6C6C6"; // TODO: Apply good color
                angle = Math.PI * 2 * (i - l) / (a.length - l) - Math.PI / 2;
                node.target_x = _options.outerRadius * Math.cos(angle);
                node.target_y = _options.outerRadius * Math.sin(angle);
              }
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });

            _s.bind('clickStage', function(e) {
                if(!dragged){
                    dispatch.resetfilter()
                  }
                });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                console.log(selected)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })

          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
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
            _s.unbind('clickStage');

            _s.graph.nodes().forEach(function(node, i, a) {

              var l = _options.innerCircleCount,
                  labelToShow = ["who.int", "nih.gov", "ican-online.net", "theunnecesarean.com", "thelancet.com", "nhs.gov"];

              node.label = null;

              if(labelToShow.indexOf(node.file_label.toLowerCase()) >= 0 ) node.label = node.file_label.toUpperCase();

              if (i < l)
                node.target_color = "#42A8A8"; // TODO: Apply good color
              else
                node.target_color = "#C6C6C6"; // TODO: Apply good color

              //node.target_size = _s.graph.degree(node.id) / _options.ratio;
              node.target_size = node.file_size / _options.ratio;
              node.target_x = node.file_x;
              node.target_y = node.file_y;
            });
            _s.graph.edges().forEach(function(edge, i, a) {
              edge.color = 'rgba(17, 17, 17, 0.1)'
            });

            _s.bind('clickStage', function(e) {
                if(!dragged){
                    dispatch.resetfilter()
                  }
                });

             _s.bind("clickNode", function(e) {

                
                var nh = _dbGraph.neighborhood(e.data.node.id)
                var nodes = nh.nodes;

                
                var selected = e.data.node.selected

                //console.log(e.data.node)

                if(selected){
                   e.data.node.selected = false
                  dispatch.resetfilter()
                }else{
                  e.data.node.selected = true
                   dispatch.resetfilter()
                  dispatch.clicked(e.data.node, nodes)
                }
                    
                _s.graph.nodes().forEach(function(node, i, a) {
                  if(e.data.node.id == node.id){
                    
                    
                  }else{
                     node.selected = false;
                  }
                })

             })

          },
          forceAtlas2: false,
          center: null,
          filter: null,
          settings: {
            drawEdges: true,
            labelThreshold: 1,
            enableCamera: false,
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
            _s.unbind("clickNode");
            _s.unbind('clickStage');
            dispatch.resetfilter()
            
            _s.graph.nodes().forEach(function(node, i, a) {
              var l = _options.innerCircleCount;

              node.label = node.file_label;

              node.target_color = colorScale(node.attributes["Modularity Class"])

              node.target_x = node.file_x;
              node.target_y = node.file_y;
              node.target_size = node.file_size / _options.ratio;
              //node.target_size = _s.graph.degree(node.id) / _options.ratio;
            });
            _s.graph.edges().forEach(function(edge, i, a) {
                            edge.color = 'rgba(17, 17, 17, 0.1)'

              });

            _s.bind('clickStage', function(e) {
                        if(!dragged){
                          dispatch.resetfilter()
                          applyView(_views.length-1)

                        }

              });

            _s.bind('clickNode', function(e) {
                var selected = e.data.node.selected
                var cam = _s.cameras[0]
                if(selected){
                  dispatch.resetfilter()
                  _s.graph.nodes().forEach(function(node, i, a) {
                        var l = _options.innerCircleCount;
                        node.label = node.file_label;
                        node.selected = false;
                        node.target_color = colorScale(node.attributes["Modularity Class"])

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

                      dispatch.resetfilter()
                      dispatch.clicked(e.data.node, nodes)

                      _s.graph.nodes().forEach(function(node, i, a) {
                          if(node.id == e.data.node.id){
                            node.selected = true
                            node.target_color = colorScale(node.attributes["Modularity Class"])
                            node.label = node.file_label;
                          }
                          else if (idsN.indexOf(node.id) > -1){
                            node.target_color = "#C6C6C6"; // TODO: Apply good color
                            //node.target_color = "#42A8A8"; // TODO: Apply good color
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#F1F1F1"
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
   "cs_aufeminin_networkFR":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 500,
        outerRadius: 1000,
        duration: 500,
        action: 0,
        ratio: 40
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
    "parserURL": "data/cs_aufeminin_networkFR/cs_af_fr.json",
    "queryPosScale": null,
    "parserFnc": function(graph) {
        // Save the original data:
		
        scale = 28; //philotaxis

        graph.nodes.forEach(function(n) {
          
          if(n.attributes["role"] != 'forum'){
            n.file_label = n.label;
          }else{
            var l = n.label.split('_')

            n.label = l.slice(2,-1).join(" ")
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
                a = a.attributes['Out-Degree'] > 1 && a.attributes['Out-Degree'] < 3 ? 1 : 0,
                b = b.attributes['Out-Degree'] > 1 && b.attributes['Out-Degree'] < 3 ? 1 : 0;

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

        var bis1Id =["01_fr_attendre_bebe_authors", "04_fr_desir_enfant_authors"]
        var bis2Id =["01_fr_attendre_bebe_authors", "03_fr_bebe_est_la_authors"]
        bis1.nodes = bis1.nodes.concat(bis1Id)
        bis2.nodes = bis2.nodes.concat(bis2Id)

        _dbGraph.nodes().forEach(function(d){

          if(_dbGraph.degree(d.id, 'out') == 2){
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

        // // Bind buttons:
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
        console.log("here")
        $(".tt").remove();
        applyView(0);
      },
    "_views" : [
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
                node.target_color = "#273B4F";
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
            labelThreshold: 0,
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

              if (node.attributes["role"] == 'forum')  {
                node.target_size = 3;
                node.target_color = "#273B4F"; // TODO: Apply good color
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label
              } else {
                node.target_size = 2;
                node.target_color = "#C6C6C6"; // TODO: Apply good color
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
            labelThreshold: 0,
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
              
              if (node.attributes["role"] == 'forum') {
                node.target_size = _s.graph.degree(node.id, 'in')/ _options.ratio;
                node.target_color = "#273B4F"; // TODO: Apply good color
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label

              } else {
                if(_s.graph.degree(node.id, 'out') > 1 && _s.graph.degree(node.id, 'out') < 3){
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
            labelThreshold: 0,
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


              if (node.attributes["role"] == 'forum'){
                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
                node.label = node.file_label
              }
              else{
                if(_s.graph.degree(node.id, 'out') > 1 && _s.graph.degree(node.id, 'out') < 3){
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
            labelThreshold: 0,
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

               if (node.attributes["role"] == 'forum'){

                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis1.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#C6C6C6"; 
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
            labelThreshold: 0,
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

               if (node.attributes["role"] == 'forum'){

                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis2.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#C6C6C6"; 
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
            labelThreshold: 0,
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


              if (node.attributes["role"] == 'forum'){
                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'in') / _options.ratio;
              }
              else{
                if(_s.graph.degree(node.id, 'out') > 1 && _s.graph.degree(node.id, 'out') < 3){
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
                          node.target_color = "#273B4F"; // TODO: Apply good color
                        }else{
                          if(_s.graph.degree(node.id, 'out') > 1 && _s.graph.degree(node.id, 'out') < 3){
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
                            node.target_color = "#273B4F"
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#C6C6C6"
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
  },
   "cs_aufeminin_networkIT":{
    "_options": {
        innerCircleCount: 0,
        innerRadius: 500,
        outerRadius: 1000,
        duration: 500,
        action: 0,
        ratio: 50
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
    "parserURL": "data/cs_aufeminin_networkIT/cs_af_it.json",
    "queryPosScale": null,
    "parserFnc": function(graph) {

        scale = 22;
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

        //console.log(bis1,bis2)

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

        // // Bind buttons:
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
      "_views" : [
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
                node.target_color = "#273B4F";
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

              if (node.attributes["role"] == 'forum')  {
                node.target_size = 3;
                node.target_color = "#273B4F"; // TODO: Apply good color
                 node.target_x = node.file_x;
                node.target_y = node.file_y;
                 node.label = node.file_label
              } else {
                node.target_size = 2;
                node.target_color = "#C6C6C6"; // TODO: Apply good color
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
              
              if (node.attributes["role"] == 'forum') {
                node.target_size = _s.graph.degree(node.id, 'out')/ _options.ratio;
                node.target_color = "#273B4F"; // TODO: Apply good color
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


              if (node.attributes["role"] == 'forum'){
                node.target_color = "#273B4F"; // TODO: Apply good color
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

               if (node.attributes["role"] == 'forum'){

                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis1.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#C6C6C6"; 
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

               if (node.attributes["role"] == 'forum'){

                node.target_color = "#273B4F"; // TODO: Apply good color
                node.target_size = _s.graph.degree(node.id, 'out') / _options.ratio;
                node.label = node.file_label
              }else{

                if(bis2.nodes.indexOf(node.id) > -1){
                node.target_color = goodColors.E;

                  }
                else{
                  node.target_color = "#C6C6C6"; 
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


              if (node.attributes["role"] == 'forum'){
                node.target_color = "#273B4F"; // TODO: Apply good color
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
                          node.target_color = "#273B4F"; // TODO: Apply good color
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
                            node.target_color = "#273B4F"
                            node.selected = false
                            node.label = node.file_label;
                          }
                          else{
                            node.target_color = "#C6C6C6"
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
}//end networkconfig

    d3.rebind(vis, dispatch, 'on');

    return vis;
  }
  
})();