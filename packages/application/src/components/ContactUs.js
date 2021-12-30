import React, { Component } from 'react';
export default class ContactUs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      content: ''
    }
  }
  render() {
    let resumeData = this.props.resumeData;
    return (
      <section id="contact">
          <div className="row section-head">
            <div className="ten columns">
              <p className="lead">
              Feel free to contact me for any work or suggestions below
              </p>
            </div>
          </div>
          <div className="row">
            <aside className="eigth columns footer-widgets">
              <div className="widget">
                <a href = {"mailto:" + resumeData.email}>Email: {resumeData.email}
                </a>
              </div>
            </aside>
          </div>
          <div>        
            <form id="contact-form" onSubmit={this.handleSubmit.bind(this)} method="POST">
          <div className="form-group">
            <label htmlFor="name"></label>
            <input type="text" className="form-control" value={this.state.name} onChange={this.onNameChange.bind(this)} />
          </div>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1"></label>
            <input type="email" className="form-control" aria-describedby="emailHelp" value={this.state.email} onChange={this.onEmailChange.bind(this)} />
          </div>
          <div className="form-group">
            <label htmlFor="content"></label>
            <textarea className="form-control" rows="5" value={this.state.content} onChange={this.onContentChange.bind(this)} />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
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

  onContentChange(event) {
    this.setState({content: event.target.value})
  }

  resetForm(){
    this.setState({name: "", email: "", content: ""})
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT
    fetch(`${apiEndpoint}/submit`, {
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