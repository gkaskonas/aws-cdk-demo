import React, { Component } from 'react';
export default class ContactUs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      message: ''
    }
  }
  render() {
    return (
      <section id="contact">
          <div className="row section-head">
            <div className="ten columns">
              <p className="lead">
              Feel free to contact me for any work or suggestions below
              </p>
            </div>
          </div>
          <div>        
            <form onSubmit={this.handleSubmit.bind(this)} method="POST">
          <div className="input">
            <input type="text" className="form-control" placeholder="Name" value={this.state.name} onChange={this.onNameChange.bind(this)} />
          </div>
          <div className="input">
            <input type="email" className="form-control" placeholder="Email" aria-describedby="emailHelp" value={this.state.email} onChange={this.onEmailChange.bind(this)} />
          </div>
          <div className="input">
            <textarea className="form-control" rows="5" placeholder="Message..." value={this.state.message} onChange={this.onMessageChange.bind(this)} />
          </div>
          <button className="submit">Submit</button>
        </form></div>
        </section>
        );
  }
  onNameChange(event) {
    this.setState({name: event.target.value})
  }

  onEmailChange(event) {
    this.setState({email: event.target.value})
  }

  onMessageChange(event) {
    this.setState({message: event.target.value})
  }

  resetForm(){
    this.setState({name: "", email: "", message: ""})
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const apiUrl = "https://axv8xnp8me.execute-api.eu-west-1.amazonaws.com/prod"
    fetch(`${apiUrl}/submit`, {
        method: "POST",
        body: JSON.stringify(this.state),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then(
        ).then((response)=> {
          console.log(response)
      if (response.status === 200) {
        alert("Message Sent.");
        this.resetForm()
      } else {
        alert("Message failed to send.")
      }
    })
  }
}