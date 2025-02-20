// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container for the chart
const svgLineChart = d3.select("#lineChart1") // Make sure this ID matches the one in index.html
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2: LOAD CSV DATA
d3.csv("aircraft_incidents.csv").then(data => {
    console.log(data); // Check that the data loads properly.

    // 2.b: TRANSFORM DATA
    data.forEach(d => {
        d.Event_Date_Years = +d.Event_Date_Years;
        d.Total_Fatal_Injuries = +d.Total_Fatal_Injuries;
        d.Total_Serious_Injuries = +d.Total_Serious_Injuries;
        d.Total_Uninjured = +d.Total_Uninjured;
    });

    // 3: SET SCALES FOR THE CHART
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Event_Date_Years))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Total_Fatal_Injuries)])
        .range([height, 0]);

    // 4: PLOT DATA (a basic scatter plot)
    svgLineChart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Event_Date_Years))
        .attr("cy", d => yScale(d.Total_Fatal_Injuries))
        .attr("r", 4)
        .attr("fill", "steelblue");

    // 5: ADD AXES FOR THE CHART
    // X-axis at the bottom
    svgLineChart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    // Y-axis on the left
    svgLineChart.append("g")
        .call(d3.axisLeft(yScale));

    // 6: ADD LABELS FOR THE CHART
    // X-Axis Label
    svgLineChart.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year of Incident");
    
    // Y-Axis Label
    svgLineChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Total Fatal Injuries");

    // 7: ADD INTERACTIVITY (Optional tooltip code can be added here)
});