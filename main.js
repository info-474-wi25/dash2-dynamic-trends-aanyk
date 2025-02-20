// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container for chart 1
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    // Assuming CSV has columns: "Year" and "Fatalities"
    // Convert Year and Fatalities to numbers for each row.
    const parsedData = data.map(d => ({
        Year: +d.Year,
        Fatalities: +d.Fatalities
    }));

    // Aggregate data: sum fatalities for each year (if multiple rows per year)
    const aggregated = d3.rollups(parsedData,
        v => d3.sum(v, d => d.Fatalities),
        d => d.Year
    );
    // Convert aggregated data into an array of objects.
    const aggregatedData = aggregated.map(([year, fatalities]) => ({
        Year: year,
        Fatalities: fatalities
    }));
    // Sort data by Year (ascending)
    aggregatedData.sort((a, b) => a.Year - b.Year);

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleLinear()
        .domain(d3.extent(aggregatedData, d => d.Year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData, d => d.Fatalities)])
        .range([height, 0]);

    // 4.a: PLOT DATA FOR CHART 1
    svg1_RENAME.append("path")
        .datum(aggregatedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d.Fatalities))
        );

    // 5.a: ADD AXES FOR CHART 1
    svg1_RENAME.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // Format ticks as integers

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
        .text("Total Fatalities");

    // 7.a: ADD INTERACTIVITY FOR CHART 1
     svg1_RENAME.selectAll("circle")
         .data(aggregatedData)
         .enter()
         .append("circle")
         .attr("cx", d => xScale(d.Year))
         .attr("cy", d => yScale(d.Fatalities))
         .attr("r", 4)
         .attr("fill", "red")
         .on("mouseover", function(event, d) {
            // Show tooltip (customize as needed)
             tooltip.style("display", "block")
                    .html(`Year: ${d.Year}<br>Total Fatalities: ${d.Fatalities}`);
         })
         .on("mouseout", function() {
             // Hide tooltip
              tooltip.style("display", "none");
         });

    // ==========================================
    //         CHART 2 (Not applicable)
    // ==========================================
});
