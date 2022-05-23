//                       -------------                loading data ---------- start
let store = {}

function loadData() {
    return Promise.all([
        d3.csv("miserables-nodes.csv"),
        d3.csv("miserables-links.csv")
    ]).then(datasets => {
        store.nodes = datasets[0];
        store.links = datasets[1]
        return store;
    })
}
//                       -------------                loading data ---------- end

//                       -------------                getting general info ---------- start
let telaWidth = document.documentElement.clientWidth;
let telaHeight = document.documentElement.clientHeight;

let notaIn = document.getElementById('notaInicial')
let entBtn = document.getElementById('entendido')
let section = document.getElementById('section')
let header = document.getElementById('header')

entBtn.onclick = function() {
	notaIn.remove()
}

notaIn.style.top = (section.clientHeight - notaIn.clientHeight)/2 + 'px'

let scrY = 0

window.onscroll = function(){
	scrY = this.scrollY
}
//                       -------------                getting general info ----------   end

//                       ------------------------------drawing graph  ------------------------- start

let Gwidth = telaHeight
let Gheight = telaHeight

let graph = d3.select('#graph')
	.attr('width', Gwidth)
	.attr('height', Gheight)

let nodesG = graph.append('g').attr('class', 'nodes')

let graph2 = d3.select('#graph02')
	.attr('width', Gwidth)
	.attr('height', Gheight)

let angleScale = d3.scaleLinear()
	.range([-Math.PI, Math.PI])
	.domain([0, 77])

let radNodes = Gheight*0.3

//esta función coge dos variables que son la fuente y el alvo de la linea que une dos pensadores y retorna el camino
//'d' para el path generando una spline con los puntos de control hacia el centro
function splGen(src, tgt) {
	let difAngle = 0
	if((angleScale(src) > 0 && angleScale(tgt) < 0) || (angleScale(src) < 0 && angleScale(tgt) > 0)) {
		if (Math.abs( Math.abs(angleScale(src)) + Math.abs(angleScale(tgt)) ) > 3.14) {
			difAngle = 6.28 - Math.abs( Math.abs(angleScale(src)) + Math.abs(angleScale(tgt)) )
		} else {
			difAngle = Math.abs( Math.abs(angleScale(src)) + Math.abs(angleScale(tgt)) )
		}
	} else {
		difAngle = Math.abs( Math.abs(angleScale(src)) - Math.abs(angleScale(tgt)) )
	}
	let radScale = d3.scaleLinear()
		.domain([0, 3.14])
		.range([0.75, 0])

	let radInt = radNodes*0.5

	let sx = Math.sin(angleScale(src))*radNodes + Gwidth/2
	let sy = -Math.cos(angleScale(src))*radNodes + Gheight/2
	let csx = Math.sin(angleScale(src))*radScale(difAngle)*radNodes + Gwidth/2
	let csy = -Math.cos(angleScale(src))*radScale(difAngle)*radNodes + Gheight/2

	let tx = Math.sin(angleScale(tgt))*radNodes + Gwidth/2
	let ty = -Math.cos(angleScale(tgt))*radNodes + Gheight/2
	let ctx = Math.sin(angleScale(tgt))*radScale(difAngle)*radNodes + Gwidth/2
	let cty = -Math.cos(angleScale(tgt))*radScale(difAngle)*radNodes + Gheight/2		
	
	let splPath = `M ${sx} ${sy} C ${csx} ${csy} ${ctx} ${cty} ${tx} ${ty}`
	return splPath
}

let colorScale = d3.scaleSequential()
	.domain([0, 76])
	.interpolator(d3.interpolateWarm)

let tt01 = document.getElementById('tt01')

function showTT01(info, position) {
	let tt01 = d3.select('#tt01')

	tt01.style('top', `${position[1] - header.clientHeight + scrY}px`)
	.style('left', `${position[0]}px`)
	.style('display', 'block')

	tt01.select('#tt01txt')
		.text(info)
}

let colorList = []

