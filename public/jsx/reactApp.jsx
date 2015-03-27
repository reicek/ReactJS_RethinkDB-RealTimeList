"use strict";

var socket		= null;

var startSocket	= function() {
	socket = io(window.location.hostname);
}

var SimpleList	= React.createClass({
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
				<SimpleListRow simpleList={this.state.simpleList}/>
			</span>
		);
	}	
});

var SimpleListRow = React.createClass({
	render: function() {
		console.log('_________________');
		console.log('simpleList rows data:');
		console.log(this.props);
		var rows = this.props.simpleList;
		return (
			<ol>
				{rows.map(function(element) {
					return (
						<li>{element.message}</li>
					);
				})}
			</ol>
		);
	}	
});

React.render(
	<SimpleList />,
	document.getElementById('simpleList')
)