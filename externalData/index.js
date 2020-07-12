// get svg container
const svg = d3.select('svg');

d3.json('planets.json').then(data => {
  const circs = svg.selectAll('circle')
    .data(data);

  // add attrs to circs in DOM (at first there aren't any, so kinda pointless in this example)
  circs
    .attr('cy', 200)
    .attr('cx', d => d.distance)
    .attr('r', d => d.radius)
    .attr('fill', d => d.fill);

  // append enter selection with data into DOM
  circs.enter()
    .append('circle')
    .attr('cy', 200)
    .attr('cx', d => d.distance)
    .attr('r', d => d.radius)
    .attr('fill', d => d.fill);
})