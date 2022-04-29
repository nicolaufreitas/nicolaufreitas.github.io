let store = {}

    function loadData() {
        return Promise.all([
            d3.csv("Women_in_Parliament.csv"),
            d3.json("countries.geo.json"),
        ]).then(datasets => {
            store.wip = datasets[0];
            store.geoJSON = datasets[1]
            return store;
        })
    }

let telaWidth = document.documentElement.clientWidth;

//   ----   coger info del selector de año

let selectedYear = document.getElementById('yearSel')

let scrY = 0

window.onscroll = function(){
	scrY = this.scrollY
}

selectedYear.onclick = function(){
	draw()
}

let worldValue = 0
let wipYear = {}
let minValue = 0
let maxValue = 0
let incA = 0
let incB = 0
let totD = 0

function filterData(){

	let TotRows = store.wip.filter(function(d){
		return d.Region == 'Total'
	});

	let SYear = TotRows.filter(function(d){
		return d.Year == selectedYear.value
	})

	worldValue = Number(SYear[0]['Value'])

	wipYear = store.wip.filter(function(d){
		return d.Year == selectedYear.value
	})

	minValue = d3.min(wipYear, d =>{
		return +d.Value
	})

	maxValue = d3.max(wipYear, d =>{
		return +d.Value
	})

	incA = (worldValue - minValue)/5
	incB = (maxValue - worldValue)/5

	totD = store.wip.filter(d=>{
		return d.Region == 'Total'
	})

}

// draw linechart

let selectedCountry = 0


// tooltip function

function showTooltip(value, country, position){
	let tt =d3.select('#tooltip')
	tt.style('top', `${position[1] + scrY}px`)
	.style('left', `${position[0]}px`)
	.style('display', 'block')

	tt.select('h4').text(country)
	if(value){
		tt.select('p').text(value+'%')
	}else{
		tt.select('p').text('-')
	}
}


//   -----   Configuraciones del mapa



let Mwidth = telaWidth -100
let Mheight = telaWidth*0.4
let Lheight = 250

let Mcont = d3.select('#map')
Mcont.attr('width', Mwidth).attr('height', Mheight)

let proj = d3.geoNaturalEarth1()
proj.scale(telaWidth/7).translate([Mwidth/2 -80, Mheight/2 + 0.075*Mheight])


//   -----   Function to get value from dataset based on country



//   ----   Dibujar mapa

