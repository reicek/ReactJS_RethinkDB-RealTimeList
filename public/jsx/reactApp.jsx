"use strict"

var socket		= null;

var startSocket	= function() {
	socket = io(window.location.hostname);
}

var SimpleFilterableList	= React.createClass({
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
			<div>
				<input type='text' placeholder='Filtrar...' onChange={this.updateUserInput}></input>
				<SimpleList url={this.props.url} userInput={this.state.userInput}/>
			</div>
		);
	}
});

var SimpleList = React.createClass({
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
			<span>
				<p><strong>Pasos para dominar un nuevo lenguaje de programación:</strong></p>
				<SimpleListRow simpleList={this.state.simpleList} userInput={this.props.userInput}/>
			</span>
		);
	}	
});

var SimpleListRow = React.createClass({
	render: function() {
		console.log('_________________');
		console.log('simpleList rows props:');
		console.log(this.props);
		var rows = this.props.simpleList;
		var userInput = this.props.userInput;
		return (
			<ol>
				{rows.map(function(element){
					if (element.row){
						if (element.row.toLowerCase().search(userInput.toLowerCase()) > -1){
							console.log("userInput found in simpleList row: "+element.row);
							return (
								<li>{element.row}</li>
							);
						}
						
					}
				})}
			</ol>
		);
	}	
});

React.render(
	<SimpleFilterableList url='simpleList_data.json'/>,
	document.getElementById('simpleList')
)