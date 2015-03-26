"use strict";

var startSocket	= function() {
	var socket = io(window.location.hostname);
	socket.on('test', function (data) {
		console.log('_________________');
		console.log("testing")
		console.log(data);
		console.log('_________________');
	});
	socket.on('change', function (data) {
		console.log('_________________');
		console.log("testing")
		console.log(data);
		console.log('_________________');
	});
}

var SimpleList	= React.createClass({displayName: "SimpleList",
	getInitialState: function() {
        return {
			simpleList: [
				{
					row: 'cargando	...'
				}
			]
        };
    },
	componentDidMount: function() {
		startSocket();
		$.ajax({
			url: '/api/list',
			dataType: 'json',
			success: function(data) {
				console.log('_________________');
				console.log('Simple List data recieved:');
				console.log(data);
				this.setState({simpleList: data});
			}.bind(this),
				error: function(xhr, status, err) {
					console.log('_________________');
					console.log('Data error:');
					console.error(this.props.url, status, err.toString())
			}.bind(this)
		});
	},
	render: function() {
		return (
			React.createElement("span", null, 
				React.createElement("p", null, React.createElement("strong", null, "Pasos para dominar un nuevo lenguaje de programación:")), 
				React.createElement(SimpleListRow, {simpleList: this.state.simpleList})
			)
		);
	}	
});

var SimpleListRow = React.createClass({displayName: "SimpleListRow",
	render: function() {
		console.log('_________________');
		console.log('simpleList rows data:');
		console.log(this.props);
		var rows = this.props.simpleList;
		return (
			React.createElement("ol", null, 
				rows.map(function(element) {
					return (
						React.createElement("li", null, element.message)
					);
				})
			)
		);
	}	
});

React.render(
	React.createElement(SimpleList, null),
	document.getElementById('simpleList')
)