function DrawMap(){
	let path = d3.geoPath(proj)

	colDom = [minValue, (minValue + incA), (minValue + 2*incA), (minValue + 3*incA), (minValue + 4*incA), worldValue, (worldValue + incB),
		(worldValue + 2*incB), (worldValue + 3*incB), (worldValue + 4*incB), maxValue]


	let colorScale = d3.scaleLinear()
		.domain(colDom)
		.range(['#543005','#8c510a','#bf812d','#dfc27d','#f6e8c3','#f5f5f5','#c7eae5','#80cdc1','#35978f','#01665e','#003c30'])


	function getValue(country){
		for (w in wipYear){
			if (wipYear[w]['Region'] === country){
			return wipYear[w]['Value']}

		}
	}
	

	let mJoin = Mcont.selectAll('path').data(store.geoJSON.features)

	mJoin.enter().append('path')
		.attr('d', d=> {if(d.properties.name!='Antarctica'){return path(d)}})
		.attr('stroke', '#808080')
		.on('mouseenter',  function(d){
					showTooltip(getValue(d.properties.name), d.properties.name, [d3.event.clientX, d3.event.clientY])
					d3.select(this).attr('stroke-width', 3)
				})
		.attr('fill', function(d){
			return colorScale(getValue(d.properties.name))
		})
		.on('click', d=>{
			drawLC(d.properties.name)
		})
		.on('mouseleave', function(d){
			d3.select('#tooltip')
				.style('display', 'none')
			d3.select(this).attr('stroke-width', 1)
		})

	mJoin.attr('fill', function(d){
			return colorScale(getValue(d.properties.name))
		})

	d3.select('.legGroup').remove()

	let colLeg = Mcont.append('g')
		.attr('class', 'legGroup')
		.style('transform', `translate(${Mwidth - 120}px, 50px)`)

	legScale = d3.scaleLinear()
		.domain([maxValue, 0])
		.range([0, 200])

	// ----------gradients -----------


	let linGTot = colLeg.append('defs').append('linearGradient')

	linGTot.attr('id', 'gradT')
		.attr('x1', '0')
		.attr('y1', '1')
		.attr('x2', '0')
		.attr('y2', '0')

	linGTot.append('stop')
		.attr('offset', '0%')
		.attr('style', 'stop-color:rgb(84,48,5);')

	linGTot.append('stop')
		.attr('offset', `${incA/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(140,81,10);')

	linGTot.append('stop')
		.attr('offset', `${2*incA/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(191,129,45);')

	linGTot.append('stop')
		.attr('offset', `${3*incA/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(223,194,125);')

	linGTot.append('stop')
		.attr('offset', `${4*incA/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(246,232,195);')

	linGTot.append('stop')
		.attr('offset', `${5*incA/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(245,245,245);')

	linGTot.append('stop')
		.attr('offset', `${(5*incA + incB)/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(199,234,229);')

	linGTot.append('stop')
		.attr('offset', `${(5*incA + 2*incB)/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(128,205,193);')

	linGTot.append('stop')
		.attr('offset', `${(5*incA + 3*incB)/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(53,151,143);')

	linGTot.append('stop')
		.attr('offset', `${(5*incA + 4*incB)/(maxValue-minValue)*100}%`)
		.attr('style', 'stop-color:rgb(1,102,94);')

	linGTot.append('stop')
		.attr('offset', '100%')
		.attr('style', 'stop-color:rgb(0,60,48);')

	

	keyList = [
	{position:0, name:minValue+'%'},
	{position:5*incA, name:worldValue + '% (media)'},
	{position:5*incA + 5*incB, name:maxValue+'%'},
	]	

	
	let LegT = colLeg.append('rect')
		.attr('width', 20)
		.attr('height', 200)
		.attr('fill', 'url(#gradT')

	let LegTJoin = colLeg.selectAll('text').data(keyList)

	LegTJoin.enter().append('text')
		.attr('x', 25)
		.attr('y', d=>{return legScale(d.position) + 5})
		.text(d=>{return d.name})



}

function drawLC(country){
	let cdf = store.wip.filter(d=>{
			return d.Region == country})


	d3.select('.lineG').remove()



	lineChart = d3.select('#line')
	lineChart.attr('width', Mwidth).attr('height', Lheight)

	let Chart = lineChart.append('g').attr('class', 'lineG')



	let GMargin = {
		top: 20,
		bottom: 30,
		left: 40,
		right: 200
	}



	let bodyWidth =Mwidth - GMargin.left - GMargin.right
	let bodyHeigth = Lheight - GMargin.top - GMargin.bottom


	let maxY1 = d3.max(totD, d=>{return +d.Value})
	let maxY2 = d3.max(cdf, d=>{return +d.Value})
	
	let maxY = 0

	if(maxY2){
		if(maxY1>maxY2){maxY=maxY1}else{maxY=maxY2};
	}else{maxY=maxY1}


	let xScale = d3.scaleTime()
		.range([0, bodyWidth])
		.domain([2000, 2021])

	let yScale = d3.scaleLinear()
		.range([0, bodyHeigth])
		.domain([maxY, 0])

	let bodyT = Chart.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)

	let bodyS = Chart.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)

	let text = Chart.append('g')
		.style('transform', `translate(${Mwidth/2 - 150}px, ${Lheight/2 - 5}px)`)

	let Legend = Chart.append('g')
		.style('transform', `translate(${Mwidth - 190}px, ${Lheight - 100}px)`)

	if(!country){

		text.append('text')
			.text('Haz clic en los países para ver su histórico')
			.attr('fill', 'gray')
	}

	let lineGen = d3.line()
		.x(d => xScale(d.Year))
		.y(d => yScale(d.Value))

	bodyT.append('path')
		.datum(totD)
		.attr('d', lineGen)
		.attr('class', 'linTot')
		.attr('stroke-width', 2.5)

	bodyS.append('path')
		.datum(cdf)
		.attr('d', lineGen)
		.attr('class', 'linS')
		.attr('stroke-width', 2.5)

	Legend.append('line')
		.attr('x1', 10)
		.attr('y1', 15)
		.attr('x2', 110)
		.attr('y2', 15)
		.attr('class', 'linTot')
		.attr('stroke-width', 2.5)

	Legend.append('text')
		.attr('x', 10)
		.attr('y', 5)
		.text('Media mundial')

	if(country){
		Legend.append('line')
			.attr('x1', 10)
			.attr('y1', 70)
			.attr('x2', 110)
			.attr('y2', 70)
			.attr('class', 'linS')
			.attr('stroke-width', 2.5)

		Legend.append('text')
			.attr('x', 10)
			.attr('y', 60)
			.text(country)
		}




	let axisX = d3.axisBottom(xScale)
	.tickFormat(d3.format('.0f'))

	Chart.append('g')
		.style('transform', `translate(${GMargin.left}px, ${bodyHeigth + GMargin.top}px)`)
		.call(axisX)


	let axisY = d3.axisLeft(yScale)
	.tickFormat(d=>{return d+'%'})

	Chart.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)
		.call(axisY)
}



function draw(){
	filterData()
	DrawMap()
	drawLC()
}
    

loadData().then(draw);