//esta funcion crea los nudos y links para en seguida aplicar las fuerzar que determina sus posiciones
function createElements(nds, lks){
	let maxW = d3.max(store.links, d => d.value)
	let minW = d3.min(store.links, d => d.value)

	let widthScale = d3.scaleLinear()
		.domain([minW, maxW])
		.range([1, 5])

	links = graph2.append('g')
		.attr('class', 'linksX')
		.selectAll('line').data(lks)

	links.enter()
		.append('line')
		.attr('stroke', 'lightgray')
		.attr('stroke-width', d => widthScale(d.value))
		.attr('class', d => {return `s${d.source}t${d.target}`})

	linksSel = graph2.append('g')
		.attr('class', 'linksSel')

	nodes = graph2.append('g')
		.attr('class', 'nodesX')
		.selectAll('circles').data(nds)

	nodes.enter()
		.append('circle')
		.attr('r', 10)
		.attr('fill', d=> {
			let nc = {id:d.id, color:colorScale(d.id)}
			colorList.push(nc)
			return colorScale(d.id)
		})
		.attr('class', d => {return `p${d.id}`})
		.on('mouseenter', d => {
			showTT01(d.label, [d3.event.clientX, d3.event.clientY])
			d3.select('.nodes').selectAll('text').attr('fill', 'lightgray')
			let selPerso = d3.select(`.perso${d.id}`).attr('fill', 'blue').attr('font-weight', 'bolder')
		})
		.on('mouseleave', d => {
			d3.select('#tt01')
				.style('display', 'none')
			d3.select('.nodes').selectAll('text').attr('fill', 'black').attr('font-weight','normal')
		})
}

//esta función actualiza la posición de los nudos y links segun las fuerzas aplicadas
function updateElements(){
	d3.select('.nodesX')
		.selectAll('circle')
		.attr('cx', d=> d.x)
		.attr('cy', d=> d.y)

	d3.select('.linksX')
		.selectAll('line')
		.attr('x1', d=> d.source.x)
		.attr('x2', d=> d.target.x)
		.attr('y1', d=> d.source.y)
		.attr('y2', d=> d.target.y)
}
//esta función dibuja solamente los links conectados al nudo seleccionado
function drawSelectedLinks(list){
	d3.select('.linksStressed').remove()

	let selLinksS = linksSel.append('g').attr('class', 'linksStressed')

	selLinksS.selectAll('line').data(list)
		.enter()
		.append('line')
		.attr('x1', d => {return d3.select(`.${d}`).attr('x1')})
		.attr('y1', d => {return d3.select(`.${d}`).attr('y1')})
		.attr('x2', d => {return d3.select(`.${d}`).attr('x2')})
		.attr('y2', d => {return d3.select(`.${d}`).attr('y2')})
		.attr('stroke', 'black')
		.attr('stroke-width', d => {return d3.select(`.${d}`).attr('stroke-width')})


}
//esta función dibuja el grafico de la derecha. Llama las funciones de generar nudos y links, aplica las furezas para determinar las posiciones y actualiza las posiciones 
function showData(nds, lks){
	createElements(nds, lks)

	let simulation = d3.forceSimulation()
		.force('link', d3.forceLink().id( (d) => d.id).distance(30))
		.force('charge', d3.forceManyBody().strength(-50))
		.force('center', d3.forceCenter(Gwidth/2, Gheight/2))
		.force('colision', d3.forceCollide().radius(20))
	
	simulation.nodes(nds)
		.on('tick', updateElements)
	simulation.force('link').links(lks)
}

let sLinks = []
let tLinks = []

