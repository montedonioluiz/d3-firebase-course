const data = [
  { width: 200, height: 100, fill: 'purple' },
  { width: 100, height: 60, fill: 'pink' },
  { width: 50, height: 30, fill: 'red' },
]

const svg = d3.select('svg');

// retrieving rect from DOM (selectAll bcuz data/enter only works on array)
let rects = svg.selectAll('rect')

// insertig data into rects object
rects = rects.data(data);

// add attrs to rects already in the DOM
rects
  .attr('width', (data, index, elements) => data.width)
  .attr('height', data => data.height)
  .attr('fill', data => data.fill);

// inserting enter selection w/ atts into DOM
rects.enter()
  .append('rect')
  .attr('width', (data, index, elements) => data.width)
  .attr('height', data => data.height)
  .attr('fill', data => data.fill);