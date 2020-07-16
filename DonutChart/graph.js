const dims = {
  height: 300,
  width: 300,
  radius: 150
}

const center = {
  x: (dims.width / 2 + 5),
  y: (dims.height / 2 + 5)
}

const svg = d3.select('.canvas').append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150)

const graph = svg.append('g')
  .attr('transform', `translate(${center.x}, ${center.y})`)

const pie = d3.pie()
  .sort(null)
  .value(data => data.cost)


const arcPath = d3.arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2)

const color = d3.scaleOrdinal(d3['schemeSet3'])

const legendGroup = svg.append('g')
  .attr('transform', `translate(${dims.width + 40}, 10)`)

const legend = d3.legendColor()
  .shape('circle')
  .shapePadding(10)
  .scale(color)

const add = (data) => {
  // update color scale domain
  color.domain(data.map(item => item.name))

  // update legend
  legendGroup.call(legend)
  legendGroup.selectAll('text')
    .attr('fill', 'white')


  // join pied data to DOM
  let paths = graph.selectAll('path')
    .data(pie(data))


  paths.attr('d', arcPath)
    .transition().duration(750)
    .attrTween('d', arcTweenUpdate)


  paths.enter()
    .append('path')
    .attr('class', 'arc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', ({ data }) => color(data.name))
    .each(function (data) {
      this._current = data
    })
    .transition().duration(750)
    .attrTween('d', arcTweenEnter)

}

const update = (data) => {
  // join pied data to DOM
  graph.selectAll('path')
    .each(function (data) {
      this._current = data
    })
    .data(pie(data))
    .attr('d', arcPath)
    .attr('fill', ({ data }) => color(data.name))
    .transition().duration(750)
    .attrTween('d', arcTweenUpdate)

}

const remove = (data) => {
  color.domain(data.map(item => item.name))

  // update legend
  legendGroup.call(legend)

  const paths = graph.selectAll('path')
    .data(pie(data))

  paths.exit()
    .transition().duration(750)
    .attrTween('d', arcTweenExit)
    .remove()

  paths.attr('d', arcPath)
    .attr('fill', ({ data }) => color(data.name))

}


// Data array and firestore
let data = []
let initialData = true;

// Listen to data
db.collection('expenses').onSnapshot(res => {
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

const arcTweenExit = data => {
  var interpolate = d3.interpolate(data.startAngle, data.endAngle)

  return function (t) {
    data.endAngle = interpolate(t)
    return arcPath(data)
  }
}

const arcTweenEnter = data => {
  var interpolate = d3.interpolate(data.endAngle, data.startAngle)

  return function (t) {
    data.startAngle = interpolate(t)
    return arcPath(data)
  }
}

function arcTweenUpdate(data) {
  var interpolate = d3.interpolate(this._current, data)

  this._current = interpolate(1)

  return function (t) {
    return arcPath(interpolate(t))
  }
}