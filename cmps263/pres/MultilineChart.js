var margin = {top: 50, right: 80, bottom: 30, left: 50};
var svg = d3.select("body").append("svg")
            .attr("width", 960)
            .attr("height", 500);
var width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var parseTime = d3.timeParse("%Y");
    
var x = d3.scaleTime().rangeRound([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var redraw = 0;
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.energy); });

d3.csv("BRICSdata.csv", type, function(error, data) {
  if (error) throw error;
  console.log(data[0]);
  var countries = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {year: d.year, energy: d[id]};
      })
    };
  });
  console.log(countries);

  x.domain(d3.extent(data, function(d) { return d.year; }));

  y.domain([
    d3.min(countries, function(c) { return d3.min(c.values, function(d) { return d.energy; }); }),
    d3.max(countries, function(c) { return d3.max(c.values, function(d) { return d.energy; }); })
  ]);

  z.domain(countries.map(function(c) { return c.id; }));

    // X-axis Title
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
        .attr("fill", "#000")
        .attr("y", margin.bottom / 4)
        .attr("x", width + margin.right / 2)
        .attr("text-anchor", "end")
        .text("Year")

// Y-axis Title position ref: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .text("Million BTUs per Person");

    g.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(gridXaxis()
            .tickSize(-height)
            .tickFormat("")
             )
    g.append("g")
        .attr("class", "grid")
        .call(gridYaxis()
             .tickSize(-width)
             .tickFormat(""))
    

  var country = g.selectAll(".country")
    .data(countries)
    .enter().append("g")
      .attr("class", "country");

  var path = country.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });
  var totalLength = path.node().getTotalLength();

    // Animate the path
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
  g.on("click", function(){
      var drawLength = totalLength;
      if (redraw == 1) {
          redraw = 0;
          drawLength = 0;
      } else {
          redraw = 1;
      }
      path      
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", drawLength);
    })
    
  country.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.energy) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

// Title of the Graph
  country.append("text")
    .attr("x", (width /2))
    .attr("y", 0 - (margin.top /2))
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("fill", "purple")
    .text("Energy Consumption Per Capita")
});

// Draw Grid lines
function gridXaxis() {		
    return d3.axisBottom(x)
        .ticks(5)
}

function gridYaxis() {
    return d3.axisLeft(y)
        .ticks(5)
}


function type(d, _, columns) {
  d.year = parseTime(d.year);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
