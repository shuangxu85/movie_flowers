async function drawChart() {
	// @ Data
	const movies = await d3
		.json(
			"./data/movies.json"
			// "https://raw.githubusercontent.com/sxywu/filmflowers/master/movies.json"
		)
		.then((data) => {
			return _.chain(data)
				.map((d) => {
					return {
						title: d.Title,
						released: new Date(d.Released),
						genres: d.Genre.split(", "),
						rating: +d.imdbRating,
						votes: +d.imdbVotes.replace(/,/g, ""),
						rated: d.Rated,
					};
				})
				.sortBy((d) => -d.released)
				.value();
		});

	// @ Rated + petalPaths
	const rated = ["G", "PG", "PG-13", "R"];
	const path = [
		"M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0",
		"M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0",
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
		"M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0",
	];
	const ratedPath = _.zipObject(rated, path); // return to key-value pairs
	// const pathColors = ["#46e276", "#6e94e7", "#b877e9", "#f25d75"];

	const legendW = 1090;
	const legendH = 400;
	const ratedLegendW = 400;
	const calLegendRatedPos = (i) => {
		// for Rated
		return [(ratedLegendW / 4) * i - ratedLegendW / 2 + 50, 0];
	};
	const calLegendPos = (i, width, parameter) => {
		// for legends except Rated
		return [(width / 5) * i - width / 2 + parameter, 0];
	};

	const ratedPathObject = _.map(ratedPath, (key, value) => {
		return { rated: value, path: key };
	});

	const ratedPathDt = _.map(ratedPathObject, (d, i) => {
		return {
			rated: d.rated,
			path: d.path,
			translated: calLegendRatedPos(i),
		};
	});

	// @@ ratedPath + d3
	const ratedLegend = d3
		.select(".header svg")
		.append("g")
		.attr("transform", `translate(${legendW / 2}, 0)`)
		.selectAll("g")
		.data(ratedPathDt)
		.enter()
		.append("g")
		.attr("transform", (d) => `translate(${d.translated})scale(${0.6})`);

	ratedLegend
		.append("path")
		.attr("d", (d) => d.path)
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", "4px");

	ratedLegend
		.append("text")
		.text((d) => d.rated)
		// .attr("transform", (d) => `translate(${d.translated})`)
		.attr("y", 130)
		.attr("text-anchor", "middle")
		.style("font-size", "25px");

	// @ Genres + petalColors
	const topGenres = ["Action", "Adventure", "Comedy", "Drama"];
	const color = ["#ffc8f0", "#cbf2bd", "#afe9ff", "#ffb09e"];
	const genresColor = _.zipObject(topGenres, color);
	genresColor.Other = "#FFF2B4";

	const genresLegendW = 500;
	const genresColorObject = _.map(genresColor, (value, key) => {
		return { genres: key, color: value };
	});

	const genresColorDt = _.map(genresColorObject, (d, i) => {
		return {
			genres: d.genres,
			color: d.color,
			translated: calLegendPos(i, genresLegendW, 25),
		};
	});

	// @@ genresColor + d3
	const genreLegend = d3
		.select(".header svg")
		.append("g")
		.attr("transform", `translate(${legendW / 2}, 100)`)
		.selectAll("g")
		.data(genresColorDt)
		.enter()
		.append("g")
		.attr("transform", (d) => `translate(${d.translated})scale(${0.6})`);

	genreLegend
		.append("circle")
		.attr("cx", 50)
		.attr("cy", 50)
		.attr("r", 50)
		.attr("fill", (d) => d.color);
	genreLegend
		.append("text")
		.text((d) => d.genres)
		.attr("y", 130)
		.attr("x", 50)
		.attr("text-anchor", "middle")
		.style("font-size", "28px");

	// @ Votes + petalNum
	const votesExtent = d3.extent(movies, (d) => d.votes);
	const numScale = d3.scaleQuantize().domain(votesExtent).range(_.range(5, 10)); // return discrete

	const votesLegend = [10000, 400000, 800000, 1200000, 2400000];
	const votesTextLegend = ["1万imdb网站投票", "40万", "80万", "120万", "240万"];
	const pathLegend = [
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
		"M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
	];

	const mapArraysVotes = (a, b, c) => {
		const res = [];
		for (let i = 0; i < a.length; i++) {
			res.push({
				votes: a[i],
				votesText: b[i],
				path: c[i],
			});
		}
		return res;
	};
	const votesPathLegend_P = mapArraysVotes(
		votesLegend,
		votesTextLegend,
		pathLegend
	);
	// console.log(votesPathLegend_P);
	const votesPathLegend = _.map(votesPathLegend_P, (d, i) => {
		const petalNum = numScale(d.votes);
		const pathLegend = d.path;
		return {
			votes: d.votes,
			voteText: d.votesText,
			petalNum: petalNum,
			pathLegend: pathLegend,
			pathAngle: _.times(petalNum, (i) => {
				return { angle: (i / petalNum) * 360, pathLegend };
			}),
			translated: calLegendPos(i, 600, 65),
		};
	});
	// console.table(votesPathLegend);

	// @@ votes + d3
	const votesLegendD3 = d3
		.select(".header svg")
		.append("g")
		.attr("transform", `translate(${legendW / 2}, 250)`)
		.selectAll("g")
		.data(votesPathLegend)
		.enter()
		.append("g")
		.attr("transform", (d) => `translate(${d.translated})scale(${0.4})`);

	votesLegendD3
		.selectAll("path")
		.data((d) => d.pathAngle)
		.enter()
		.append("path")
		.attr("d", (d) => d.pathLegend)
		.attr("transform", (d) => `rotate(${d.angle})`)
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", "4.5px");

	votesLegendD3
		.append("text")
		.text((d) => d.voteText)
		.attr("y", 160)
		// .attr("x", 20)
		.attr("text-anchor", "middle")
		.style("font-size", "42px");

	// @ Rating + petalSize
	const ratingExtent = d3.extent(movies, (d) => d.rating);
	const sizeScale = d3.scaleLinear().domain(ratingExtent).range([0.1, 0.6]); //return continuous

	const ratingNumLegend = [3.7, 5, 6.3, 7.7, 9];
	const ratingTextLegend = [
		"3.7 / 10",
		"5.0 / 10",
		"6.3 / 10",
		"7.7 / 10",
		"9 / 10",
	];
	const ratingPetalNumLegend = [5, 5, 5, 5, 5];

	const mapArraysRating = (a, b, c, d) => {
		const res = [];
		for (let i = 0; i < a.length; i++) {
			res.push({
				rating: a[i],
				ratingText: b[i],
				path: c[i],
				petalNum: d[i],
			});
		}
		return res;
	};

	const ratingSizeLegend_P = mapArraysRating(
		ratingNumLegend,
		ratingTextLegend,
		pathLegend,
		ratingPetalNumLegend
	);
	// console.log(ratingSizeLegend_P);

	const ratingSizeLegend = _.map(ratingSizeLegend_P, (d, i) => {
		const petalSizeLegend = sizeScale(d.rating);
		const petalNum = d.petalNum;
		const pathLegend = d.path;
		return {
			ratingNum: d.rating,
			ratingText: d.ratingText,
			petalSize: petalSizeLegend,
			pathAngle: _.times(petalNum, (i) => {
				return { angle: (i / petalNum) * 360, pathLegend, petalSizeLegend };
			}),
			translated: calLegendPos(i, 750, 65),
		};
	});
	console.log(ratingSizeLegend);

	// @@ rating + d3
	const ratingLegend = d3
		.select(".header svg")
		.append("g")
		.attr("transform", `translate(${legendW / 2}, 390)`)
		.selectAll("g")
		.data(ratingSizeLegend)
		.enter()
		.append("g")
		.attr("transform", (d) => `translate(${d.translated})`);

	ratingLegend
		.selectAll("path")
		.data((d) => d.pathAngle)
		.enter()
		.append("path")
		.attr("d", (d) => d.pathLegend)
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", "5px")
		.attr("transform", (d) => `rotate(${d.angle})scale(${d.petalSizeLegend})`);

	ratingLegend
		.append("text")
		.text((d) => d.ratingText)
		.attr("y", 80)
		// .attr("x", 10)
		.attr("text-anchor", "middle")
		.style("font-size", "20px");

	// @ Grid Position
	const pathWidth = 200;
	const pathHeight = pathWidth;
	const width = 1000;
	const numPerRow = Math.floor(width / pathWidth);
	const calculateGridPos = (i) => {
		// util function that returns [x, y]
		return [
			((i % numPerRow) + 0.5) * pathWidth,
			(Math.floor(i / numPerRow) + 0.5) * pathHeight,
		];
	};

	// @ Flowers dataset
	const dataFlowers = _.map(movies, (d, i) => {
		const color = _.map(d.genres, (d) => {
			return topGenres.indexOf(d) !== -1 ? genresColor[d] : genresColor.Other;
		});
		const colorNum = _.size(d.genres);
		const petalPath = ratedPath[d.rated];
		const petalSize = sizeScale(d.rating);
		const petalNum = numScale(d.votes);

		return {
			title: d.title,
			year: d.released.getFullYear(),
			color,
			colorNum,
			colorAngle: _.times(colorNum, (i) => {
				return {
					angle: (360 * i) / colorNum,
					colorAngleColor: color[i],
				}; // return an array including #(colorNum) objects
			}),
			petalNum,
			petalPath,
			pathAngle: _.times(petalNum, (i) => {
				return { angle: (360 * i) / petalNum, petalPath };
			}),
			petalSize,
			translated: calculateGridPos(i),
		};
	});

	console.table(dataFlowers);

	//Container for the gradients
	const defs = d3.select(".content svg").append("g").append("defs");
	//Filter for the outside glow
	const filter = defs
		.append("filter")
		.attr("id", "motionFilter")
		.style("width", "300%")
		.style("x", "-100%");
	filter
		.append("feGaussianBlur")
		.attr("in", "SourceGraphic")
		.attr("stdDeviation", "8.8");

	const flowers = d3
		.select(".content svg")
		.select("g")
		.selectAll("g")
		.data(dataFlowers)
		.enter()
		.append("g")
		.attr(
			"transform",
			(d, i) => `translate(${d.translated})scale(${d.petalSize || 1})`
		);

	flowers
		.selectAll("circle")
		.data((d) => d.colorAngle)
		.enter()
		.append("circle")
		.attr("cy", -50)
		.attr("cx", 0)
		.attr("r", 63.5)
		.attr("transform", (d) => `rotate(${d.angle})`)
		.attr("fill", (d) => d.colorAngleColor)
		.attr("fill-opacity", 0.66);

	//Apply to your element(s)
	d3.selectAll("circle").style("filter", "url(#motionFilter)");

	flowers
		.selectAll("path")
		.data((d) => d.pathAngle)
		.enter()
		.append("path")
		.attr("d", (d) => d.petalPath)
		.attr("transform", (d) => `rotate(${d.angle})`) // 角度
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", "6")
		// .attr("fill", (d, i) => d3.interpolateWarm(d.angle / 360)) // 颜色
		.attr("fill-opacity", 1);

	const flowersText = d3
		.select(".content .titles")
		.selectAll("div")
		.data(dataFlowers)
		.enter()
		.append("div")
		.text((d) => d.title)
		.style("position", "absolute")
		.style("width", 150 + "px")
		.style("left", (d) => `${d.translated[0] - 75}px`)
		.style("top", (d) => `${d.translated[1] + 60}px`);

	const yearText = d3
		.select(".content .years")
		.selectAll("h1")
		.data(dataFlowers)
		.enter()
		.append("h1")
		.text((d) => `${d.year}年`)
		.style("position", "absolute")
		.style("width", 150 + "px")
		.style("top", (d) => `${d.translated[1] - 20}px`)
		.style("font-size", 30 + "px")
		.style("font-family", "STKaiti");
}

drawChart();
