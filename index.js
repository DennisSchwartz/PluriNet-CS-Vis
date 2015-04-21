/**
 * Created by ds on 20/04/15.
 */

// Get root div -> inject visualization
var rootDiv = document.getElementById('rootDiv');

// 'imports'
var cytoscape = require("cytoscape");
var baby = require("babyparse");
var fs = require('fs');

// Div styling
rootDiv.style.left = 0;
rootDiv.style.top = 0;
rootDiv.style.width = "100%";
rootDiv.style.height = "100%";
rootDiv.style.position = "absolute";

// set path to json data
var dataPath = './data/pluri-sub.cyjs';
var exprPath = './data/guo.csv';




var cy = cytoscape({

    container: rootDiv,
    ready: function() {
        var cy = this;

        /* Load Interaction Data */
        console.log('loading PluriNetWork data!');
        loadFile(dataPath, function(data){
            var interaction = JSON.parse(data);

            /* Load Expression Data */
            loadFile(exprPath, function (data) {
                //console.log('Csv-Data:' + data);
                var expr = baby.parse(data, { delimiter: ";", header: true });
                console.log(expr);
                // get cell 103
                var cell = expr.data[213];
                // go trough expression data and add it to the respective node
                for (var key in cell) {
                    if (cell.hasOwnProperty(key)) {
                        for (var i = 0; i < interaction.elements.nodes.length; i++) {
                            if (interaction.elements.nodes[i].data.name === key) {
                                // Values are not yet normalized!!
                                interaction.elements.nodes[i].data.expr = -1 * parseFloat(cell[key].replace(",", "."));
                            }
                        }
                    }
                }
                console.log(interaction.elements);
                //interaction.elements.nodes = nodes;
                cy.load(interaction.elements);
            });
        });
        console.log('finished rendering!');
    },
    headless: false,
    renderer: {
        name: "canvas"
    },
    style: cytoscape.stylesheet()
        .selector('node')
        .css({
            'font-size': 15,
            'content': 'data(name)',
            'text-valign': 'center',
            'color': 'white',
            'background-color': 'mapData(expr, -28, -12, red, yellow)',
            'text-outline-width': 2,
            'text-outline-color': '#888',
            'min-zoomed-font-size': 8,
            'width': 'mapData(expr, -28, -10, 20, 60)',
            'height': 'mapData(expr, -28, -10, 20, 60)'
        })
        .selector('node:selected')
        .css({
            'background-color': '#000',
            'text-outline-color': '#000'
        })
        .selector('edge')
        .css({
            'width': 2,
            'target-arrow-shape': 'triangle',
            'line-color': '#ffaaaa',
            'target-arrow-color': '#ffaaaa'
        })
        .selector('edge[interaction = "stim"]')
        .css({
            'line-color': '#EAA2A3',
            'target-arrow-color': '#EAA2A3'
        })
        .selector('edge[interaction = "inh"]')
        .css({
            'line-color': '#9BD8DD',
            'target-arrow-color': '#9BD8DD'
        }),
    layout: {
        name: 'circle',
        fit: 'true',
        padding: 30
    }
});


/**
 * Load data from a Json file
 * @param path Relative path to JSON file
 * @param callback Called if read successful. Param: JSON data
 */
function loadFile(path, callback) {

    var xobj = new XMLHttpRequest();
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            console.log("Reading File!");
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

/**
 * Return only nodes set in node-list.json file
 * @param data Whole node set
 * @param callback called after filter, returns subset of nodes
 */
function filterNodes(data, callback) {

    var unfiltered = data;
    loadFile('./data/node-list.json', function(data) {
        // parse data to filterList
        var filterList = data;
        console.log('Nodelist: ' + filterList);
        var filtered = {};
        unfiltered.nodes.filter(function(node) {
            // if current node is in filter list
            if (filterList.some(function(v) { return node.node_label.indexOf(v) > -1; })) {
                // add node to filtered list
                filtered.push(node);
            }
        });
        console.log(filtered);
        callback(filtered);
    });
}

