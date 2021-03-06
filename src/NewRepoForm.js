import React, {Component} from "react";
import api from "./lib/apiGraphQL";
import RepoCount from "./Count";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import {Redirect} from "react-router";

class NewRepoForm extends Component {
  constructor(props) {
    super(props);
    this.setUrl = this.setUrl.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleForksChange = this.handleForksChange.bind(this);
    this.handleIssuesChange = this.handleIssuesChange.bind(this);
    this.handleStarsChange = this.handleStarsChange.bind(this);
    this.handleOwnerChange = this.handleOwnerChange.bind(this);
    this.handleContributorsChange = this.handleContributorsChange.bind(this);
    this.fetchRepoData = this.fetchRepoData.bind(this);
    this.sendDataToApollo = this.sendDataToApollo.bind(this);
    this.state = {
      data: {},
      uri: "",
      contributors: "",
      name: "",
      url: "",
      description: "",
      forks: "",
      owner: "",
      stargazers: "",
      issues: "",
      submitted: false
    };
  }

  handleNameChange(e) {
    this.setState({name: e.target.value});
  }

  handleUrlChange(e) {
    this.setState({url: e.target.value});
  }

  handleDescriptionChange(e) {
    this.setState({description: e.target.value});
  }

  handleForksChange(e) {
    this.setState({forks: e.target.value});
  }

  handleIssuesChange(e) {
    this.setState({issues: e.target.value});
  }

  handleStarsChange(e) {
    this.setState({stargazers: e.target.value});
  }

  handleOwnerChange(e) {
    this.setState({owner: e.target.value});
  }

  handleContributorsChange(e) {
    this.setState({contributors: e.target.value});
  }

  sendDataToApollo() {
    const {name, url, description, forks, owner, stargazers, issues, contributors} = this.state;

    this.props.mutate({variables: {
      name,
      url,
      owner,
      contributors,
      forks,
      stargazers,
      issues,
      description,
    }})
      .then(() => {
        this.setState(
          {data: {}, description: "", owner: "", stargazers: "", forks:
           "", issues: "", contributors: "", uri: "", url: "", name: "", submitted: true}
        );
      })
      .catch((error) => console.error(`An Error Occurred: ${error}`));
  }

  setUrl(e) {
    this.setState({url: e.target.value});
  }

  fetchRepoData() {
    const url = this.state.url.split("/");
    api.fetchRepositoryData(url[3], url[4]).then(
      (response) => {
        const data = response.data.data.repositoryOwner.repository;
        const {name, url, description, forks, owner, stargazers, issues} = data;
        this.setState({
          data: data,
          name: name,
          url: url,
          description: description,
          forks: forks.totalCount,
          owner: owner.login,
          stargazers: stargazers.totalCount,
          issues: issues.totalCount
        });
      }
    ).catch((error) => console.error(error));
  }

  render() {
    const {count} = this.props;
    const {
      contributors, name, url, description, forks, owner, stargazers,
      issues, submitted
    } = this.state;

    return !submitted ?
      <div className="Form">
        <h1 className="title">Enter a GitHub URL</h1>
        <p>
          Add a url to a GitHub repository you would like to track here and we can fetch the data
        </p>
        <div className="">
          <div name="">
            <input className="utility-input urlForm" type="url" onChange={this.setUrl} value={url} placeholder="https://github.com/netlify/netlify-cms"/>
            <button className="button-ui-default" onClick={this.fetchRepoData}>Fetch repository data</button>
          </div>
          <div className="grid-full form">
            <input className="utility-input support-input-form" placeholder="Name" onChange={this.handleNameChange} value={name} type="text" name="sitename" required />
            <input className="utility-input boxed-input light-shadow" placeholder="Link" onChange={this.handleUrlChange} value={url} type="url" name="contentlink" required />
            <input className="utility-input boxed-input light-shadow" placeholder="Owner" onChange={this.handleOwnerChange} value={owner} name="repoowner" required />
            <input className="utility-input boxed-input light-shadow" placeholder="Contributors" onChange={this.handleContributorsChange} value={contributors} name="contributors" />
            <input className="utility-input boxed-input light-shadow" placeholder="Stars" onChange={this.handleStarsChange} value={stargazers} type="text" name="stars" required />
            <input className="utility-input boxed-input light-shadow" placeholder="Forks" onChange={this.handleForksChange} value={forks} type="text" name="forks" required />
            <input className="utility-input boxed-input light-shadow" placeholder="Issues" onChange={this.handleIssuesChange} value={issues} type="text" name="issues" required />
            <textarea className="utility-input boxed-input text-box light-shadow" onChange={this.handleDescriptionChange} value={description} type="text" placeholder="Repository Description" name="notes" />
            <RepoCount count={count} />
            <button onClick={this.sendDataToApollo} className="button-ui-primary"><span className="icon-plus" /> Add repository to your list</button>
          </div>
          <div className="shadow" />
        </div>
      </div>
    : <Redirect to="/"/>;
  }
}

const createFormMutation = gql`
  mutation createRepository($name: String!, $url: String!, $owner: String!, $stargazers: Int, $issues: Int, $forks: Int, $description: String) {
    createRepository(name: $name, url: $url, owner: $owner, stargazers: $stargazers, issues: $issues, forks: $forks, description: $description) {
      id
    }
  }
`;
const FormMutation = graphql(createFormMutation)(NewRepoForm);

export default FormMutation;
