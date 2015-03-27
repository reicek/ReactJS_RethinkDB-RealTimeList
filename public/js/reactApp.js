"use strict"

var socket		= null;

var startSocket	= function() {
	socket = io(window.location.hostname);
}

var SimpleFilterableList	= React.createClass({displayName: "SimpleFilterableList",
	getInitialState: function() {
        return {
			userInput: ""
        };
    },
	updateUserInput: function(input){
		console.log('_________________');
		console.log('User search input:');
		console.log(input.target.value);
		this.setState({userInput: input.target.value});
	},
	render: function(){
		return (
			React.createElement("div", null, 
				React.createElement("input", {type: "text", placeholder: "Filtrar...", onChange: this.updateUserInput}), 
				React.createElement(SimpleList, {url: this.props.url, userInput: this.state.userInput})
			)
		);
	}
});

var SimpleList = React.createClass({displayName: "SimpleList",
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
		var instance = this;
		$.ajax({
			url: '/api/list',
			dataType: 'json',
			success: function(data) {
				console.log('_________________');
				console.log('Simple List data recieved:');
				console.log(data);
				instance.setState({simpleList: data});
			}.bind(instance),
				error: function(xhr, status, err) {
					console.log('_________________');
					console.log('Data error:');
					console.error(instance.props.url, status, err.toString())
			}.bind(instance)
		});
		socket.on('change', function (data) {
			console.log('_________________');
			console.log("Change")
			console.log(data);
			console.log('_________________');
			$.ajax({
				url: '/api/list',
				dataType: 'json',
				success: function(data) {
					console.log('_________________');
					console.log('Simple List data recieved:');
					console.log(data);
					instance.setState({simpleList: data});
				}.bind(instance),
					error: function(xhr, status, err) {
						console.log('_________________');
						console.log('Data error:');
						console.error(instance.props.url, status, err.toString())
				}.bind(instance)
			});
		});
	},
	render: function() {
		return (
			React.createElement("span", null, 
				React.createElement("p", null, React.createElement("strong", null, "Pasos para dominar un nuevo lenguaje de programación:")), 
				React.createElement(SimpleListRow, {simpleList: this.state.simpleList, userInput: this.props.userInput})
			)
		);
	}	
});

var SimpleListRow = React.createClass({displayName: "SimpleListRow",
	render: function() {
		console.log('_________________');
		console.log('simpleList rows props:');
		console.log(this.props);
		var rows = this.props.simpleList;
		var userInput = this.props.userInput;
		return (
			React.createElement("ol", null, 
				rows.map(function(element){
					if (element.row){
						if (element.row.toLowerCase().search(userInput.toLowerCase()) > -1){
							console.log("userInput found in simpleList row: "+element.row);
							return (
								React.createElement("li", null, element.row)
							);
						}
						
					}
				})
			)
		);
	}	
});

React.render(
	React.createElement(SimpleFilterableList, {url: "simpleList_data.json"}),
	document.getElementById('simpleList')
)