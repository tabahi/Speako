

const go = require('gojs');
var myDiagram;
var $;
var default_model_url = null;
var local_model_id = null;

export function DesignerSetup(local_model='convo_model', model_url='./model.json') {

    default_model_url = model_url;
    local_model_id = local_model;
    
    console.log("Default model: ", default_model_url, "Memory model: ", local_model_id);

    let lang_set = window.localStorage.getItem('convo_lang');
    if(!lang_set) window.localStorage.setItem('convo_lang', 'en-US');
    document.getElementById('lang_set').value = window.localStorage.getItem('convo_lang');
    

    $ = go.GraphObject.make;  // for conciseness in defining templates

    var yellowgrad = $(go.Brush, { color: "yellow" });
    var greengrad = $(go.Brush, { color: "palegreen" });
    var bluegrad = $(go.Brush, { color: "#99E9FF" });
    var redgrad = $(go.Brush, { color: "#FFA066" });
    var whitegrad = $(go.Brush, "Linear", { 0: "#F0F8FF", 1: "#E6E6FA" });

    var bigfont = "12pt Helvetica, Arial, sans-serif";
    var smallfont = "10pt Helvetica, Arial, sans-serif";

    // Common text styling
    function textStyle() {
      return {
        margin: 6,
        wrap: go.TextBlock.WrapFit,
        textAlign: "center",
        editable: true,
        font: bigfont
      }
    }

    myDiagram =
      $(go.Diagram, "myDiagramDiv",
        {
          // have mouse wheel events zoom in and out instead of scroll up and down
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          initialAutoScale: go.Diagram.Uniform,
          "linkingTool.direction": go.LinkingTool.ForwardsOnly,
          layout: $(go.LayeredDigraphLayout, { isInitial: false, isOngoing: false, layerSpacing: 50 }),
          "undoManager.isEnabled": true
        });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function(e) {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    var possibilitiesTemplate = $(go.Panel, "Horizontal",
      $(go.TextBlock, "Text",
        {
          margin: new go.Margin(4, 2, 0, 2),
          maxSize: new go.Size(200, NaN),
          wrap: go.TextBlock.WrapFit,
          stroke: "black",
          editable: true,
          font: smallfont
        },
        new go.Binding("text", "text").makeTwoWay())
    );

    var humanAdornment =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, { fill: null, stroke: "red", strokeWidth: 4 }),
          $(go.Placeholder)),
        // the button to create a "next" node, at the top-right corner
        $("Button",
          {
            alignment: go.Spot.TopRight,
            click: addBotNodeAndLink
          },  // this function is defined below
          new go.Binding("visible", "", function(a) { return !a.diagram.isReadOnly; }).ofObject(),
          $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
        ),
        $("Button",
          {
            alignment: go.Spot.BottomRight,
            click: addPossibilities
          },  // this function is defined below
          new go.Binding("visible", "", function(a) { return !a.diagram.isReadOnly; }).ofObject(),
          $(go.Shape, "TriangleDown", { desiredSize: new go.Size(10, 10) })
        )
      );
    var botAdornment =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, { fill: null, stroke: "red", strokeWidth: 4 }),
          $(go.Placeholder)),
        // the button to create a "next" node, at the top-right corner
        $("Button",
          {
            alignment: go.Spot.TopRight,
            click: addHumanNodeAndLink
          },  // this function is defined below
          new go.Binding("visible", "", function(a) { return !a.diagram.isReadOnly; }).ofObject(),
          $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
        )
      );

    // define the Node template
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        { selectionAdornmentTemplate: humanAdornment },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        // define the node's outer shape, which will surround the TextBlock
        $(go.Shape, "Rectangle",
          {
            fill: "#FFBD26", stroke: "black",
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
            toEndSegmentLength: 50, fromEndSegmentLength: 40
          }),
        $(go.TextBlock, "Unattended",
          {
            margin: 6,
            font: bigfont,
            editable: true
          },
          new go.Binding("text", "text").makeTwoWay()));

    myDiagram.nodeTemplateMap.add("Human",
          $(go.Node, "Auto",
          { selectionAdornmentTemplate: humanAdornment },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Rectangle",
              {
                fill: yellowgrad,
                portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer", fromEndSegmentLength: 40
              }),
              $(go.Panel, "Vertical", { defaultAlignment: go.Spot.TopLeft },
              $(go.TextBlock, "Human", textStyle(),
              {
                stroke: "black",
                minSize: new go.Size(80, NaN)
              },
              new go.Binding("text", "text").makeTwoWay()),

              $(go.Panel, "Vertical",
                {
                  defaultAlignment: go.Spot.TopLeft,
                  itemTemplate: possibilitiesTemplate
                },
                new go.Binding("itemArray", "possibilitiesList").makeTwoWay()
              )
            )
          ));

    myDiagram.nodeTemplateMap.add("Bot",
      $(go.Node, "Auto",
      { selectionAdornmentTemplate: botAdornment },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "RoundedRectangle",
          {
            fill: bluegrad,
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer", fromEndSegmentLength: 40
          }),
        $(go.TextBlock, "Bot", textStyle(),
          new go.Binding("text", "text").makeTwoWay())
      ));

    myDiagram.nodeTemplateMap.add("Bot Start",
      $(go.Node, "Auto",
      { selectionAdornmentTemplate: botAdornment },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "RoundedRectangle",
          {
            fill: "#C787FF",
            portId: "", fromLinkable: true, toLinkable: false, cursor: "pointer", fromEndSegmentLength: 40
          }),
        $(go.TextBlock, "Bot Start", textStyle(),
          new go.Binding("text", "text").makeTwoWay())
      ));

    myDiagram.nodeTemplateMap.add("Bot fallback",
      $(go.Node, "Auto",
      { selectionAdornmentTemplate: botAdornment },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "RoundedRectangle",
          {
            fill: "#D1D1D1",
            portId: "", fromLinkable: false, toLinkable: true, cursor: "pointer", fromEndSegmentLength: 40
          }),
        $(go.TextBlock, "Bot fallback", textStyle(),
          new go.Binding("text", "text").makeTwoWay())
      ));


    // Undesired events have a special adornment that allows adding additional "possibilitiess"
    var EventAdornment =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 4 }),
          $(go.Placeholder)),
        // the button to create a "next" node, at the top-right corner
        $("Button",
          {
            alignment: go.Spot.BottomRight,
            click: addPossibilities
          },  // this function is defined below
          new go.Binding("visible", "", function(a) { return !a.diagram.isReadOnly; }).ofObject(),
          $(go.Shape, "TriangleDown", { desiredSize: new go.Size(10, 10) })
        )
      );

    myDiagram.nodeTemplateMap.add("DesiredEvent",
        $(go.Node, "Auto",
        { selectionAdornmentTemplate: EventAdornment },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          $(go.Shape, "RoundedRectangle",
          { fill: greengrad, portId: "", fromLinkable: false, toLinkable: true, toEndSegmentLength: 50 }),

          $(go.Panel, "Vertical", { defaultAlignment: go.Spot.TopLeft },
          $(go.TextBlock, "Desired Out", textStyle(),
          {
            stroke: "black",
            minSize: new go.Size(80, NaN)
          },
          new go.Binding("text", "text").makeTwoWay()),

          $(go.Panel, "Vertical",
            {
              defaultAlignment: go.Spot.TopLeft,
              itemTemplate: possibilitiesTemplate
            },
            new go.Binding("itemArray", "possibilitiesList").makeTwoWay()
          )
          )
        ));

    

    


    myDiagram.nodeTemplateMap.add("UndesiredEvent",
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        { selectionAdornmentTemplate: EventAdornment },
        $(go.Shape, "RoundedRectangle",
          { fill: redgrad, portId: "", toLinkable: true, toEndSegmentLength: 50 }),
        $(go.Panel, "Vertical", { defaultAlignment: go.Spot.TopLeft },

          $(go.TextBlock, "Drop", textStyle(),
            {
              stroke: "black",
              minSize: new go.Size(80, NaN)
            },
            new go.Binding("text", "text").makeTwoWay()),

          $(go.Panel, "Vertical",
            {
              defaultAlignment: go.Spot.TopLeft,
              itemTemplate: possibilitiesTemplate
            },
            new go.Binding("itemArray", "possibilitiesList").makeTwoWay()
          )
        )
      ));

    myDiagram.nodeTemplateMap.add("Comment",
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "Rectangle",
          { portId: "", fill: whitegrad, fromLinkable: true }),
        $(go.TextBlock, "A comment",
          {
            margin: 9,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true,
            font: smallfont
          },
          new go.Binding("text", "text").makeTwoWay())
        // no ports, because no links are allowed to connect with a comment
      ));

    // clicking the button on an UndesiredEvent node inserts a new text object into the panel
    function addPossibilities(e, obj) {
      var adorn = obj.part;
      if (adorn === null) return;
      e.handled = true;
      var arr = adorn.adornedPart.data.possibilitiesList;
      myDiagram.startTransaction("add possibilities");
      myDiagram.model.addArrayItem(arr, {});
      myDiagram.commitTransaction("add possibilities");
    }

    // clicking the button of a default node inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function addBotNodeAndLink(e, obj) {
      var adorn = obj.part;
      if (adorn === null) return;
      e.handled = true;
      var diagram = adorn.diagram;
      diagram.startTransaction("Add State");
      // get the node data for which the user clicked the button
      var fromNode = adorn.adornedPart;
      var fromData = fromNode.data;
      // create a new "State" data object, positioned off to the right of the adorned Node
      var toData = {category: "Bot", text: "new" };
      var p = fromNode.location;
      toData.loc = p.x + 200 + " " + p.y;  // the "loc" property is a string, not a Point object
      // add the new node data to the model
      var model = diagram.model;
      model.addNodeData(toData);
      // create a link data from the old node data to the new node data
      var linkdata = {};
      linkdata[model.linkFromKeyProperty] = model.getKeyForNodeData(fromData);
      linkdata[model.linkToKeyProperty] = model.getKeyForNodeData(toData);
      // and add the link data to the model
      model.addLinkData(linkdata);
      // select the new Node
      var newnode = diagram.findNodeForData(toData);
      diagram.select(newnode);
      diagram.commitTransaction("Add State");
    }

    function addHumanNodeAndLink(e, obj) {
        var adorn = obj.part;
        if (adorn === null) return;
        e.handled = true;
        var diagram = adorn.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromNode = adorn.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = {category: "Human", possibilitiesList: [{}] };
        var p = fromNode.location;
        toData.loc = p.x + 200 + " " + p.y;  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);
        // create a link data from the old node data to the new node data
        var linkdata = {};
        linkdata[model.linkFromKeyProperty] = model.getKeyForNodeData(fromData);
        linkdata[model.linkToKeyProperty] = model.getKeyForNodeData(toData);
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);
        diagram.commitTransaction("Add State");
      }

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        new go.Binding("points").makeTwoWay(),
        { curve: go.Link.Bezier, toShortLength: 15 },
        new go.Binding("curviness", "curviness"),
        $(go.Shape,  // the link shape
          { stroke: "#2F4F4F", strokeWidth: 2.5 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "kite", fill: "#2F4F4F", stroke: null, scale: 2 })
      );

    myDiagram.linkTemplateMap.add("Comment",
      $(go.Link, { selectable: false },
        $(go.Shape, { strokeWidth: 2, stroke: "darkgreen" })));


    var palette =
      $(go.Palette, "myPaletteDiv",  // create a new Palette in the HTML DIV element
        {
          // share the template map with the Palette
          nodeTemplateMap: myDiagram.nodeTemplateMap,
          autoScale: go.Diagram.Uniform,  // everything always fits in viewport
        });

    palette.model.nodeDataArray = [
      { category: "Bot Start" },
      { category: "Bot" },
      { category: "Bot fallback" },
      { category: "Human", possibilitiesList: [{}]},
      { category: "DesiredEvent", possibilitiesList: [{}] },
      { category: "UndesiredEvent", possibilitiesList: [{}] },
      { category: "Comment" }
    ];

    const stored_model = window.localStorage.getItem(local_model_id);
    if(stored_model)
    {
        document.getElementById("mySavedModel").value = stored_model;
        load();
        layout();
    }
    else
    {
        model_load_from_url(default_model_url, local_model_id);
    }
}

