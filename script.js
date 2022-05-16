
//                       -------------                loading data ---------- start
let store = {}

function loadData() {
    return Promise.all([
        d3.csv("Barna_etaria.csv"),
        d3.json("barriosBCN.json"),
    ]).then(datasets => {
        store.data = datasets[0];
        store.geoJSON = datasets[1]
        return store;
    })
}
//                       -------------                loading data ---------- end

//           -------------------- range input----------------------------------------start

let rangeInput = document.querySelectorAll('.range-input input'),
yearInput = document.querySelectorAll('.age-input input'),
progress = document.querySelector('.slider .progress');

let yearGap = 0

yearInput.forEach(input => {
	input.addEventListener('input', e => {
		let minVal = parseInt(yearInput[0].value),
		maxVal = parseInt(yearInput[1].value);

		if((maxVal - minVal >= yearGap) && maxVal <= 100) {
			if(e.target.className === 'input-min') {
				rangeInput[0].value = minVal;
				progress.style.left = (minVal / rangeInput[0].max)*100 + '%';
			} else {
				rangeInput[1].value = maxVal;
				progress.style.right = 100 - (maxVal / rangeInput[1].max)*100 + '%';
			}
		}
	});
});

rangeInput.forEach(input => {
	input.addEventListener('input', e => {
		let minVal = parseInt(rangeInput[0].value),
		maxVal = parseInt(rangeInput[1].value);

		if(maxVal - minVal < yearGap) {
			if(e.target.className === 'range-min') {
				rangeInput[0].value = maxVal - yearGap;
			} else {
				rangeInput[1].value = minVal + yearGap;

			}
			

		} else {
			yearInput[0].value = minVal
			yearInput[1].value = maxVal
			progress.style.left = (minVal / rangeInput[0].max)*100 + '%';
			progress.style.right = 100 - (maxVal / rangeInput[1].max)*100 + '%';
		}
	});
});


//           -------------------- range input------------------------------------------end

//                       -------------                getting general info ---------- start
let telaWidth = document.documentElement.clientWidth;
let telaHeight = document.documentElement.clientHeight;

let headH = document.getElementById('head').clientHeight
let contH = document.getElementById('cont').clientHeight
let footH = document.getElementById('reference').clientHeight

let scrY = 0

let selected = ''

window.onscroll = function(){
	scrY = this.scrollY
}

let edatMin = yearInput[0]
let edatMax = yearInput[1]

let rangeMin = rangeInput[0]
let rangeMax = rangeInput[1]

let radioH = document.getElementById('h')
let radioM = document.getElementById('m')
let radioA = document.getElementById('a')

let ele = document.getElementsByName('sexo');

radioA.onclick = function() {
	draw()
}

radioH.onclick = function() {
	draw()
}

radioM.onclick = function() {
	draw()
}

edatMin.onclick = function() {
	draw()
}

edatMax.onclick = function() {
	draw()
}

rangeMin.onclick = function() {
	draw()
}

rangeMax.onclick = function() {
	draw()
}

function getRadioValue() {
	
	for(i = 0; i < ele.length; i++) {
		if (ele[i].checked) {
			return ele[i].value
		}
	}
}

//                  ------------------      Data filtering   -----------start

let pirBcnM = []
let pirBcnH = []

let listBarrisValues = []

