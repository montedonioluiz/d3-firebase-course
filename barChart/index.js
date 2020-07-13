const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

// create margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

// create graph and axisGroups
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

// create scales
// Linear scale for height
const y = d3.scaleLinear()
  .range([graphHeight, 0]);

// BandScale for width
const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// Create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .tickFormat(data => `${data} orders`);

// Update attrs func
const updateRegSelectionAttrs = (graph) => {
  graph.attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .transition().duration(500)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders))

}

// Update entering attrs func
const updateEnterSelectionAttrs = (graph) => {
  graph.enter()
    .append('rect')
    .attr('width', x.bandwidth)
    .attr("height", 0)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .transition().duration(500)
    .attr("height", d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));
}


// Add func
const add = (data) => {
  // 1. update scales 
  y.domain([0, d3.max(data, data => data.orders)]);
  x.domain(data.map(menuItem => menuItem.name));

  // 2. reflect DB data to graph data
  const rects = graph.selectAll('rect').data(data);

  // 3. update current DOM attrs
  updateRegSelectionAttrs(rects);

  // 4. create and add attrs to new leftover rects 
  updateEnterSelectionAttrs(rects);

  // 5. Update axes if necessary
  yAxis.ticks(d3.max(data, data => data.orders) / 100)
  xAxisGroup.call(xAxis);

  xAxisGroup.selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)')
    .attr('fill', 'blue');
  yAxisGroup.call(yAxis);
}

// Update func
const update = (data) => {
  // 1. update scales 
  y.domain([0, d3.max(data, data => data.orders)]);
  x.domain(data.map(menuItem => menuItem.name));

  // 2. reflect DB data to graph data
  const rects = graph.selectAll('rect').data(data);

  // 4. update current DOM attrs (in case an existing registry was changed in the DB)
  updateRegSelectionAttrs(rects);

  // 6. Update axes if necessary
  yAxis.ticks(d3.max(data, data => data.orders) / 100)
  xAxisGroup.call(xAxis);

  xAxisGroup.selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)')
    .attr('fill', 'blue');
  yAxisGroup.call(yAxis);
}

// Remove func
const remove = data => {
  // 1. update scales 
  y.domain([0, d3.max(data, data => data.orders)]);
  x.domain(data.map(menuItem => menuItem.name));

  // 2. reflect DB data to graph data
  const rects = graph.selectAll('rect').data(data);

  // 3. clear leftover rects from DOM (in case something was removed from DB)
  rects.exit().remove();

  // 5. update current DOM attrs (in case an existing registry was changed in the DB)
  updateRegSelectionAttrs(rects)

  // 6. Update axes if necessary
  yAxis.ticks(d3.max(data, data => data.orders) / 100)
  xAxisGroup.call(xAxis);

  xAxisGroup.selectAll('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-40)')
    .attr('fill', 'blue');
  yAxisGroup.call(yAxis);
}


let data = []
let initialData = true;

// Listen to data
db.collection('dishes').onSnapshot(res => {
  if (initialData) {
    initialData = false
    res.docChanges().forEach(change => {
      data.push(change.doc.data())
    })
    add(data);
  } else {
    let change = res.docChanges()[0];
    switch (change.type) {
      case 'added': {
        data.push(change.doc.data())
        add(data);
        break;
      }
      case 'modified': {
        data[change.oldIndex] = change.doc.data()
        update(data);
        break;
      }
      case 'removed': {
        data.splice(change.oldIndex, 1)
        remove(data);
        break;
      }
      default: {
        console.log("ue: ", change)
        break;
      }
    }
  }
})
