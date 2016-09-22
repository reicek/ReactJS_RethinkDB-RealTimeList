"use strict"
var socket                 = null;
var startSocket            = function() {
   socket   = io(window.location.hostname);
}
var SimpleFilterableList   = React.createClass({displayName: "SimpleFilterableList",
   componentDidMount : function() {
      startSocket();
      var instance     = this;
      var downloadData = function(){
         $.ajax({
            url      : '/api/list',
            dataType : 'json',
            success  : function(data) {
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
      };
      downloadData();
      socket.on('change', function (data) {
         console.log('_________________');
         console.log("Change")
         console.log(data);
         downloadData();
      });
   },
   getInitialState   : function() {
      return {
         userInput   : "",
         simpleList  : [
            {
               row : 'Loading...'
            }
         ]
      };
   },
   updateUserInput   : function(input){
      console.log('_________________');
      console.log('User search input:');
      console.log(input.target.value);
      this.setState({userInput: input.target.value});
   },
   favToInput        : function(){
      console.log('_________________');
      console.log('Convertig fav to input');
      document.getElementById("newElement").className    = '';
      document.getElementById("newElement").placeholder  = 'Add new step...';
   },
   sendNewElement    : function(key){
      if (key.key == "Enter"){
         console.log('_________________');
         console.log('Sending new element:');
         console.log(document.getElementById('newElement').value);
         console.log('Convertig input to fav');
         $.ajax({
            url   : "/api/add",
            type  : "post",
            data  : {"row":document.getElementById('newElement').value}
         });
         document.getElementById('newElement').value        = '';
         document.getElementById("newElement").className    = 'fav';
         document.getElementById("newElement").placeholder  = "+";
         document.getElementById("userInput").focus();
      };
   },
   render            : function(){
      return (
         React.createElement("div", null, 
            React.createElement("input", {
               id: "userInput", 
               type: "text", 
               placeholder: "Filter...", 
               onChange: this.updateUserInput}
            ), 
            React.createElement(SimpleList, {
               simpleList: this.state.simpleList, 
               userInput: this.state.userInput}), 
            React.createElement("input", {
               id: "newElement", 
               type: "text", 
               placeholder: "+", 
               onKeyPress: this.sendNewElement, 
               onClick: this.favToInput, 
               className: "fav"}
            )
         )
      );
   }
});
var SimpleList             = React.createClass({displayName: "SimpleList",
   render: function() {
      return (
         React.createElement("span", null, 
            React.createElement("p", null, React.createElement("strong", null, "Steps to master a new programming language:")), 
            React.createElement(SimpleListRow, {
               simpleList: this.props.simpleList, 
               userInput: this.props.userInput})
         )
      );
   }
});
var SimpleListRow          = React.createClass({displayName: "SimpleListRow",
   render: function() {
      console.log('_________________');
      console.log('simpleList rows props:');
      console.log(this.props);
      var rows       = this.props.simpleList;
      var userInput  = this.props.userInput;
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
   React.createElement(SimpleFilterableList, null),
   document.getElementById('simpleList')
)