function filterData() {

	let totPop = d3.sum(store.data, d => {return (d.Nombre)})
	let dataM = store.data.filter(d => {return d.Sexe == 'Dones'})
	let dataH = store.data.filter(d => {return d.Sexe == 'Homes'})

	for(let i = 0; i < 20; i++) {
		let val = dataM.filter(d => {return +d.Edat >= 5*i && d.Edat < 5*(i+1)});
		let sum = d3.sum(val, d => {return (d.Nombre)});
		let block = {}
		if (i == 19) {
			block = {franja: `${5*i}+`, valor: sum, pct:Number((100*sum/totPop).toFixed(2))};
		} else {
			block = {franja: `${5*i}-${5*(i+1) -1}`, valor: sum, pct:Number((100*sum/totPop).toFixed(2))};
		}
		pirBcnM.push(block)
	}

	for(let i = 0; i < 20; i++) {
		let val = dataH.filter(d => {return +d.Edat >= 5*i && d.Edat < 5*(i+1)});
		let sum = d3.sum(val, d => {return (d.Nombre)});
		let block = {}
		if (i == 19) {
			block = {franja: `${5*i}+`, valor: sum, pct:Number((100*sum/totPop).toFixed(2))};
		} else {
			block = {franja: `${5*i}-${5*(i+1) -1}`, valor: sum, pct:Number((100*sum/totPop).toFixed(2))};
		}
		pirBcnH.push(block)
	}

	let listByEdat = store.data.filter(d => {return +d.Edat >= edatMin.value && +d.Edat <= edatMax.value})

	let listByEdatiSexe = []

	let gendBtn = getRadioValue()

	if (gendBtn == 'h') {
		listByEdatiSexe = listByEdat.filter(d => {return d.Sexe == 'Homes'})
	} else if (gendBtn == 'm') {
		listByEdatiSexe = listByEdat.filter(d => {return d.Sexe == 'Dones'})
	} else {
		listByEdatiSexe = listByEdat
	}
	
	let barriosList = ['el Raval', 'el Barri Gòtic', 'la Barceloneta',
       'Sant Pere, Santa Caterina i la Ribera', 'el Fort Pienc',
       'la Sagrada Família', "la Dreta de l'Eixample",
       "l'Antiga Esquerra de l'Eixample",
       "la Nova Esquerra de l'Eixample", 'Sant Antoni', 'el Poble Sec',
       'la Marina del Prat Vermell', 'la Marina de Port',
       'la Font de la Guatlla', 'Hostafrancs', 'la Bordeta',
       'Sants - Badal', 'Sants', 'les Corts',
       'la Maternitat i Sant Ramon', 'Pedralbes',
       'Vallvidrera, el Tibidabo i les Planes', 'Sarrià',
       'les Tres Torres', 'Sant Gervasi - la Bonanova',
       'Sant Gervasi - Galvany', 'el Putxet i el Farró',
       'Vallcarca i els Penitents', 'el Coll', 'la Salut',
       'la Vila de Gràcia', "el Camp d'en Grassot i Gràcia Nova",
       'el Baix Guinardó', 'Can Baró', 'el Guinardó',
       "la Font d'en Fargues", 'el Carmel', 'la Teixonera',
       'Sant Genís dels Agudells', 'Montbau', "la Vall d'Hebron",
       'la Clota', 'Horta', 'Vilapicina i la Torre Llobeta', 'Porta',
       'el Turó de la Peira', 'Can Peguera', 'la Guineueta', 'Canyelles',
       'les Roquetes', 'Verdun', 'la Prosperitat', 'la Trinitat Nova',
       'Torre Baró', 'Ciutat Meridiana', 'Vallbona', 'la Trinitat Vella',
       'Baró de Viver', 'el Bon Pastor', 'Sant Andreu', 'la Sagrera',
       'el Congrés i els Indians', 'Navas', "el Camp de l'Arpa del Clot",
       'el Clot', 'el Parc i la Llacuna del Poblenou',
       'la Vila Olímpica del Poblenou', 'el Poblenou',
       'Diagonal Mar i el Front Marítim del Poblenou',
       'el Besòs i el Maresme', 'Provençals del Poblenou',
       'Sant Martí de Provençals', 'la Verneda i la Pau'];

    listBarrisValues = []

    for(w in barriosList) {
    	let filteredList = listByEdatiSexe.filter(d => {return d.Nom_Barri == barriosList[w]})
    	let nombre = d3.sum(filteredList, d=> {return d.Nombre})
    	let totBarri = store.data.filter(d => {return d.Nom_Barri == barriosList[w]})
    	let popBarri = d3.sum(totBarri, d => {return d.Nombre})

    	let insert = {Barri:barriosList[w], Pct:(100*nombre/popBarri).toFixed(2), Nombre:nombre, Pop:popBarri}

    	listBarrisValues.push(insert)
    }


}


//                  ------------------      Data filtering   -------------end