function layout()
{
    myDiagram.layoutDiagram(true);
}


function save()
{
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;

    //store to localstore
    window.localStorage.setItem(local_model_id, document.getElementById("mySavedModel").value);
}

function reset()
{
    if (confirm("It will reset both the saved model and the code in the editor. Are you sure to reset the default model?"))
    {
        window.localStorage.removeItem(local_model_id);
        model_load_from_url(default_model_url, local_model_id);
    }
}

function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    window.localStorage.setItem(local_model_id, document.getElementById("mySavedModel").value);
}



export function model_load_from_url(model_url, mem_model_id, local_save=false)
{
    console.log("Loading from URL", model_url, mem_model_id);
    if(model_url==null) { model_url = default_model_url; }
    if(mem_model_id==null){  mem_model_id = local_model_id;}

    return new Promise((resolve, reject)=>{

        fetch(model_url).then(function (response)
        {
            return response.text().then(function(text) {
                if(local_save)
                {
                    window.localStorage.setItem(mem_model_id, text);
                    console.log("mem saved", mem_model_id);
                    resolve(1);
                }
                else
                {
                    document.getElementById("mySavedModel").value = text;
                    load();
                    layout();
                    resolve(1);
                }
            });
        })
        .catch(function (err) {
            // If an error occured, you will catch it here
            console.error(err);
            reject(0);
        });
    });
}

function download()
{
  let text = document.getElementById('mySavedModel').value;

  let fileBlob = new Blob([text], {type: "application/octet-binary"});

  let link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(fileBlob));
  link.setAttribute("download", "model.txt");
  link.appendChild(document.createTextNode("Save file"));
  document.body.appendChild(link);
  link.click();
}
export function DS_btn(btn_name)
{
    if(btn_name=="layout") layout();
    else if(btn_name=="save") save();
    else if(btn_name=="load") load();
    else if(btn_name=="reset") reset();
    else if(btn_name=="download") download();
}


export function DS_lang_change(lang_val)
{
  window.localStorage.setItem('convo_lang', lang_val);
}


