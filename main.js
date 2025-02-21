// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Global variable to store aggregated data for interactivity.
let globalAggregatedData = [];

// Create SVG container for Chart 1
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "3px")
    .style("display", "none");

// 2.a: LOAD...
// Replace "aircraft_incidents.csv" with your CSV file name (ensure it's in the same folder)
d3.csv("aircraft_incidents.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    // Use CSV headers: "Event_Date_Years" for the year and "Total_Fatal_Injuries" for fatality count.
    const parsedData = data.map(d => ({
        Year: +d.Event_Date_Years,
        Fatalities: +d.Total_Fatal_Injuries
    }));
    console.log("Parsed data:", parsedData);
    
    // Aggregate data: Sum Fatalities for each Year (if there are multiple rows per year)
    const aggregated = d3.rollups(
        parsedData,
        v => d3.sum(v, d => d.Fatalities),
        d => d.Year
    );
    const aggregatedData = aggregated.map(([year, sumFatal]) => ({
        Year: year,
        Fatalities: sumFatal
    }));
    aggregatedData.sort((a, b) => a.Year - b.Year);
    console.log("Aggregated data:", aggregatedData);
    
    // Save aggregated data globally for interactivity updates.
    globalAggregatedData = aggregatedData;
    
    // Draw the initial chart using the slider's default value (1990).
    const initialMinYear = +d3.select("#yearSlider").property("value");
    updateChart(initialMinYear);
    
    // 7.a: ADD INTERACTIVITY FOR CHART 1
    // (Interactivity for filtering is handled below via the slider event listener.)
});

// 3.a, 4.a, 5.a, 6.a: DRAW CHART 1 (wrapped in updateChart function for interactivity)
function updateChart(minYear) {
    // Filter aggregated data based on the slider (only include data where Year >= minYear)
    const filteredData = globalAggregatedData.filter(d => d.Year >= minYear);
    
    // Clear previous chart elements.
    svg1_RENAME.selectAll("*").remove();
    
    // 3.a: SET SCALES FOR CHART 1 using filtered data
    const xScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.Year))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.Fatalities)])
        .range([height, 0]);
    
    // 4.a: PLOT DATA FOR CHART 1
    if(filteredData.length > 1) { // Only draw line if there is more than one point
        svg1_RENAME.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => xScale(d.Year))
                .y(d => yScale(d.Fatalities))
            );
    }
    
    // 7.a: ADD INTERACTIVITY FOR CHART 1 - plot circles with tooltip interactivity
    svg1_RENAME.selectAll("circle")
        .data(filteredData)
        .join("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Fatalities))
        .attr("r", 5)
        .attr("fill", "red")
        .on("mouseover", (event, d) => {
            tooltip
                .style("display", "inline-block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .html(`<strong>Year:</strong> ${d.Year}<br/><strong>Fatalities:</strong> ${d.Fatalities}`);
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });
    
    // 5.a: ADD AXES FOR CHART 1
    svg1_RENAME.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));
    
    // 6.a: ADD LABELS FOR CHART 1
    // X-axis label
    svg1_RENAME.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year");
    
    // Y-axis label
    svg1_RENAME.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .text("Total Fatal Injuries");
}

// ==========================================
//         CHART 2 (if applicable)
// ==========================================
// (Since only one chart is required, the Chart 2 code is omitted)

// 7.b: ADD INTERACTIVITY FOR CHART 2
// (Not applicable)

// ------------------------------------------
// INTERACTIVE WIDGET EVENT LISTENER
// ------------------------------------------
d3.select("#yearSlider").on("input", function() {
    const selectedYear = +this.value;
    d3.select("#yearValue").text(selectedYear);
    updateChart(selectedYear);
});