//                       -------------                tootl tip ---------- start

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
//                       -------------                tootl tip ---------- end

//                 --------------------     Draw Map         ---------------start

let Mwidth = telaWidth*0.6
let Mheight = telaHeight - (headH + footH + 30)
console.log(telaHeight)
console.log(headH)
console.log(footH)
console.log(Mheight)


let Mcont = d3.select('#map')
Mcont.attr('width', Mwidth).attr('height', Mheight)

let proj = d3.geoNaturalEarth1()
proj
	.scale(telaWidth*135)
	.center([2.164007, 41.391205])
	.translate([Mwidth/2, Mheight/2])

function getValue(barri){
	for (w in listBarrisValues){
		if (listBarrisValues[w]['Barri'] === barri){
		return listBarrisValues[w]['Pct']}
	}
}

function drawMap() {
	let path = d3.geoPath(proj)

	let mJoin = Mcont.selectAll('path').data(store.geoJSON.features)

	let colorMin = d3.min(listBarrisValues, d=>{return +d.Pct})
	let colorMax = d3.max(listBarrisValues, d=>{return +d.Pct})

	let colorScale = d3.scaleSequential()
		.domain([colorMin, colorMax])
		.interpolator(d3.interpolateBlues)

	mJoin.enter().append('path')
		.attr('d', d=> {return path(d)})
		.attr('stroke', '#808080')
		.attr('fill', function(d) {
			return colorScale(getValue(d.properties.NOM))
		})
		.on('mouseenter',  function(d){
					showTooltip(getValue(d.properties.NOM), d.properties.NOM, [d3.event.clientX, d3.event.clientY])
					d3.select(this).attr('stroke-width', 3)
				})
		.on('mouseleave', function(d){
			d3.select('#tooltip')
				.style('display', 'none')
			d3.select(this).attr('stroke-width', 1)
		})
		.on('click', function(d) {
			selected = d.properties.NOM
			drawPiramid(d.properties.NOM)			
	})

	mJoin.attr('fill', function(d) {
			return colorScale(getValue(d.properties.NOM))
		})

	//legend

	d3.select('.legGroup').remove()

	let legGroup = Mcont.append('g').attr('class', 'legGroup')
		.style('transform', `translate(${Mwidth - 100}px, 50px)`)

	let linGTot = legGroup.append('defs').append('linearGradient')

	linGTot.attr('id', 'gradT')
		.attr('x1', '0')
		.attr('y1', '1')
		.attr('x2', '0')
		.attr('y2', '0')

	linGTot.append('stop')
		.attr('offset', '0%')
		.attr('style', 'stop-color:rgb(247, 251, 255);')

	linGTot.append('stop')
		.attr('offset', '20%')
		.attr('style', 'stop-color:rgb(207, 225, 242);')

	linGTot.append('stop')
		.attr('offset', '40%')
		.attr('style', 'stop-color:rgb(147, 195, 223);')

	linGTot.append('stop')
		.attr('offset', '60%')
		.attr('style', 'stop-color:rgb(75, 151, 201);')

	linGTot.append('stop')
		.attr('offset', '80%')
		.attr('style', 'stop-color:rgb(17, 90, 162);')

	linGTot.append('stop')
		.attr('offset', '100%')
		.attr('style', 'stop-color:rgb(8, 48, 107);')

	legGroup.append('rect')
		.attr('width', 15)
		.attr('height', 210)
		.attr('fill', 'url(#gradT)')
		.attr('stroke', '#808080')

	legGroup.append('text')
		.attr('x', 20)
		.attr('y', 6)
		.attr('font-size', '15px')
		.text(`${colorMax}%`)

	legGroup.append('text')
		.attr('x', 20)
		.attr('y', 216)
		.attr('font-size', '15px')
		.text(`${colorMin}%`)
}



//                 --------------------     Draw Map         -----------------end

//                -----------------------  Draw piramid           ------------start

let Gwidth = telaWidth*0.35
let Gheight = telaHeight - (headH + footH + contH + 75)

let GMargin = {
	top: 10,
	bottom: 120,
	left: 40,
	right: 15
}

