let sample;
let data = [];
let staticArr = [];

let dim = {
    "width": 1000,
    "height": 1000,
    "margin": 50
};

let svg = d3.select("#chart1")
            .append("svg")
            .attrs(dim);
let g = svg.append("g");            

fetch("./sample.csv")
     .then(function(resp){
        return resp.text();
     })            
     .then(function(data){
        sample = $.csv.toArrays(data).slice(1);
        convtoArray(sample);
     });

function convtoArray(sample){
    sample.forEach(element => {
        data.push({
            date: d3.timeParse("%Y-%m-%d")(element[0]),
            price: parseFloat(element[1])
        })
    });

    staticArr = data;

   let var1 = 0;
   let var2 = 150;

   let intId = setInterval(sendDraw, 1000);

   function sendDraw() {
        if(var2 >= data.length) {
            clearInterval(intId);
        }

    draw(data.slice(0, var2));
    var1 = var2;
    var2 = var2 + 150;
   }

}     


let scaleX = d3.scaleTime()
                    .domain(d3.extent(data, function(d){
                        return d.date;
                    }))
                    .nice()
                    .range([dim.margin, dim.width-dim.margin]);

let axisX = svg.append('g')
                .attr('transform', `translate(0, ${dim.height - dim.margin})`)
                .call(d3.axisBottom(scaleX));                    


let scaleY = d3.scaleLinear()
                .domain([0, d3.max(data, function(d){
                    return d.price
                })])        
                .nice()
                .range([dim.height-dim.margin, dim.margin]);

let axisY = svg.append('g')
                .attr('transform', `translate(${dim.margin + 15}, 0)`)
               .call(d3.axisLeft(scaleY));


let line = d3.line()
              .x(d => scaleX(d.date))
              .y(d => scaleY(d.price));





function draw(data) {
    let t = d3.transition().duration(1000);


    scaleX.domain(d3.extent(data, function(d){
        return d.date;
    }))
    .nice();

    axisX   
        .transition(t)
        .call(d3.axisBottom(scaleX)
        .tickFormat(d3.timeFormat("%d-%m-%Y"))
        .ticks(15))
        .selectAll("text")
            .style("text-anchor", "left")
            .attr("font-size", "1.2rem")
            .attr("transform", "rotate(-45)");

scaleY.domain([0, d3.max(staticArr, function(d){
            return d.price;
            })])
            .nice();
  
axisY.transition(t)
            .call(d3.axisLeft(scaleY))
            .selectAll("text")
            .attr("font-size", "1.2rem");

function update(data) {
     
    let group = g.selectAll("path")
                  .data(data, (d) => d.date)
                  .join(
                    function(enter){
                        return enter.append("path")
                                    .attrs({
                                        'fill': 'red',
                                        'stroke': 'black',
                                        'stroke-width':'1px',
                                        'd':line(data)   
                                    })
                    },
                    function(update){
                            return update;
                    },
                    function(exit){
                        return exit.call(path => path.transition().duration(1000).attr("d", line(data)));
                    }                
                  )
                  .call(path => path.transition().duration(5).attr("d", area(data)));

}
       
update(data);

}