function selLinks(id) {
	sLinks = store.links.filter(function(d){
		return d.source.id == id
	})

	tLinks = store.links.filter(function(d){
		return d.target.id == id
	})
}
//esta función dibuja el grafico circular
function drawGraph() {

	let maxW = d3.max(store.links, d => d.value)
	let minW = d3.min(store.links, d => d.value)

	let widthScale = d3.scaleLinear()
		.domain([minW, maxW])
		.range([1, 5])

	function drawLinks() {
		d3.select('.links').remove()

		let linksG = graph.append('g').attr('class', 'links')

		let links = linksG.selectAll('path')

		links.data(store.links)
			.enter()
			.append('path')
			.attr('d', d => {return splGen(d.source.id, d.target.id)})
			.attr('stroke', d => {return colorScale(d.source.id)})
			.attr('class','linLinks')
			.attr('stroke-width', d => widthScale(d.value))
	}
	drawLinks()

	function drawLinksSel(data) {
		let linksGS = graph.append('g').attr('class', 'linksS')

		let links = linksGS.selectAll('path')

		links.data(data)
			.enter()
			.append('path')
			.attr('d', d => {return splGen(d.source.id, d.target.id)})
			.attr('stroke', 'blue')
			.attr('class','linLinks')
			.attr('stroke-width', d => widthScale(d.value))
	}

	let nodes = nodesG.selectAll('text')

	nodes.data(store.nodes)
		.enter()
		.append('text')
		.attr('x', d => {return Math.sin(angleScale(d.id))*radNodes + Gwidth/2})
		.attr('y', d => {return -Math.cos(angleScale(d.id))*radNodes + Gheight/2})
		.text(d => d.label)
		.attr('transform',  d => {
			let angle = 0
			if(angleScale(d.id) < 0){
				angle = angleScale(d.id)*180/Math.PI + 90
			} else {
				angle = angleScale(d.id)*180/Math.PI - 90
			}
			return `rotate(${angle},
			${Math.sin(angleScale(d.id))*radNodes + Gwidth/2},
			${-Math.cos(angleScale(d.id))*radNodes + Gheight/2})`})
		.attr('font-family', 'sans-serif')
		.attr('font-size', '16px')
		.attr('fill', 'black')
		.attr('text-anchor', d => {
			let anch = 'start'
			if(angleScale(d.id) < 0) {
				anch = 'end'
			} return anch
			})
		.attr('dominant-baseline', 'central')
		.attr('class', d => {return `perso${d.id}`})
		.on('mouseenter', d => {
			d3.select('.links')
				.selectAll('path')
				.attr('stroke', 'lightgray')
			selLinks(d.id)
			drawLinksSel(sLinks)
			drawLinksSel(tLinks)
			let selLinksList = []
			for(w in sLinks) {
				let l = `s${sLinks[w].source.id}t${sLinks[w].target.id}`
				selLinksList.push(l)
			}
			for(w in tLinks) {
				let l = `s${tLinks[w].source.id}t${tLinks[w].target.id}`
				selLinksList.push(l)
			}
			for(w in selLinksList) {
				d3.select(`.${selLinksList[w]}`).attr('stroke', 'black')
			}
			let conList= []
			for(w in selLinksList) {
				let x = selLinksList[w]
				x = x.replace(d.id, '')
				x = x.replace('s', '')
				x = x.replace('t', '')
				conList.push(x)
			}		
			d3.select('.nodesX').selectAll('circle').attr('fill', 'lightgray')
			d3.select(`.p${d.id}`).attr('fill', d => {
				for(w in colorList){
					if(colorList[w].id == d.id) {
						return colorList[w].color
					}
				}
			})
			for (w in conList) {
				d3.select(`.p${conList[w]}`).attr('fill', 'black')
			}
			drawSelectedLinks(selLinksList)
		})
		.on('mouseleave', d => {
			drawLinks()
			d3.selectAll('.linksS').remove()
			selLinks(d.id)
			let selLinksList = []
			for(w in sLinks) {
				let l = `s${sLinks[w].source.id}t${sLinks[w].target.id}`
				selLinksList.push(l)
			}
			for(w in tLinks) {
				let l = `s${tLinks[w].source.id}t${tLinks[w].target.id}`
				selLinksList.push(l)
			}

			for(w in selLinksList) {
				d3.select(`.${selLinksList[w]}`).attr('stroke', 'lightgray')
			}
			d3.select('.linksStressed').remove()
			for(w in colorList) {
				d3.select(`.p${colorList[w].id}`).attr('fill', colorList[w].color)
			}
		})
		
}

//                       ------------------------------drawing graph  ------------------------- end

function draw(){
	showData(store.nodes, store.links)
	drawGraph()	
}    

notaIn.style.top = (section.clientHeight - notaIn.clientHeight)/2 + 'px'

loadData().then(draw);