let bodyWidth = Gwidth - GMargin.left - GMargin.right
let bodyHeight = Gheight - GMargin.top - GMargin.bottom

function drawPiramid(barrio = 'el Raval') {

	d3.select('.pirC').remove()

	let Chart = d3.select('#piramid')
	Chart.attr('width', Gwidth).attr('height', Gheight)

	let pirC = Chart.append('g').attr('class', 'pirC')

	// filtrando datos por barrio

	let pirBarriM = []
	let pirBarriH = []

	

	let listByBarri = store.data.filter(d=> {return d.Nom_Barri == barrio})

	let barriPop = d3.sum(listByBarri, d => {return (d.Nombre)})
	let dataBarriM = listByBarri.filter(d => {return d.Sexe == 'Dones'})
	let dataBarriH = listByBarri.filter(d => {return d.Sexe == 'Homes'})

	for(let i = 0; i < 20; i++) {
		let val = dataBarriM.filter(d => {return +d.Edat >= 5*i && d.Edat < 5*(i+1)});
		let sum = d3.sum(val, d => {return (d.Nombre)});
		let block = {}
		if (i == 19) {
			block = {franja: `${5*i}+`, valor: sum, pct:Number((100*sum/barriPop).toFixed(2))};
		} else {
			block = {franja: `${5*i}-${5*(i+1) -1}`, valor: sum, pct:Number((100*sum/barriPop).toFixed(2))};
		}
		pirBarriM.push(block)
	}

	for(let i = 0; i < 20; i++) {
		let val = dataBarriH.filter(d => {return +d.Edat >= 5*i && d.Edat < 5*(i+1)});
		let sum = d3.sum(val, d => {return (d.Nombre)});
		let block = {}
		if (i == 19) {
			block = {franja: `${5*i}+`, valor: sum, pct:Number((100*sum/barriPop).toFixed(2))};
		} else {
			block = {franja: `${5*i}-${5*(i+1) -1}`, valor: sum, pct:Number((100*sum/barriPop).toFixed(2))};
		}
		pirBarriH.push(block)
	}

	//defining scales

	let maxX = 10


	let yScale = d3.scaleBand()
		.range([bodyHeight, 0])
		.domain(pirBcnH.map(a => a.franja))
		.padding(0.1)

	let xScale = d3.scaleLinear()
		.range([0, 0.9*bodyWidth/2])
		.domain([0, maxX])

	let xScale2 = d3.scaleLinear()
		.range([0, 0.9*bodyWidth/2])
		.domain([maxX, 0])

	let gridY = d3.axisLeft(yScale)
		.tickFormat('')
		.tickSize(-bodyWidth)
	pirC.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)
		.attr('class', 'grid')
		.call(gridY)

	let gridX = d3.axisBottom(xScale)
		.tickFormat('')
		.tickSize(-bodyHeight)
	pirC.append('g')
		.style('transform', `translate(${GMargin.left + bodyWidth/2}px, ${bodyHeight + GMargin.top}px)`)
		.attr('class', 'grid')
		.call(gridX)

	let gridX2 = d3.axisBottom(xScale2)
		.tickFormat('')
		.tickSize(-bodyHeight)
	pirC.append('g')
		.style('transform', `translate(${GMargin.left + bodyWidth*0.05}px, ${bodyHeight + GMargin.top}px)`)
		.attr('class', 'grid')
		.call(gridX2)

	let body = pirC.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)

	let barM = body.selectAll('.barM').data(pirBcnM)

	barM.enter()
		.append('rect')
		.attr('width', d => xScale(d.pct))
		.attr('height', yScale.bandwidth()/2)
		.attr('x', bodyWidth/2)
		.attr('y', d=> yScale(d.franja))
		.attr('fill', '#764531')

	let barH = body.selectAll('.barH').data(pirBcnH)

	barH.enter()
		.append('rect')
		.attr('width', d => xScale(d.pct))
		.attr('height', yScale.bandwidth()/2)
		.attr('x', d => bodyWidth/2 - xScale(d.pct))
		.attr('y', d=> yScale(d.franja))
		.attr('fill', '#41586A')

	let barBM = body.selectAll('.barBM').data(pirBarriM)

	barBM.enter()
		.append('rect')
		.attr('width', d => xScale(d.pct))
		.attr('height', yScale.bandwidth()/2)
		.attr('x', bodyWidth/2)
		.attr('y', d=> yScale(d.franja) + yScale.bandwidth()/2)
		.attr('fill', '#DF694D')

	let barBH = body.selectAll('.barBH').data(pirBarriH)

	barBH.enter()
		.append('rect')
		.attr('width', d => xScale(d.pct))
		.attr('height', yScale.bandwidth()/2)
		.attr('x', d => bodyWidth/2 - xScale(d.pct))
		.attr('y', d=> yScale(d.franja) + yScale.bandwidth()/2)
		.attr('fill', '#3B96CA')

	let axisX = d3.axisBottom(xScale)
		.tickFormat(d=>{return d.toFixed(1)+'%'})
	pirC.append('g')
		.style('transform', `translate(${GMargin.left + bodyWidth/2}px, ${bodyHeight + GMargin.top}px)`)
		.call(axisX)
		.selectAll('text')
		.style('text-anchor', 'end')
		.attr('dx', '-.8em')
		.attr('dy', '-.5em')
		.attr('transform', 'rotate(-90)')

	let axisX2 = d3.axisBottom(xScale2)
		.tickFormat(d=>{return d.toFixed(1)+'%'})
	pirC.append('g')
		.style('transform', `translate(${GMargin.left + bodyWidth*0.05}px, ${bodyHeight + GMargin.top}px)`)
		.call(axisX2)
		.selectAll('text')
		.style('text-anchor', 'end')
		.attr('dx', '-.8em')
		.attr('dy', '-.5em')
		.attr('transform', 'rotate(-90)')

	let axisY = d3.axisLeft(yScale)
	pirC.append('g')
		.style('transform', `translate(${GMargin.left}px, ${GMargin.top}px)`)
		.call(axisY)

	let legList =[{x:0, y:0, color:'#41586A'}, {x:0, y:20, color:'#3B96CA'}, {x:60, y:0, color:'#764531'}, {x:60, y:20, color:'#DF694D'}]

	let legGroup = pirC.append('g')
		.attr('class', 'legGroup')
		.style('transform', `translate(${Gwidth - 150}px, ${Gheight - 40}px)`)


	let leg = legGroup.selectAll('rect').data(legList)

	leg.enter()
		.append('rect')
		.attr('width', 55)
		.attr('height', yScale.bandwidth()/2)
		.attr('x', d => {return d.x})
		.attr('y', d => {return d.y})
		.attr('fill', d => {return d.color})

	let legListT = [{text:'Barcelona',x:-5, y:6, t:'15px'}, {text:barrio,x:-5, y:26, t:'15px'}, {text:'Hombres',x:50, y:-8, t:'12px'}, {text:'Mujeres',x:105, y:-8, t:'12px'}]

	let legT = legGroup.selectAll('text').data(legListT)

	legT.enter()
		.append('text')
		.style('text-anchor', 'end')
		.attr('y', d => {return d.y})
		.attr('x', d => {return d.x})
		.attr('font-size', d => {return d.t})
		.text(d=> {return d.text})

	if(!selected) {
		let rect = pirC.append('rect')
			.attr('width', `${Gwidth * 0.8}`)
			.attr('height', `${Gheight * 0.4}`)
			.attr('fill', 'rgba(255, 255, 255, 0.65)')
			.attr('x', `${Gwidth * 0.1}`)
			.attr('y', `${Gheight * 0.2}`)


		pirC.append('text')
			.attr('class', 'text-pir')
			.attr('x', '50%')
			.attr('y', '40%')
			.attr('text-anchor', 'middle')
			.text('¡haz clic en los barrios')

		pirC.append('text')
			.attr('class', 'text-pir')
			.attr('x', '50%')
			.attr('y', '45%')
			.attr('text-anchor', 'middle')
			.text('para ver su piramid de población!')
	}
}




//                -----------------------  Draw piramid           -------------end

function draw(){
	filterData()
	drawMap()
	drawPiramid()
}
    

loadData().then(draw);