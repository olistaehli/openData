var svg = d3.select('svg');
var bbox = svg.node().getBoundingClientRect();
var svgWidth = bbox.width;
var svgHeight = bbox.height;

/* Deine Lösung zu Aufgabe 1 Start */
svg.append("circle").attr("class", "circle").attr("cx", 0).attr("cy", 0).attr("r", 50);
/* Deine Lösung zu Aufgabe 1 Ende */

/* Deine Lösung zu Aufgabe 2 Start */
d3.select(".circle")
    .transition()
    .style("fill", "blue")
    .attr("cx", svgWidth + 50)
    .attr("cy", svgHeight + 50)
    .duration(2000);
/* Deine Lösung zu Aufgabe 2 Ende */

/**
 * Returns a randomly filled circle object array
 */
function generateRandomData(size) {
    var data = [];
    for (var i = 0; i < size; i++) {
        data.push({
            cx: Math.random() * svgWidth,
            cy: Math.random() * svgHeight,
            r: Math.random() * 20
        });
    }
    return data;
}

var circleGroup = svg.append('g')
    .attr('id', 'circleGroup');


function addNewElements(data) {
    /* Deine Lösung zu Aufgabe 3 Start */
    circleGroup
        .selectAll('circle')
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) {
            return d.cx
        })
        .attr("cy", function(d) {
            return d.cy
        })
        .attr("r", function(d) {
            return d.r
        });
    /* Deine Lösung zu Aufgabe 3 Ende */
}


/**
 * Update Selection
 */
function updateExistingElements(data) {
    /* Deine Lösung zu Aufgabe 4 Start */
    circleGroup
        .selectAll('circle')
        .data(data).transition()
        .style("fill", "blue")
        .attr("cx", function(d) {
            return d.cx
        })
        .attr("cy", function(d) {
            return d.cy
        })
        .attr("r", function(d) {
            return d.r
        })
        .duration(2000);
    /* Deine Lösung zu Aufgabe 4 Ende */
}


function removeResidualElements(data) {
    /* Deine Lösung zu Aufgabe 5 Start */
    circleGroup.selectAll("circle")
        .data(data)
        .exit()
        .transition()
        .attr("r", 0)
        .duration(2000)
        .remove()
        /* Deine Lösung zu Aufgabe 5 Ende */
}


function addListenerToCircles() {
    /* Deine Lösung zu Aufgabe 6 Start */
    circleGroup.selectAll("circle")
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 0.5)
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 1)
        })
        /* Deine Lösung zu Aufgabe 6 Ende */
}


/**
 * Updates the DOM based on passed data Array.
 */
function update(data) {
    addNewElements(data);
    updateExistingElements(data);
    removeResidualElements(data);
}

/**
 * Adds click listener to trigger the update function with
 * randomly generated data.
 */
d3.select('#updateData').on('click', function() {
    var random = Math.random() * 100;
    update(generateRandomData(random));
    addListenerToCircles();
});

var firstData = generateRandomData(20);
update(firstData);
addListenerToCircles();