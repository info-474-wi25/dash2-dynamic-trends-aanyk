// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container for the single chart
const svg1 = d3.select("#lineChart1") 
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip div (hidden by default)
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("display", "none");

// Load and transform data
d3.csv("aircraft_incidents.csv").then(data => {
    console.log("Raw Data:", data); // Check if data loads correctly

    // Aggregate incidents by year
    const incidentsByYear = d3.rollups(
        data,
        v => v.length, // Count incidents
        d => +d.Event_Date_Years // Convert year to number
    ).map(([year, count]) => ({ year, incidents: count }));

    console.log("Aggregated Data:", incidentsByYear); // Verify grouped data

    // Set scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(incidentsByYear, d => d.year)) 
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(incidentsByYear, d => d.incidents)]) 
        .range([height, 0]);

    // Plot line chart
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.incidents));

    svg1.append("path")
        .datum(incidentsByYear)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Plot data points (circles)
    svg1.selectAll("circle")
        .data(incidentsByYear)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.incidents))
        .attr("r", 5)
        .attr("fill", "red")
        .attr("stroke", "black")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`Year: ${d.year} <br> Incidents: ${d.incidents}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

    // Add axes
    svg1.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg1.append("g")
        .call(d3.axisLeft(yScale));

    // Add labels
    svg1.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2)
        .style("text-anchor", "middle")
        .text("Year");

    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 1.5)
        .style("text-anchor", "middle")
        .text("Number of Incidents");

}).catch(error => console.error("Error loading CSV file:", error));
